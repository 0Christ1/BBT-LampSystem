import crypto from "node:crypto";
import { isDatabaseConnected } from "../config/database.js";
import { LampApplication } from "../models/LampApplication.js";

const memoryApplications = [];

export const countApplicationsByPrefix = async (prefix) => {
  if (isDatabaseConnected()) {
    return LampApplication.countDocuments({
      applicationNo: { $regex: `^${prefix}` }
    });
  }

  return memoryApplications.filter((item) =>
    item.applicationNo.startsWith(prefix)
  ).length;
};

export const applicationNoExists = async (applicationNo) => {
  if (isDatabaseConnected()) {
    return Boolean(await LampApplication.exists({ applicationNo }));
  }

  return memoryApplications.some((item) => item.applicationNo === applicationNo);
};

export const createApplication = async (payload) => {
  if (isDatabaseConnected()) {
    return LampApplication.create(payload);
  }

  const now = new Date().toISOString();
  const application = {
    _id: crypto.randomUUID(),
    ...payload,
    createdAt: now,
    updatedAt: now
  };

  memoryApplications.push(application);
  return application;
};
