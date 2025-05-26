import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./User";
import { IProfessional } from "./Professional";
import { IAppointment } from "./Appointment";

export interface IReview extends Document {
  clientId: IUser["_id"];
  professionalId: IProfessional["_id"];
  appointmentId: IAppointment["_id"];
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    professionalId: {
      type: Schema.Types.ObjectId,
      ref: "Professional",
      required: true,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

// Middleware to update professional's rating on review creation/update
reviewSchema.post("save", async function (doc) {
  try {
    const Professional = mongoose.model("Professional");
    const reviews = await mongoose
      .model("Review")
      .find({ professionalId: doc.professionalId });

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length ? totalRating / reviews.length : 0;

    await Professional.findByIdAndUpdate(doc.professionalId, {
      rating: averageRating,
      reviewCount: reviews.length,
    });
  } catch (error) {
    console.error("Error updating professional rating:", error);
  }
});

export default mongoose.model<IReview>("Review", reviewSchema);
