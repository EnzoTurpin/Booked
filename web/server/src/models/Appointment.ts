import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./User";
import { IProfessional } from "./Professional";

export interface IAppointment extends Document {
  clientId: IUser["_id"];
  professionalId: IUser["_id"];
  date: Date;
  startTime: string;
  endTime: string;
  status:
    | "pending"
    | "confirmed"
    | "scheduled"
    | "completed"
    | "cancelled"
    | "no-show";
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    professionalId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // Format: "HH:MM"
    endTime: { type: String, required: true }, // Format: "HH:MM"
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "scheduled",
        "completed",
        "cancelled",
        "no-show",
      ],
      default: "scheduled",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

// Compound index to prevent double booking for professionals
appointmentSchema.index(
  { professionalId: 1, date: 1, startTime: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["scheduled", "completed"] } },
  }
);

export default mongoose.model<IAppointment>("Appointment", appointmentSchema);
