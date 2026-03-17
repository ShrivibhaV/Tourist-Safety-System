import TouristRegistration from "../models/tourist_register.model.js";
import mongoose from "mongoose";

export const createTourist = async (req, res) => {
  try {
    const tourist = new TouristRegistration(req.body);
    await tourist.save();
    res.status(201).json({ success: true, message: "Tourist registered successfully", data: tourist });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, error: "Validation failed", details: Object.values(err.errors).map(e => e.message) });
    }
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: "Duplicate field value entered", details: err.keyValue });
    }
    console.error(err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const getAllTourists = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 10), 100);
    const skip = (page - 1) * limit;

    const total = await TouristRegistration.countDocuments();
    const tourists = await TouristRegistration.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: tourists,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to retrieve tourists" });
  }
};

export const getTouristById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: "Invalid ID format" });
    }
    const tourist = await TouristRegistration.findById(req.params.id).lean();
    if (!tourist) return res.status(404).json({ success: false, error: "Tourist not found" });
    res.status(200).json({ success: true, data: tourist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to retrieve tourist" });
  }
};

export const updateTourist = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: "Invalid ID format" });
    }

    const allowedUpdates = [
      "firstName", "lastName", "email", "phone", "nationality", "idType",
      "idNumber", "photo", "emergencyContactName", "emergencyContactPhone"
    ];
    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const updatedTourist = await TouristRegistration.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!updatedTourist) return res.status(404).json({ success: false, error: "Tourist not found" });

    res.status(200).json({ success: true, message: "Tourist updated successfully", data: updatedTourist });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, error: "Validation failed", details: Object.values(err.errors).map(e => e.message) });
    }
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: "Duplicate field value entered", details: err.keyValue });
    }
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to update tourist" });
  }
};

export const deleteTourist = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: "Invalid ID format" });
    }
    const deleted = await TouristRegistration.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: "Tourist not found" });
    res.status(200).json({ success: true, message: "Tourist deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to delete tourist" });
  }
};

export default { createTourist, getAllTourists, getTouristById, updateTourist, deleteTourist };
