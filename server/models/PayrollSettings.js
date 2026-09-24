const mongoose = require("mongoose");


// =====================================================
// PAYROLL SETTINGS SCHEMA
// =====================================================

const payrollSettingsSchema = new mongoose.Schema(
    {

        // =================================================
        // PAYROLL CYCLE
        // =================================================

        payrollCycle: {
            type: String,
            enum: [
                "MONTHLY",
                "WEEKLY",
                "BIWEEKLY"
            ],
            default: "MONTHLY",
        },


        // =================================================
        // DEFAULT WORKING DAYS
        // =================================================

        workingDaysPerMonth: {
            type: Number,
            default: 26,
            min: 1,
        },


        // =================================================
        // DEFAULT WORKING HOURS
        // =================================================

        workingHoursPerDay: {
            type: Number,
            default: 8,
            min: 1,
        },


        // =================================================
        // PAYROLL PROCESSING DAY
        // =================================================

        payrollProcessingDay: {
            type: Number,
            default: 28,
            min: 1,
            max: 31,
        },


        // =================================================
        // OVERTIME
        // =================================================

        overtimeEnabled: {
            type: Boolean,
            default: true,
        },

        overtimeRateType: {
            type: String,
            enum: [
                "FIXED",
                "MULTIPLIER"
            ],
            default: "MULTIPLIER",
        },

        overtimeRate: {
            type: Number,
            default: 1.5,
            min: 0,
        },


        // =================================================
        // ATTENDANCE DEDUCTIONS
        // =================================================

        absentDeductionEnabled: {
            type: Boolean,
            default: true,
        },

        leaveDeductionEnabled: {
            type: Boolean,
            default: true,
        },

        lateDeductionEnabled: {
            type: Boolean,
            default: false,
        },

        halfDayDeductionEnabled: {
            type: Boolean,
            default: true,
        },


        // =================================================
        // STATUTORY DEDUCTIONS
        // =================================================

        pfEnabled: {
            type: Boolean,
            default: true,
        },

        pfEmployeeRate: {
            type: Number,
            default: 12,
            min: 0,
        },

        pfEmployerRate: {
            type: Number,
            default: 12,
            min: 0,
        },


        // =================================================
        // ESI
        // =================================================

        esiEnabled: {
            type: Boolean,
            default: false,
        },

        esiEmployeeRate: {
            type: Number,
            default: 0.75,
            min: 0,
        },

        esiEmployerRate: {
            type: Number,
            default: 3.25,
            min: 0,
        },


        // =================================================
        // PROFESSIONAL TAX
        // =================================================

        professionalTaxEnabled: {
            type: Boolean,
            default: false,
        },

        professionalTaxAmount: {
            type: Number,
            default: 0,
            min: 0,
        },


        // =================================================
        // TDS
        // =================================================

        tdsEnabled: {
            type: Boolean,
            default: false,
        },


        // =================================================
        // SALARY ROUNDING
        // =================================================

        salaryRoundingEnabled: {
            type: Boolean,
            default: true,
        },

        salaryRoundingDigits: {
            type: Number,
            default: 2,
            min: 0,
            max: 4,
        },


        // =================================================
        // CURRENCY
        // =================================================

        currency: {
            type: String,
            default: "INR",
            trim: true,
        },


        currencySymbol: {
            type: String,
            default: "₹",
            trim: true,
        },


        // =================================================
        // ACTIVE STATUS
        // =================================================

        isActive: {
            type: Boolean,
            default: true,
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
// MODEL
// =====================================================

module.exports = mongoose.model(
    "PayrollSettings",
    payrollSettingsSchema
);