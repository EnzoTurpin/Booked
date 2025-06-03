const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["client", "professional", "professionnal", "admin"],
      default: "client",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    hasUnbanRequest: {
      type: Boolean,
      default: false,
    },
    unbanRequestDate: {
      type: Date,
      default: null,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpires: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware pour s'assurer que isActive et isApproved sont toujours définis
userSchema.pre("save", function (next) {
  // S'assurer que isActive est défini
  if (this.isActive === undefined) {
    this.isActive = true;
  }

  // S'assurer que isApproved est défini et basé sur le rôle
  if (this.isApproved === undefined) {
    this.isApproved =
      this.role === "professional" || this.role === "professionnal"
        ? false
        : true;
  }

  next();
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Méthode statique pour s'assurer que les champs requis sont présents lors de la création
userSchema.statics.createWithDefaults = async function (userData) {
  // Supprimer les champs inutilisés s'ils sont présents
  delete userData.profileImage;
  delete userData.profession;
  delete userData.bio;

  // S'assurer que isActive est défini
  if (userData.isActive === undefined) {
    userData.isActive = true;
  }

  // S'assurer que isApproved est défini et basé sur le rôle
  if (userData.isApproved === undefined) {
    userData.isApproved =
      userData.role === "professional" || userData.role === "professionnal"
        ? false
        : true;
  }

  return this.create(userData);
};

module.exports = mongoose.model("User", userSchema);
