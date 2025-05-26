import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./User";

export interface IProfessional extends Document {
  userId: IUser["_id"];
  profession: string;
  bio: string;
  services: mongoose.Types.ObjectId[];
  availability: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const professionalSchema = new Schema<IProfessional>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    profession: { type: String, required: true },
    bio: { type: String, required: true },
    services: [{ type: Schema.Types.ObjectId, ref: "Service" }],
    availability: [
      {
        dayOfWeek: { type: Number, min: 0, max: 6, required: true }, // 0: Sunday, 1: Monday, etc.
        startTime: { type: String, required: true }, // Format: "HH:MM"
        endTime: { type: String, required: true }, // Format: "HH:MM"
      },
    ],
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IProfessional>(
  "Professional",
  professionalSchema
);
