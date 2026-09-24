const mongoose = require("mongoose");


// =====================================================
// SALARY COMPONENT SCHEMA
// =====================================================

const salaryComponentSchema = new mongoose.Schema(
    {

        // =================================================
        // COMPONENT INFORMATION
        // =================================================

        name: {
            type: String,
            required: true,
            trim: true,
        },


        code: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },


        description: {
            type: String,
            default: "",
            trim: true,
        },


        // =================================================
        // COMPONENT TYPE
        // =================================================

        type: {
            type: String,
            enum: [
                "EARNING",
                "DEDUCTION",
                "EMPLOYER_CONTRIBUTION"
            ],
            required: true,
        },


        // =================================================
        // CALCULATION TYPE
        // =================================================

        calculationType: {
            type: String,
            enum: [
                "FIXED",
                "PERCENTAGE",
                "FORMULA"
            ],
            default: "FIXED",
        },


        // =================================================
        // VALUE
        // =================================================

        value: {
            type: Number,
            default: 0,
            min: 0,
        },


        // =================================================
        // PERCENTAGE BASE
        // =================================================

        percentageBase: {
            type: String,
            enum: [
                "BASIC",
                "GROSS",
                "CTC",
                "NONE"
            ],
            default: "NONE",
        },


        // =================================================
        // FORMULA
        // =================================================

        formula: {
            type: String,
            default: "",
            trim: true,
        },


        // =================================================
        // TAXABLE
        // =================================================

        taxable: {
            type: Boolean,
            default: false,
        },


        // =================================================
        // STATUTORY
        // =================================================

        statutory: {
            type: Boolean,
            default: false,
        },


        // =================================================
        // EMPLOYEE CAN EDIT
        // =================================================

        employeeEditable: {
            type: Boolean,
            default: false,
        },


        // =================================================
        // ACTIVE
        // =================================================

        isActive: {
            type: Boolean,
            default: true,
        },


        // =================================================
        // SORT ORDER
        // =================================================

        displayOrder: {
            type: Number,
            default: 0,
        },


        // =================================================
        // CREATED / UPDATED BY
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
// UNIQUE COMPONENT CODE
// =====================================================

salaryComponentSchema.index(
    { code: 1 },
    { unique: true }
);


// =====================================================
// MODEL
// =====================================================

module.exports = mongoose.model(
    "SalaryComponent",
    salaryComponentSchema
);