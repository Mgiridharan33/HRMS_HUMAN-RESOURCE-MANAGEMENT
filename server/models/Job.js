const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
    {
        // =====================================================
        // BASIC JOB INFORMATION
        // =====================================================

        title: {
            type: String,
            required: true,
            trim: true,
        },

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

        location: {
            type: String,
            default: "",
            trim: true,
        },

        employmentType: {
            type: String,
            enum: [
                "Full Time",
                "Part Time",
                "Contract",
                "Internship",
                "Temporary",
            ],
            default: "Full Time",
        },

        // =====================================================
        // JOB DESCRIPTION
        // =====================================================

        description: {
            type: String,
            required: true,
            trim: true,
        },

        requirements: {
            type: [String],
            default: [],
        },

        responsibilities: {
            type: [String],
            default: [],
        },

        skills: {
            type: [String],
            default: [],
        },

        // =====================================================
        // EXPERIENCE
        // =====================================================

        experience: {
            type: String,
            default: "",
            trim: true,
        },

        // =====================================================
        // SALARY
        // =====================================================

        salaryMin: {
            type: Number,
            default: null,
        },

        salaryMax: {
            type: Number,
            default: null,
        },

        salaryCurrency: {
            type: String,
            default: "INR",
        },

        // =====================================================
        // VACANCIES
        // =====================================================

        vacancies: {
            type: Number,
            default: 1,
            min: 1,
        },

        // =====================================================
        // APPLICATION DEADLINE
        // =====================================================

        applicationDeadline: {
            type: Date,
            default: null,
        },

        // =====================================================
        // STATUS
        // =====================================================

        status: {
            type: String,
            enum: [
                "Draft",
                "Published",
                "Closed",
            ],
            default: "Draft",
            index: true,
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },

        // =====================================================
        // CREATED BY SUPER ADMIN
        // =====================================================

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },

    {
        timestamps: true,
    }
);


// =========================================================
// INDEXES
// =========================================================

jobSchema.index({
    status: 1,
    isActive: 1,
});

jobSchema.index({
    createdAt: -1,
});


module.exports = mongoose.model(
    "Job",
    jobSchema
);