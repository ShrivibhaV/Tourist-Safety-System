import mongoose from "mongoose";

// Emergency Contact Schema
const EmergencyContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: v => /^\d{10,15}$/.test(v) && !/^0/.test(v),
      message: props => `${props.value} is not a valid phone number`
    }
  }
}, { _id: false });

const UserProfileSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  lastName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, "Invalid email"] },
  phone: { type: String, required: true, unique: true, trim: true, validate: { validator: v => /^\d{10,15}$/.test(v) && !/^0/.test(v), message: "Invalid phone number" } },
  nationality: { type: String, required: true, trim: true, maxlength: 45 },
  passportNumber: { type: String, trim: true, match: [/^[A-Z0-9]{6,9}$/, "Invalid passport number format"] },
  preferredLanguage: { type: String, trim: true, default: "English" },
  photo: { type: String, trim: true, validate: { validator: v => !v || /^https?:\/\/[^\s$.?#].[^\s]*$/.test(v), message: "Invalid photo URL" } },
  emergencyContacts: { type: [EmergencyContactSchema], validate: [v => v.length <= 3, "Maximum 3 emergency contacts allowed"] }
}, { timestamps: true, versionKey: false });

UserProfileSchema.virtual("fullName").get(function() {
  return `${this.firstName} ${this.lastName}`;
});
UserProfileSchema.set("toJSON", { virtuals: true });

UserProfileSchema.pre("save", function(next) {
  this.firstName = this.firstName.charAt(0).toUpperCase() + this.firstName.slice(1).toLowerCase();
  this.lastName = this.lastName.charAt(0).toUpperCase() + this.lastName.slice(1).toLowerCase();
  next();
});

export default mongoose.models.UserProfile || mongoose.model("UserProfile", UserProfileSchema);
