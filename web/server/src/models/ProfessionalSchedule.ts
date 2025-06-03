import mongoose, { Schema, Document } from "mongoose";

// Interface pour un créneau journalier
export interface IDaySchedule {
  isOpen: boolean;
  startTime: string;
  endTime: string;
}

// Interface pour l'emploi du temps hebdomadaire
export interface IProfessionalSchedule extends Document {
  professionalId: mongoose.Types.ObjectId;
  monday: IDaySchedule;
  tuesday: IDaySchedule;
  wednesday: IDaySchedule;
  thursday: IDaySchedule;
  friday: IDaySchedule;
  saturday: IDaySchedule;
  sunday: IDaySchedule;
  createdAt: Date;
  updatedAt: Date;
}

// Schéma pour un créneau journalier
const DayScheduleSchema = new Schema({
  isOpen: {
    type: Boolean,
    default: true,
  },
  startTime: {
    type: String,
    default: "09:00",
  },
  endTime: {
    type: String,
    default: "17:00",
  },
});

// Schéma principal pour l'emploi du temps hebdomadaire
const ProfessionalScheduleSchema = new Schema(
  {
    professionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professional",
      required: true,
      unique: true,
    },
    monday: {
      type: DayScheduleSchema,
      default: { isOpen: true, startTime: "09:00", endTime: "17:00" },
    },
    tuesday: {
      type: DayScheduleSchema,
      default: { isOpen: true, startTime: "09:00", endTime: "17:00" },
    },
    wednesday: {
      type: DayScheduleSchema,
      default: { isOpen: true, startTime: "09:00", endTime: "17:00" },
    },
    thursday: {
      type: DayScheduleSchema,
      default: { isOpen: true, startTime: "09:00", endTime: "17:00" },
    },
    friday: {
      type: DayScheduleSchema,
      default: { isOpen: true, startTime: "09:00", endTime: "17:00" },
    },
    saturday: {
      type: DayScheduleSchema,
      default: { isOpen: true, startTime: "09:00", endTime: "12:00" },
    },
    sunday: {
      type: DayScheduleSchema,
      default: { isOpen: false, startTime: "09:00", endTime: "17:00" },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProfessionalSchedule>(
  "ProfessionalSchedule",
  ProfessionalScheduleSchema
);
