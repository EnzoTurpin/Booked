import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./User";
import { IProfessional } from "./Professional";
import { IService } from "./Service";

export interface IAppointment extends Document {
  clientId: IUser["_id"];
  professionalId: IProfessional["_id"];
  serviceId: IService["_id"];
  date: Date;
  startTime: string;
  endTime: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  notes?: string;
  paymentStatus: "pending" | "paid" | "refunded";
  paymentAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    professionalId: {
      type: Schema.Types.ObjectId,
      ref: "Professional",
      required: true,
    },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // Format: "HH:MM"
    endTime: { type: String, required: true }, // Format: "HH:MM"
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "no-show"],
      default: "scheduled",
    },
    notes: { type: String },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    paymentAmount: { type: Number, required: true, min: 0 },
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
