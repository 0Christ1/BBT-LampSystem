import {
  applicationNoExists,
  countApplicationsByPrefix
} from "./applicationStore.js";

const pad = (value) => String(value).padStart(2, "0");

const formatDateCode = (date = new Date()) => {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  return `${year}${month}${day}`;
};

export const generateApplicationNo = async (planCode) => {
  const prefix = `BBT${formatDateCode()}${planCode}`;
  let sequence = (await countApplicationsByPrefix(prefix)) + 1;
  let applicationNo = `${prefix}${String(sequence).padStart(3, "0")}`;

  while (await applicationNoExists(applicationNo)) {
    sequence += 1;
    applicationNo = `${prefix}${String(sequence).padStart(3, "0")}`;
  }

  return applicationNo;
};
