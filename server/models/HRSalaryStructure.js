const mongoose = require("mongoose");

// =====================================================
// HR SALARY STRUCTURE SCHEMA
// =====================================================

const hrSalaryStructureSchema = new mongoose.Schema(
    {
        // =================================================
        // HR USER
        // =================================================

        hr: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // =================================================
        // BASIC SALARY
        // =================================================

        basicSalary: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        // =================================================
        // ALLOWANCES
        // =================================================

        hra: {
            type: Number,
            default: 0,
            min: 0,
        },

        da: {
            type: Number,
            default: 0,
            min: 0,
        },

        conveyanceAllowance: {
            type: Number,
            default: 0,
            min: 0,
        },

        medicalAllowance: {
            type: Number,
            default: 0,
            min: 0,
        },

        specialAllowance: {
            type: Number,
            default: 0,
            min: 0,
        },

        otherAllowance: {
            type: Number,
            default: 0,
            min: 0,
        },

        // =================================================
        // BONUS / INCENTIVE
        // =================================================

        bonus: {
            type: Number,
            default: 0,
            min: 0,
        },

        incentive: {
            type: Number,
            default: 0,
            min: 0,
        },

        // =================================================
        // PF
        // =================================================

        pfEnabled: {
            type: Boolean,
            default: false,
        },

        pfPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },

        // =================================================
        // ESI
        // =================================================

        esiEnabled: {
            type: Boolean,
            default: false,
        },

        esiPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },

        // =================================================
        // PROFESSIONAL TAX
        // =================================================

        professionalTax: {
            type: Number,
            default: 0,
            min: 0,
        },

        // =================================================
        // TDS
        // =================================================

        tdsPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },

        // =================================================
        // OTHER DEDUCTIONS
        // =================================================

        loanDeduction: {
            type: Number,
            default: 0,
            min: 0,
        },

        otherDeduction: {
            type: Number,
            default: 0,
            min: 0,
        },

        // =================================================
        // WORKING DETAILS
        // =================================================

        standardWorkingHoursPerDay: {
            type: Number,
            default: 8,
            min: 0,
        },

        standardWorkingDaysPerMonth: {
            type: Number,
            default: 26,
            min: 0,
        },

        // =================================================
        // ACTIVE STATUS
        // =================================================

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },

        // =================================================
        // EFFECTIVE DATE
        // =================================================

        effectiveFrom: {
            type: Date,
            default: Date.now,
        },

        effectiveTo: {
            type: Date,
            default: null,
        },

        // =================================================
        // NOTES
        // =================================================

        notes: {
            type: String,
            default: "",
            trim: true,
        },

        // =================================================
        // AUDIT
        // =================================================

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);


// =====================================================
// INDEX
// =====================================================

hrSalaryStructureSchema.index({
    hr: 1,
    isActive: 1,
});


// =====================================================
// MODEL
// =====================================================

module.exports =
    mongoose.model(
        "HRSalaryStructure",
        hrSalaryStructureSchema
    );