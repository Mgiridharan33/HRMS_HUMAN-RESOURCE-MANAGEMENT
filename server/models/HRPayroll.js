const mongoose = require("mongoose");


// =====================================================
// HR PAYROLL SCHEMA
// =====================================================

const hrPayrollSchema = new mongoose.Schema(
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
        // SALARY STRUCTURE USED
        // =================================================

        salaryStructure: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "HRSalaryStructure",
            required: true,
        },


        // =================================================
        // PAYROLL PERIOD
        // =================================================

        month: {
            type: Number,
            required: true,
            min: 1,
            max: 12,
        },

        year: {
            type: Number,
            required: true,
            min: 2000,
            max: 2100,
        },


        // =================================================
        // WORKING DAYS
        // =================================================

        workingDays: {
            type: Number,
            default: 0,
            min: 0,
        },

        presentDays: {
            type: Number,
            default: 0,
            min: 0,
        },

        paidLeaveDays: {
            type: Number,
            default: 0,
            min: 0,
        },

        unpaidLeaveDays: {
            type: Number,
            default: 0,
            min: 0,
        },

        absentDays: {
            type: Number,
            default: 0,
            min: 0,
        },


        // =================================================
        // EARNINGS
        // =================================================

        basicSalary: {
            type: Number,
            default: 0,
            min: 0,
        },

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

        grossSalary: {
            type: Number,
            default: 0,
            min: 0,
        },


        // =================================================
        // DEDUCTIONS
        // =================================================

        pfAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        esiAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        professionalTax: {
            type: Number,
            default: 0,
            min: 0,
        },

        tdsAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

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

        totalDeductions: {
            type: Number,
            default: 0,
            min: 0,
        },


        // =================================================
        // NET SALARY
        // =================================================

        netSalary: {
            type: Number,
            default: 0,
            min: 0,
        },


        // =================================================
        // STATUS
        //
        // IMPORTANT:
        // NO APPROVED STATUS
        //
        // SUPER ADMIN:
        // DRAFT -> PAID
        // =================================================

        status: {
            type: String,

            enum: [
                "DRAFT",
                "PAID",
                "CANCELLED",
            ],

            default: "DRAFT",

            index: true,
        },


        // =================================================
        // PAYMENT
        // =================================================

        paymentMethod: {
            type: String,

            enum: [
                "BANK_TRANSFER",
                "CASH",
                "CHEQUE",
                "OTHER",
                null,
            ],

            default: null,
        },

        paymentReference: {
            type: String,
            default: "",
            trim: true,
        },

        paidAt: {
            type: Date,
            default: null,
        },

        // =================================================
        // WHO PAID
        // =================================================

        paidBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
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
// PREVENT DUPLICATE HR PAYROLL
// ONE HR PAYROLL PER MONTH / YEAR
// =====================================================

hrPayrollSchema.index(
    {
        hr: 1,
        month: 1,
        year: 1,
    },
    {
        unique: true,
    }
);


// =====================================================
// MODEL
// =====================================================

module.exports =
    mongoose.model(
        "HRPayroll",
        hrPayrollSchema
    );