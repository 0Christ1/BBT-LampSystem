import {
  applicationNoExists,
  countApplicationsByYearAndLampType
} from "./applicationStore.js";

const pad = (value) => String(value).padStart(2, "0");

const formatDateCode = (date = new Date()) => {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  return `${year}${month}${day}`;
};

const formatYearCode = (date = new Date()) => String(date.getFullYear());

export const generateApplicationNo = async ({ lampType, planCode }) => {
  const now = new Date();
  const dateCode = formatDateCode(now);
  const yearCode = formatYearCode(now);
  const prefix = `BBT${dateCode}${planCode}`;
  let sequence = (await countApplicationsByYearAndLampType(yearCode, lampType)) + 1;
  let applicationNo = `${prefix}${String(sequence).padStart(3, "0")}`;

  while (await applicationNoExists(applicationNo)) {
    sequence += 1;
    applicationNo = `${prefix}${String(sequence).padStart(3, "0")}`;
  }

  return applicationNo;
};
