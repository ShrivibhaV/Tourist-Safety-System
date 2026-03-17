import UserProfile from "../models/tourist_profile.model.js";
import Joi from "joi";
import mongoose from "mongoose";

// Joi validation schema
const profileValidationSchema = Joi.object({
  firstName: Joi.string().trim().min(1).required(),
  lastName: Joi.string().trim().min(1).required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^\+?\d{7,15}$/)
    .message("Phone must be a valid number with country code")
    .required(),
  nationality: Joi.string().trim().min(1).required(),
});

// CREATE
export const createProfile = async (req, res) => {
  try {
    const { error } = profileValidationSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.details.map(d => d.message),
      });
    }
    const existingUser = await UserProfile.findOne({
      $or: [{ email: req.body.email }, { phone: req.body.phone }],
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "A profile with this email or phone already exists.",
      });
    }
    const profile = new UserProfile(req.body);
    await profile.save();
    return res.status(201).json({
      success: true,
      message: "Profile created successfully",
      data: profile,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, error: `Validation failed: ${err.message}` });
    }
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: "Email or phone already exists." });
    }
    console.error("Error creating profile:", err);
    return res.status(500).json({ success: false, error: "Internal server error. Please try again later." });
  }
};

// READ (all profiles, paginated)
export const getAllProfiles = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 10), 100);
    const skip = (page - 1) * limit;

    const total = await UserProfile.countDocuments();
    const profiles = await UserProfile.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: profiles,
    });
  } catch (err) {
    console.error("Error fetching profiles:", err);
    res.status(500).json({ success: false, error: "Failed to retrieve profiles. Please try again later." });
  }
};

// READ (single profile)
export const getProfileById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: "Invalid profile ID format" });
    }
    const profile = await UserProfile.findById(req.params.id).lean();
    if (!profile) {
      return res.status(404).json({ success: false, error: "Profile not found" });
    }
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ success: false, error: "Failed to retrieve the profile. Please try again later." });
  }
};

// UPDATE
export const updateProfile = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: "Invalid profile ID format" });
    }
    // Allow only whitelisted fields
    const permittedFields = ["firstName", "lastName", "email", "phone", "nationality"];
    const updateData = {};
    for (const field of permittedFields) {
      if (req.body[field]) updateData[field] = req.body[field];
    }
    // Validate partial updates
    const { error } = profileValidationSchema.fork(permittedFields, s => s.optional()).validate(updateData, { abortEarly: false });
    if (error) {
      return res.status(400).json({ success: false, error: "Validation failed", details: error.details.map(d => d.message) });
    }
    // Check email/phone uniqueness (exclude self)
    if (updateData.email || updateData.phone) {
      const dupQuery = [];
      if (updateData.email) dupQuery.push({ email: updateData.email });
      if (updateData.phone) dupQuery.push({ phone: updateData.phone });
      const existingUser = await UserProfile.findOne({
        $or: dupQuery,
        _id: { $ne: req.params.id },
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "Email or phone already exists in another profile.",
        });
      }
    }
    const profile = await UserProfile.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!profile) {
      return res.status(404).json({ success: false, error: "Profile not found" });
    }
    res.status(200).json({ success: true, message: "Profile updated successfully", data: profile });
  } catch (err) {
    console.error("Error updating profile:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, error: `Validation failed: ${err.message}` });
    }
    res.status(500).json({ success: false, error: "Failed to update profile. Please try again later." });
  }
};

// DELETE
export const deleteProfile = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: "Invalid profile ID format" });
    }
    const profile = await UserProfile.findByIdAndDelete(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, error: "Profile not found" });
    }
    res.status(200).json({ success: true, message: "Profile deleted successfully" });
  } catch (err) {
    console.error("Error deleting profile:", err);
    res.status(500).json({ success: false, error: "Failed to delete profile. Please try again later." });
  }
};

export {profileValidationSchema};
export default {
  createProfile,
  getAllProfiles,
  getProfileById,
  updateProfile,
  deleteProfile,
};
