import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./User";

export interface INotification extends Document {
  userId: IUser["_id"];
  type:
    | "appointment_reminder"
    | "appointment_confirmation"
    | "appointment_cancellation"
    | "new_review"
    | "system";
  title: string;
  message: string;
  read: boolean;
  relatedId?: mongoose.Types.ObjectId; // Related document ID (appointment, review, etc.)
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "appointment_reminder",
        "appointment_confirmation",
        "appointment_cancellation",
        "new_review",
        "system",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    relatedId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true }
);

// Index for quick lookup of unread notifications
notificationSchema.index({ userId: 1, read: 1 });

export default mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
