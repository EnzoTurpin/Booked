import mongoose, { Document, Schema } from "mongoose";
import { IProfessional } from "./Professional";

export interface IService extends Document {
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  professionalId: IProfessional["_id"];
  category: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true, min: 5 }, // Minimum 5 minutes
    price: { type: Number, required: true, min: 0 },
    professionalId: {
      type: Schema.Types.ObjectId,
      ref: "Professional",
      required: true,
    },
    category: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IService>("Service", serviceSchema);
