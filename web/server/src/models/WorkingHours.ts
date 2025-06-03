import mongoose, { Document, Schema } from "mongoose";

export interface IWorkingHours extends Document {
  professionalId: mongoose.Types.ObjectId;
  day: number; // 0 (dimanche) à 6 (samedi)
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  isWorking: boolean;
}

const workingHoursSchema = new Schema<IWorkingHours>({
  professionalId: {
    type: Schema.Types.ObjectId,
    ref: "Professional",
    required: true,
  },
  day: { type: Number, required: true, min: 0, max: 6 },
  startTime: {
    type: String,
    required: true,
    match: /^([01]\d|2[0-3]):([0-5]\d)$/,
  },
  endTime: {
    type: String,
    required: true,
    match: /^([01]\d|2[0-3]):([0-5]\d)$/,
  },
  isWorking: { type: Boolean, default: true },
});

workingHoursSchema.index({ professionalId: 1, day: 1 }, { unique: true });

export default mongoose.model<IWorkingHours>(
  "WorkingHours",
  workingHoursSchema
);
