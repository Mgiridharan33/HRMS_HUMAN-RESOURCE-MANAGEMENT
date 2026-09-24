const mongoose = require("mongoose");


// ============================================================
// HR PERSONAL LEAVE SCHEMA
// ============================================================

const hrPersonalLeaveSchema = new mongoose.Schema(
    {
        // ====================================================
        // HR USER
        // ====================================================

        hr: {
            type: mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true,
        },


        // ====================================================
        // EMPLOYEE RECORD
        // OPTIONAL
        // ====================================================

        employee: {
            type: mongoose.Schema.Types.ObjectId,

            ref: "Employee",

            default: null,
        },


        // ====================================================
        // LEAVE TYPE
        // ====================================================

        leaveType: {
            type: String,

            required: true,

            trim: true,
        },


        // ====================================================
        // FROM DATE
        // ====================================================

        fromDate: {
            type: Date,

            required: true,
        },


        // ====================================================
        // TO DATE
        // ====================================================

        toDate: {
            type: Date,

            required: true,
        },


        // ====================================================
        // TOTAL DAYS
        // ====================================================

        totalDays: {
            type: Number,

            required: true,

            min: 1,
        },


        // ====================================================
        // REASON
        // ====================================================

        reason: {
            type: String,

            required: true,

            trim: true,
        },


        // ====================================================
        // STATUS
        // ====================================================

        status: {
            type: String,

            enum: [
                "Pending",
                "Approved",
                "Cancelled",
            ],

            default: "Pending",
        },


        // ====================================================
        // SUPER ADMIN REMARK
        // ====================================================

        adminRemark: {
            type: String,

            default: "",

            trim: true,
        },


        // ====================================================
        // REVIEWED BY
        // ====================================================

        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,

            ref: "User",

            default: null,
        },


        // ====================================================
        // REVIEWED DATE
        // ====================================================

        reviewedAt: {
            type: Date,

            default: null,
        },
    },

    {
        timestamps: true,
    }
);


// ============================================================
// INDEXES
// ============================================================

hrPersonalLeaveSchema.index({
    hr: 1,

    createdAt: -1,
});


hrPersonalLeaveSchema.index({
    status: 1,

    createdAt: -1,
});


hrPersonalLeaveSchema.index({
    fromDate: 1,

    toDate: 1,
});


// ============================================================
// MODEL
// ============================================================

const HRPersonalLeave =
    mongoose.model(
        "HRPersonalLeave",
        hrPersonalLeaveSchema
    );


module.exports = HRPersonalLeave;