import { Request, Response } from "express";
import Service, { IService } from "../models/service.model";

// Get all services
export const getServices = async (req: Request, res: Response) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get service by ID
export const getServiceById = async (req: Request, res: Response) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get services by professional ID
export const getServicesByProfessional = async (
  req: Request,
  res: Response
) => {
  try {
    const services = await Service.find({
      professionalId: req.params.professionalId,
    });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Create new service
export const createService = async (req: Request, res: Response) => {
  try {
    const { name, description, duration, price, professionalId } = req.body;

    const newService = new Service({
      name,
      description,
      duration,
      price,
      professionalId,
    });

    const savedService = await newService.save();
    res.status(201).json(savedService);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update service
export const updateService = async (req: Request, res: Response) => {
  try {
    const { name, description, duration, price } = req.body;

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      { name, description, duration, price },
      { new: true }
    );

    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json(updatedService);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete service
export const deleteService = async (req: Request, res: Response) => {
  try {
    const deletedService = await Service.findByIdAndDelete(req.params.id);

    if (!deletedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
