const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
    {
        // =====================================================
        // BASIC INFORMATION
        // =====================================================

        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        phone: {
            type: String,
            default: "",
            trim: true,
        },

        password: {
            type: String,
            required: true,
        },

        // =====================================================
        // PROFILE IMAGE
        // =====================================================

        profileImage: {
            type: String,
            default: "",
        },

        // =====================================================
        // RESUME
        // Cloudinary secure URL
        // =====================================================

        resume: {
            type: String,
            default: "",
        },

        // =====================================================
        // CANDIDATE INFORMATION
        // =====================================================

        skills: {
            type: [String],
            default: [],
        },

        education: {
            type: String,
            default: "",
        },

        experience: {
            type: String,
            default: "",
        },

        address: {
            type: String,
            default: "",
        },

        // =====================================================
        // STATUS
        // =====================================================

        isActive: {
            type: Boolean,
            default: true,
        },
    },

    {
        timestamps: true,
    }
);

module.exports =
    mongoose.model(
        "Candidate",
        candidateSchema
    );