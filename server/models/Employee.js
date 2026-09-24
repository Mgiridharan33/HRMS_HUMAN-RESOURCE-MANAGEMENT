const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
    {
        // =====================================================
        // OPTIONAL USER REFERENCE
        // =====================================================

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: undefined,
        },

        // =====================================================
        // BASIC INFORMATION
        // =====================================================

        employeeId: {
            type: String,
            required: [true, "Employee ID is required"],
            unique: true,
            trim: true,
        },

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
            lowercase: true,
            trim: true,
        },

        phone: {
            type: String,
            default: "",
            trim: true,
        },

        dateOfBirth: {
            type: Date,
            default: null,
        },

        gender: {
            type: String,
            enum: [
                "Male",
                "Female",
                "Other",
            ],
            default: "Other",
        },

        address: {
            type: String,
            default: "",
            trim: true,
        },

        // =====================================================
        // JOB INFORMATION
        // =====================================================

        department: {
            type: String,
            default: "",
            trim: true,
        },

        designation: {
            type: String,
            default: "",
            trim: true,
        },

        joiningDate: {
            type: Date,
            default: null,
        },

        employmentType: {
            type: String,
            enum: [
                "Full Time",
                "Part Time",
                "Contract",
                "Intern",
            ],
            default: "Full Time",
        },

        // =====================================================
        // REPORTING HR
        // =====================================================

        reportingHR: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        // =====================================================
        // PROFILE
        // =====================================================

        profileImage: {
            type: String,
            default: "",
        },

        // =====================================================
        // LOGIN
        // =====================================================

        password: {
            type: String,
            required: [true, "Password is required"],
        },

        role: {
            type: String,
            enum: ["EMPLOYEE"],
            default: "EMPLOYEE",
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

employeeSchema.index(
    { user: 1 },
    {
        name: "user_1",
        unique: true,
        partialFilterExpression: {
            user: {
                $type: "objectId",
            },
        },
    }
);

module.exports = mongoose.model(
    "Employee",
    employeeSchema
);