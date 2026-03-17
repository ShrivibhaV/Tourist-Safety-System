import UserProfile from "../models/tourist_profile.model.js";

// Create Profile (POST)
export const createProfile = async (req, res) => {
  try {
    const requiredFields = ["firstName", "lastName", "email", "phone", "nationality"];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ success: false, error: `Missing required fields: ${missingFields.join(", ")}` });
    }

    // Enforces uniqueness on both email and phone
    const existingUser = await UserProfile.findOne({ $or: [ { email: req.body.email }, { phone: req.body.phone } ] });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "A profile with this email or phone already exists" });
    }

    const profile = new UserProfile(req.body);
    await profile.save();
    return res.status(201).json({ success: true, message: "Profile created successfully", data: profile });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, error: `Validation failed: ${err.message}` });
    }
    if (err.code === 11000) { // duplicate key error
      return res.status(400).json({ success: false, error: "Email or phone already exists" });
    }
    console.error("Error creating profile:", err);
    return res.status(500).json({ success: false, error: "Internal server error. Please try again later." });
  }
};

// Get Profile (GET)
export const getProfile = async (req, res) => {
  try {
    // You may use `req.user.id` from auth or `req.params.id`
    const userId = req.params.id;
    const profile = await UserProfile.findById(userId).lean();
    if (!profile) {
      return res.status(404).json({ success: false, error: "Profile not found" });
    }
    return res.status(200).json({ success: true, data: profile });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
};

// Update Profile (PUT/PATCH)
export const updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    const updated = await UserProfile.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ success: false, error: "Profile not found" });
    }
    return res.status(200).json({ success: true, message: "Profile updated successfully", data: updated });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, error: `Validation failed: ${err.message}` });
    }
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: "Email or phone already exists" });
    }
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
};

// Download Profile (PDF/CSV/Etc.)
export const downloadProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const profile = await UserProfile.findById(userId).lean();
    if (!profile) {
      return res.status(404).json({ success: false, error: "Profile not found" });
    }
    // Here you would use a library like pdfkit or json2csv to send file
    // res.setHeader("Content-Type", "application/pdf");
    // res.send(pdfBuffer);
    return res.status(501).json({ success: false, error: "Download not implemented yet." });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
};

export default { createProfile, getProfile, updateProfile, downloadProfile };
