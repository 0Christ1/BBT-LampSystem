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
    contact: {
      type: String,
      required: true,
      trim: true
    },
    donorName: {
      type: String,
      required: true,
      trim: true
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
