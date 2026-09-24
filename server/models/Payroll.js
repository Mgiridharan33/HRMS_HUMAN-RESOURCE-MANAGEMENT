const mongoose = require("mongoose");


// =====================================================
// PAYROLL SCHEMA
// =====================================================

const payrollSchema =
    new mongoose.Schema(
        {

            // =============================================
            // EMPLOYEE
            // =============================================

            employee: {
                type:
                    mongoose.Schema.Types.ObjectId,

                ref: "Employee",

                required: true,

                index: true,
            },


            // =============================================
            // SALARY STRUCTURE USED
            // =============================================

            salaryStructure: {
                type:
                    mongoose.Schema.Types.ObjectId,

                ref: "SalaryStructure",

                required: true,
            },


            // =============================================
            // PAYROLL PERIOD
            // =============================================

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


            // =============================================
            // ATTENDANCE
            // =============================================

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

            overtimeHours: {
                type: Number,

                default: 0,

                min: 0,
            },


            // =============================================
            // EARNINGS
            // =============================================

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

            overtimeAmount: {
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


            // =============================================
            // DEDUCTIONS
            // =============================================

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


            // =============================================
            // NET SALARY
            // =============================================

            netSalary: {
                type: Number,

                default: 0,

                min: 0,
            },


            // =============================================
            // STATUS
            // =============================================

            status: {
                type: String,

                enum: [
                    "DRAFT",
                    "APPROVED",
                    "PAID",
                    "CANCELLED",
                ],

                default: "DRAFT",

                index: true,
            },


            // =============================================
            // PAYMENT
            // =============================================

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


            // =============================================
            // NOTES
            // =============================================

            notes: {
                type: String,

                default: "",

                trim: true,
            },


            // =============================================
            // CREATED / UPDATED BY
            // =============================================

            createdBy: {
                type:
                    mongoose.Schema.Types.ObjectId,

                ref: "User",

                default: null,
            },

            updatedBy: {
                type:
                    mongoose.Schema.Types.ObjectId,

                ref: "User",

                default: null,
            },

            approvedBy: {
                type:
                    mongoose.Schema.Types.ObjectId,

                ref: "User",

                default: null,
            },

            approvedAt: {
                type: Date,

                default: null,
            },
        },

        {
            timestamps: true,
        }
    );


// =====================================================
// PREVENT DUPLICATE PAYROLL
// ONE PAYROLL PER EMPLOYEE / MONTH / YEAR
// =====================================================

payrollSchema.index(
    {
        employee: 1,
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
        "Payroll",
        payrollSchema
    );