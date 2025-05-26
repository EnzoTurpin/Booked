import { Request, Response } from "express";
import Appointment, { IAppointment } from "../models/Appointment";
import Service from "../models/Service";

// Get all appointments
export const getAppointments = async (req: Request, res: Response) => {
  try {
    const appointments = await Appointment.find()
      .populate("clientId", "firstName lastName email phone")
      .populate("professionalId")
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
      .populate("clientId", "firstName lastName email phone")
      .populate("professionalId")
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
    const appointments = await Appointment.find({ clientId: req.params.userId })
      .populate("clientId", "firstName lastName email phone")
      .populate("professionalId")
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
      .populate("clientId", "firstName lastName email phone")
      .populate("professionalId")
      .populate("serviceId");

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Create new appointment
export const createAppointment = async (req: Request, res: Response) => {
  try {
    const {
      clientId,
      professionalId,
      serviceId,
      date,
      startTime,
      endTime,
      notes,
      paymentAmount,
    } = req.body;

    // Check if the service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Check if the appointment time is available
    const existingAppointment = await Appointment.findOne({
      professionalId,
      date: new Date(date),
      startTime,
      status: { $nin: ["cancelled", "no-show"] },
    });

    if (existingAppointment) {
      return res
        .status(400)
        .json({ message: "This time slot is already booked" });
    }

    const newAppointment = new Appointment({
      clientId,
      professionalId,
      serviceId,
      date,
      startTime,
      endTime,
      notes,
      paymentAmount: paymentAmount || service.price,
      status: "scheduled",
      paymentStatus: "pending",
    });

    const savedAppointment = await newAppointment.save();

    // Populate the saved appointment with related data
    const populatedAppointment = await Appointment.findById(
      savedAppointment._id
    )
      .populate("clientId", "firstName lastName email phone")
      .populate("professionalId")
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
      .populate("clientId", "firstName lastName email phone")
      .populate("professionalId")
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
    const {
      date,
      startTime,
      endTime,
      notes,
      status,
      paymentStatus,
      paymentAmount,
    } = req.body;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { date, startTime, endTime, notes, status, paymentStatus, paymentAmount },
      { new: true }
    )
      .populate("clientId", "firstName lastName email phone")
      .populate("professionalId")
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
