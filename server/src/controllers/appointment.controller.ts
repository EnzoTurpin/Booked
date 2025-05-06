import { Request, Response } from "express";
import Appointment, { IAppointment } from "../models/appointment.model";
import Service from "../models/service.model";

// Get all appointments
export const getAppointments = async (req: Request, res: Response) => {
  try {
    const appointments = await Appointment.find()
      .populate("userId", "firstName lastName email phoneNumber")
      .populate("professionalId", "firstName lastName")
      .populate("serviceId");

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get appointment by ID
export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("userId", "firstName lastName email phoneNumber")
      .populate("professionalId", "firstName lastName")
      .populate("serviceId");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get appointments by user ID
export const getAppointmentsByUserId = async (req: Request, res: Response) => {
  try {
    const appointments = await Appointment.find({ userId: req.params.userId })
      .populate("userId", "firstName lastName email phoneNumber")
      .populate("professionalId", "firstName lastName")
      .populate("serviceId");

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get appointments by professional ID
export const getAppointmentsByProfessionalId = async (
  req: Request,
  res: Response
) => {
  try {
    const appointments = await Appointment.find({
      professionalId: req.params.professionalId,
    })
      .populate("userId", "firstName lastName email phoneNumber")
      .populate("professionalId", "firstName lastName")
      .populate("serviceId");

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Create new appointment
export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { userId, professionalId, serviceId, date, notes } = req.body;

    // Check if the service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Check if the appointment time is available
    const existingAppointment = await Appointment.findOne({
      professionalId,
      date: new Date(date),
      status: { $nin: ["cancelled"] },
    });

    if (existingAppointment) {
      return res
        .status(400)
        .json({ message: "This time slot is already booked" });
    }

    const newAppointment = new Appointment({
      userId,
      professionalId,
      serviceId,
      date,
      notes,
    });

    const savedAppointment = await newAppointment.save();

    // Populate the saved appointment with related data
    const populatedAppointment = await Appointment.findById(
      savedAppointment._id
    )
      .populate("userId", "firstName lastName email phoneNumber")
      .populate("professionalId", "firstName lastName")
      .populate("serviceId");

    res.status(201).json(populatedAppointment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update appointment status
export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("userId", "firstName lastName email phoneNumber")
      .populate("professionalId", "firstName lastName")
      .populate("serviceId");

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update appointment
export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { date, notes, status } = req.body;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { date, notes, status },
      { new: true }
    )
      .populate("userId", "firstName lastName email phoneNumber")
      .populate("professionalId", "firstName lastName")
      .populate("serviceId");

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete appointment
export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const deletedAppointment = await Appointment.findByIdAndDelete(
      req.params.id
    );

    if (!deletedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
