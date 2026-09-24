const mongoose = require("mongoose");


// =====================================================
// PAYROLL PAYMENT SCHEMA
// =====================================================

const payrollPaymentSchema = new mongoose.Schema(
    {

        // =================================================
        // PAYROLL
        // =================================================

        payroll: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payroll",
            required: true,
            unique: true,
        },


        // =================================================
        // EMPLOYEE
        // =================================================

        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },


        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },


        // =================================================
        // PAYMENT AMOUNT
        // =================================================

        amount: {
            type: Number,
            required: true,
            min: 0,
        },


        currency: {
            type: String,
            default: "INR",
            trim: true,
        },


        // =================================================
        // PAYMENT METHOD
        // =================================================

        paymentMethod: {
            type: String,
            enum: [
                "BANK_TRANSFER",
                "CASH",
                "CHEQUE",
                "UPI",
                "OTHER"
            ],
            default: "BANK_TRANSFER",
        },


        // =================================================
        // TRANSACTION INFORMATION
        // =================================================

        transactionId: {
            type: String,
            default: "",
            trim: true,
        },


        transactionReference: {
            type: String,
            default: "",
            trim: true,
        },


        // =================================================
        // PAYMENT DATE
        // =================================================

        paymentDate: {
            type: Date,
            default: null,
        },


        // =================================================
        // STATUS
        // =================================================

        status: {
            type: String,
            enum: [
                "PENDING",
                "PROCESSING",
                "SUCCESS",
                "FAILED",
                "REVERSED"
            ],
            default: "PENDING",
        },


        // =================================================
        // REMARKS
        // =================================================

        remarks: {
            type: String,
            default: "",
            trim: true,
        },


        // =================================================
        // CREATED BY
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
// INDEXES
// =====================================================

payrollPaymentSchema.index({
    employee: 1,
});

payrollPaymentSchema.index({
    status: 1,
});

payrollPaymentSchema.index({
    paymentDate: -1,
});

payrollPaymentSchema.index({
    transactionId: 1,
});


// =====================================================
// MODEL
// =====================================================

module.exports = mongoose.model(
    "PayrollPayment",
    payrollPaymentSchema
);