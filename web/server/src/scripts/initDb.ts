import mongoose from "mongoose";
import dotenv from "dotenv";
import { User, Professional, Service } from "../models";
import connectDB from "../config/database";

dotenv.config();

// Sample data
const users = [
  {
    firstName: "Admin",
    lastName: "User",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
  },
  {
    firstName: "Client",
    lastName: "User",
    email: "client@example.com",
    password: "password123",
    role: "client",
  },
  {
    firstName: "Professional",
    lastName: "User",
    email: "professional@example.com",
    password: "password123",
    role: "professional",
  },
];

const professionals = [
  {
    profession: "Hairstylist",
    bio: "Professional hairstylist with 5 years of experience.",
    availability: [
      { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 5, startTime: "09:00", endTime: "17:00" },
    ],
    location: {
      address: "123 Main St",
      city: "Paris",
      state: "Île-de-France",
      zipCode: "75001",
      country: "France",
    },
  },
];

const services = [
  {
    name: "Haircut",
    description: "Standard haircut service",
    duration: 30,
    price: 35,
    category: "Hair",
  },
  {
    name: "Hair Coloring",
    description: "Professional hair coloring service",
    duration: 120,
    price: 85,
    category: "Hair",
  },
  {
    name: "Styling",
    description: "Hair styling for special occasions",
    duration: 60,
    price: 50,
    category: "Hair",
  },
];

// Initialize database with sample data
const initDB = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Professional.deleteMany({}),
      Service.deleteMany({}),
    ]);

    console.log("🧹 Cleared existing data");

    // Create users
    const createdUsers = await User.create(users);
    console.log(`👤 Created ${createdUsers.length} users`);

    // Create professional profile
    const professionalUser = createdUsers.find(
      (user) => user.role === "professional"
    );
    if (!professionalUser) throw new Error("Professional user not found");

    const professionalData = {
      ...professionals[0],
      userId: professionalUser._id,
    };

    const createdProfessional = await Professional.create(professionalData);
    console.log(`👨‍⚕️ Created professional profile`);

    // Create services
    const servicesWithProfessionalId = services.map((service) => ({
      ...service,
      professionalId: createdProfessional._id,
    }));

    const createdServices = await Service.create(servicesWithProfessionalId);
    console.log(`🛠️ Created ${createdServices.length} services`);

    // Update professional with service IDs
    await Professional.findByIdAndUpdate(createdProfessional._id, {
      services: createdServices.map((service) => service._id),
    });

    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  } finally {
    await mongoose.connection.close();
    console.log("📦 Database connection closed");
    process.exit(0);
  }
};

initDB();
