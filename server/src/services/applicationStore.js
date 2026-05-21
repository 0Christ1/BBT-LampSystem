import crypto from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { isDatabaseConnected } from "../config/database.js";
import { LampApplication } from "../models/LampApplication.js";

const storageFile = fileURLToPath(
  new URL("../../storage/applications.json", import.meta.url)
);
let localApplications = null;

const loadLocalApplications = async () => {
  if (localApplications) {
    return localApplications;
  }

  try {
    const content = await readFile(storageFile, "utf8");
    localApplications = JSON.parse(content);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }

    localApplications = [];
    await saveLocalApplications(localApplications);
  }

  return localApplications;
};

const saveLocalApplications = async (applications) => {
  await mkdir(dirname(storageFile), { recursive: true });
  await writeFile(storageFile, JSON.stringify(applications, null, 2));
};

export const countApplicationsByPrefix = async (prefix) => {
  if (isDatabaseConnected()) {
    return LampApplication.countDocuments({
      applicationNo: { $regex: `^${prefix}` }
    });
  }

  const applications = await loadLocalApplications();

  return applications.filter((item) =>
    item.applicationNo.startsWith(prefix)
  ).length;
};

export const countApplicationsByYearAndLampType = async (yearCode, lampType) => {
  if (isDatabaseConnected()) {
    return LampApplication.countDocuments({
      applicationNo: { $regex: `^BBT${yearCode}` },
      lampType
    });
  }

  const applications = await loadLocalApplications();

  return applications.filter(
    (item) =>
      item.lampType === lampType &&
      item.applicationNo.startsWith(`BBT${yearCode}`)
  ).length;
};

export const applicationNoExists = async (applicationNo) => {
  if (isDatabaseConnected()) {
    return Boolean(await LampApplication.exists({ applicationNo }));
  }

  const applications = await loadLocalApplications();

  return applications.some((item) => item.applicationNo === applicationNo);
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

  const applications = await loadLocalApplications();
  applications.push(application);
  await saveLocalApplications(applications);

  return application;
};

export const findApplicationByLogin = async ({ applicationNo, contact }) => {
  const normalizedApplicationNo = String(applicationNo ?? "").trim().toUpperCase();
  const normalizedContact = String(contact ?? "").trim().toLowerCase();
  const rawContact = String(contact ?? "").trim();

  if (!normalizedApplicationNo || !normalizedContact) {
    return null;
  }

  if (isDatabaseConnected()) {
    return LampApplication.findOne({
      applicationNo: normalizedApplicationNo,
      $or: [
        { email: normalizedContact },
        { contact: normalizedContact },
        { phone: rawContact }
      ]
    });
  }

  const applications = await loadLocalApplications();

  return applications.find((item) => {
    const matchesApplicationNo = item.applicationNo === normalizedApplicationNo;
    const matchesEmail =
      String(item.email ?? item.contact ?? "").toLowerCase() ===
      normalizedContact;
    const matchesPhone = String(item.phone ?? "").trim() === rawContact;

    return matchesApplicationNo && (matchesEmail || matchesPhone);
  });
};
