import mongoose, { Schema, Document } from "mongoose";

export interface IBanNotification extends Document {
  userId: mongoose.Types.ObjectId;
  username: string;
  reason: string;
  createdAt: Date;
}

const BanNotificationSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IBanNotification>(
  "BanNotification",
  BanNotificationSchema
);
