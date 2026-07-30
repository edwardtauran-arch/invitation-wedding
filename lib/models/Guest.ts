import mongoose, { Schema, models } from "mongoose";

const guestSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Belum Dikirim", "Terkirim"],
      default: "Belum Dikirim",
    },
    sentAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const Guest = models.Guest || mongoose.model("Guest", guestSchema);
export default Guest;
