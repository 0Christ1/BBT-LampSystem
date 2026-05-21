import { Router } from "express";
import { findLampSelection } from "../data/lampOptions.js";
import { generateApplicationNo } from "../services/applicationNumber.js";
import {
  createApplication,
  findApplicationByLogin
} from "../services/applicationStore.js";

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
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const getApplicationProfile = (lampType, planId) => {
  if (lampType === "wealth" && planId === "company") {
    return {
      primaryField: "companyName",
      primaryLabel: "公司名字",
      primaryError: "请填写公司名字。"
    };
  }

  if (lampType === "wealth" && planId === "great-patron") {
    return {
      primaryField: "greatPatronName",
      primaryLabel: "大功德主姓名",
      primaryError: "请填写大功德主姓名。"
    };
  }

  return {
    primaryField: "donorName",
    primaryLabel: "点灯功德主姓名",
    primaryError: "请填写点灯功德主姓名。"
  };
};

const validatePayload = (body) => {
  const errors = {};
  const selection = findLampSelection(body.lampType, body.planId);
  const profile = selection
    ? getApplicationProfile(selection.lamp.id, selection.plan.id)
    : null;

  if (!selection) {
    errors.selection = "请选择有效的光明灯类型和功德项目。";
  }

  if (!clean(body.applicantName)) {
    errors.applicantName = "请填写姓名。";
  }

  if (!["usa", "asia", "other"].includes(body.region)) {
    errors.region = "请选择地区。";
  }

  if (!clean(body.email)) {
    errors.email = "请填写电子邮箱。";
  } else if (!isValidEmail(clean(body.email))) {
    errors.email = "请填写有效的电子邮箱。";
  }

  if (profile && !clean(body[profile.primaryField])) {
    errors[profile.primaryField] = profile.primaryError;
  }

  if (
    selection?.lamp.id === "peace" &&
    selection?.plan.id === "family" &&
    !clean(body.familyMembers)
  ) {
    errors.familyMembers = "请填写家人名单。";
  }

  if (body.paymentMethod !== "offline_transfer") {
    errors.paymentMethod =
      "线上信用卡付款暂未开放，请选择汇款/现金/Zelle/支票/汇票/银行本票。";
  }

  return { errors, selection, profile };
};

const toPlainApplication = (application) => {
  if (typeof application?.toObject === "function") {
    return application.toObject();
  }

  return application;
};

const serializeApplication = (application) => {
  const record = toPlainApplication(application);
  const profile = getApplicationProfile(record.lampType, record.planId);

  return {
    applicationNo: record.applicationNo,
    lampType: record.lampType,
    lampLabel: record.lampLabel,
    planId: record.planId,
    planLabel: record.planLabel,
    duration: record.duration,
    amount: record.amount,
    currency: record.currency,
    applicantName: record.applicantName,
    dharmaName: record.dharmaName,
    birthday: record.birthday,
    region: record.region,
    regionLabel: regionLabels[record.region],
    email: record.email,
    phone: record.phone,
    contact: record.email,
    donorName: record.donorName,
    companyName: record.companyName,
    greatPatronName: record.greatPatronName,
    familyMembers: record.familyMembers,
    primaryField: profile.primaryField,
    primaryLabel: profile.primaryLabel,
    primaryName: record[profile.primaryField],
    paymentMethod: record.paymentMethod,
    paymentLabel: paymentLabels[record.paymentMethod],
    status: record.status,
    createdAt: record.createdAt
  };
};

applicationRoutes.post("/login", async (req, res, next) => {
  try {
    const applicationNo = clean(req.body.applicationNo).toUpperCase();
    const contact = clean(req.body.contact);

    if (!applicationNo || !contact) {
      return res.status(400).json({
        message: "请填写申请编号和登记时使用的邮箱或手机号码。"
      });
    }

    const application = await findApplicationByLogin({
      applicationNo,
      contact
    });

    if (!application) {
      return res.status(404).json({
        message: "未查询到点灯申请，请确认申请编号和联系方式是否正确。"
      });
    }

    return res.json({
      message: "查询成功。",
      data: serializeApplication(application)
    });
  } catch (error) {
    next(error);
  }
});

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
    const applicationNo = await generateApplicationNo({
      lampType: lamp.id,
      planCode: plan.code
    });

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
      email: clean(req.body.email).toLowerCase(),
      phone: clean(req.body.phone),
      contact: clean(req.body.email).toLowerCase(),
      donorName: clean(req.body.donorName),
      companyName: clean(req.body.companyName),
      greatPatronName: clean(req.body.greatPatronName),
      familyMembers: clean(req.body.familyMembers),
      paymentMethod: "offline_transfer",
      status: "pending_payment"
    });

    return res.status(201).json({
      message: "点灯申请已成功提交。",
      data: serializeApplication(application)
    });
  } catch (error) {
    next(error);
  }
});
