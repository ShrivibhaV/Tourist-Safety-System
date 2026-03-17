import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const TouristRegistrationSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "First name is required"],
        minlength: 2,
        maxlength: 50,
        trim: true
    },
    lastName: {
        type: String,
        required: [true, "Last name is required"],
        minlength: 2,
        maxlength: 50,
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        unique: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^\d{10,15}$/.test(v) && !/^0/.test(v);
            },
            message: props => `${props.value} is not a valid phone number format`
        }
    },
    nationality: {
        type: String,
        required: true,
        trim: true,
        maxlength: 45
    },
    idType: {
        type: String,
        enum: ["Aadhar", "Passport", "OtherNationalID"],
        required: true
    },
    idNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: function (v) {
                // Remove spaces for validation
                const cleanValue = v.replace(/\s/g, '');
                if (this.idType === "Aadhar") {
                    return /^\d{12}$/.test(cleanValue);
                } else if (this.idType === "Passport") {
                    return /^[A-Za-z0-9]{8,9}$/.test(cleanValue);
                } else if (this.idType === "OtherNationalID") {
                    return /^([A-Za-z]{1,3})?\d{8,12}$/.test(cleanValue);
                }
                return false;
            },
            message: props => `${props.value} is not a valid ID number for the selected type`
        }
    },
    photo: {
        type: String,
        trim: true,
        required: false
    },
    preferredLanguage: {
        type: String,
        trim: true,
        default: "English"
    },
    passportNumber: {
        type: String,
        trim: true,
        match: [/^[A-Z0-9]{6,9}$/, "Invalid passport number format"]
    },
    emergencyContactName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    emergencyContactPhone: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^\d{10,15}$/.test(v) && !/^0/.test(v);
            },
            message: props => `${props.value} is not a valid emergency contact number`
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date
    },
    digitalIdentityHash: {
        type: String,
        trim: true
    },
    touristId: {
        type: String,
        unique: true,
        trim: true
    }
}, {
    timestamps: true,
    versionKey: false
});

// Virtual for fullName
TouristRegistrationSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving (only if password is provided)
TouristRegistrationSchema.pre('save', async function (next) {
    if (!this.password || !this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
TouristRegistrationSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Capitalize first and last names
TouristRegistrationSchema.pre('save', function (next) {
    if (this.isModified('firstName')) {
        this.firstName = this.firstName.charAt(0).toUpperCase() + this.firstName.slice(1).toLowerCase();
    }
    if (this.isModified('lastName')) {
        this.lastName = this.lastName.charAt(0).toUpperCase() + this.lastName.slice(1).toLowerCase();
    }
    next();
});



// Enable virtuals in JSON
TouristRegistrationSchema.set('toJSON', { virtuals: true });
TouristRegistrationSchema.set('toObject', { virtuals: true });

export default mongoose.models.TouristRegistration ||
    mongoose.model("TouristRegistration", TouristRegistrationSchema);