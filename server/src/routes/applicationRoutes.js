import { Router } from "express";
import { findLampSelection } from "../data/lampOptions.js";
import { generateApplicationNo } from "../services/applicationNumber.js";
import { createApplication } from "../services/applicationStore.js";

export const applicationRoutes = Router();

const regionLabels = {
  usa: "美国",
  asia: "亚洲",
  other: "其他"
};

const paymentLabels = {
  offline_transfer: "汇款/现金/Zelle/支票/汇票/银行本票"
};

const clean = (value) => String(value ?? "").trim();

const validatePayload = (body) => {
  const errors = {};
  const selection = findLampSelection(body.lampType, body.planId);

  if (!selection) {
    errors.selection = "请选择有效的光明灯类型和功德项目。";
  }

  if (!clean(body.applicantName)) {
    errors.applicantName = "请填写姓名。";
  }

  if (!["usa", "asia", "other"].includes(body.region)) {
    errors.region = "请选择地区。";
  }

  if (!clean(body.contact)) {
    errors.contact = "请填写手机号码或电子邮箱。";
  }

  if (!clean(body.donorName)) {
    errors.donorName = "请填写点灯功德主姓名。";
  }

  if (body.paymentMethod !== "offline_transfer") {
    errors.paymentMethod =
      "线上信用卡付款暂未开放，请选择汇款/现金/Zelle/支票/汇票/银行本票。";
  }

  return { errors, selection };
};

applicationRoutes.post("/", async (req, res, next) => {
  try {
    const { errors, selection } = validatePayload(req.body);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: "点灯资料尚未填写完整。",
        errors
      });
    }

    const { lamp, plan } = selection;
    const applicationNo = await generateApplicationNo(plan.code);

    const application = await createApplication({
      applicationNo,
      lampType: lamp.id,
      lampLabel: lamp.label,
      planId: plan.id,
      planLabel: plan.label,
      planCode: plan.code,
      duration: plan.duration,
      amount: plan.amount,
      currency: "USD",
      applicantName: clean(req.body.applicantName),
      dharmaName: clean(req.body.dharmaName),
      birthday: clean(req.body.birthday),
      region: req.body.region,
      contact: clean(req.body.contact),
      donorName: clean(req.body.donorName),
      paymentMethod: "offline_transfer",
      status: "pending_payment"
    });

    return res.status(201).json({
      message: "点灯申请已成功提交。",
      data: {
        applicationNo: application.applicationNo,
        lampType: application.lampType,
        lampLabel: application.lampLabel,
        planId: application.planId,
        planLabel: application.planLabel,
        duration: application.duration,
        amount: application.amount,
        currency: application.currency,
        applicantName: application.applicantName,
        dharmaName: application.dharmaName,
        birthday: application.birthday,
        region: application.region,
        regionLabel: regionLabels[application.region],
        contact: application.contact,
        donorName: application.donorName,
        paymentMethod: application.paymentMethod,
        paymentLabel: paymentLabels[application.paymentMethod],
        status: application.status,
        createdAt: application.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
});
