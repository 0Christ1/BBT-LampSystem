import mongoose from "mongoose";

const lampApplicationSchema = new mongoose.Schema(
  {
    applicationNo: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    lampType: {
      type: String,
      required: true,
      enum: ["peace", "wealth"]
    },
    lampLabel: {
      type: String,
      required: true
    },
    planId: {
      type: String,
      required: true
    },
    planLabel: {
      type: String,
      required: true
    },
    planCode: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: "USD"
    },
    applicantName: {
      type: String,
      required: true,
      trim: true
    },
    dharmaName: {
      type: String,
      trim: true,
      default: ""
    },
    birthday: {
      type: String,
      trim: true,
      default: ""
    },
    region: {
      type: String,
      required: true,
      enum: ["usa", "asia", "other"]
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    contact: {
      type: String,
      trim: true,
      default: ""
    },
    donorName: {
      type: String,
      trim: true,
      default: ""
    },
    companyName: {
      type: String,
      trim: true,
      default: ""
    },
    greatPatronName: {
      type: String,
      trim: true,
      default: ""
    },
    familyMembers: {
      type: String,
      trim: true,
      default: ""
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["offline_transfer"]
    },
    status: {
      type: String,
      default: "pending_payment",
      enum: ["pending_payment", "paid", "cancelled"]
    }
  },
  {
    timestamps: true
  }
);

export const LampApplication = mongoose.model(
  "LampApplication",
  lampApplicationSchema
);
