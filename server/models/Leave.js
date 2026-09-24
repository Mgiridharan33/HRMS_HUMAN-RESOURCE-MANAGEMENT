const mongoose = require("mongoose");


// =====================================================
// LEAVE SCHEMA
// =====================================================

const leaveSchema = new mongoose.Schema(
    {

        // =================================================
        // EMPLOYEE
        // =================================================

        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
            index: true,
        },


        // =================================================
        // EMPLOYEE NAME SNAPSHOT
        // =================================================

        employeeName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },


        // =================================================
        // EMPLOYEE CODE
        // =================================================

        empCode: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },


        // =================================================
        // LEAVE TYPE
        // =================================================

        leaveType: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },


        // =================================================
        // PAID / UNPAID
        // =================================================

        leaveCategory: {
            type: String,

            enum: [
                "Paid",
                "Unpaid",
            ],

            default: "Paid",

            required: true,
        },


        // =================================================
        // START DATE
        // =================================================

        startDate: {
            type: Date,
            required: true,
        },


        // =================================================
        // END DATE
        // =================================================

        endDate: {
            type: Date,
            required: true,
        },


        // =================================================
        // TOTAL DAYS
        // =================================================

        totalDays: {
            type: Number,
            required: true,
            min: 1,
        },


        // =================================================
        // REASON
        // =================================================

        reason: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },


        // =================================================
        // STATUS
        // =================================================

        status: {
            type: String,

            enum: [
                "Pending",
                "Approved",
                "Cancelled",
            ],

            default: "Pending",

            index: true,
        },


        // =================================================
        // APPROVED BY
        // =================================================

        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },


        // =================================================
        // APPROVED AT
        // =================================================

        approvedAt: {
            type: Date,
            default: null,
        },


        // =================================================
        // CANCELLED BY
        // =================================================

        cancelledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },


        // =================================================
        // CANCELLED AT
        // =================================================

        cancelledAt: {
            type: Date,
            default: null,
        },


        // =================================================
        // CANCELLATION REASON
        // =================================================

        cancellationReason: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },


        // =================================================
        // ADMIN / HR REMARK
        // =================================================

        adminRemark: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },

    },

    {
        timestamps: true,
    }
);


// =====================================================
// VALIDATE + CALCULATE DATES
// =====================================================

leaveSchema.pre(
    "validate",
    async function () {

        if (
            this.startDate &&
            this.endDate
        ) {

            const start =
                new Date(
                    this.startDate
                );

            const end =
                new Date(
                    this.endDate
                );


            if (
                Number.isNaN(
                    start.getTime()
                ) ||
                Number.isNaN(
                    end.getTime()
                )
            ) {

                throw new Error(
                    "Invalid leave dates."
                );
            }


            // ---------------------------------------------
            // NORMALIZE
            // ---------------------------------------------

            start.setHours(
                0,
                0,
                0,
                0
            );

            end.setHours(
                0,
                0,
                0,
                0
            );


            // ---------------------------------------------
            // DATE ORDER
            // ---------------------------------------------

            if (
                end < start
            ) {

                throw new Error(
                    "End date cannot be before start date."
                );
            }


            // ---------------------------------------------
            // TOTAL DAYS
            // ---------------------------------------------

            const difference =
                end.getTime() -
                start.getTime();


            const millisecondsPerDay =
                1000 *
                60 *
                60 *
                24;


            const calculatedDays =
                Math.floor(
                    difference /
                    millisecondsPerDay
                ) + 1;


            this.totalDays =
                calculatedDays;
        }


        // ---------------------------------------------
        // TOTAL DAYS VALIDATION
        // ---------------------------------------------

        if (
            !this.totalDays ||
            this.totalDays < 1
        ) {

            throw new Error(
                "Leave duration must be at least one day."
            );
        }
    }
);


// =====================================================
// INDEXES
// =====================================================

leaveSchema.index({
    employee: 1,
    startDate: 1,
    endDate: 1,
});


leaveSchema.index({
    employee: 1,
    status: 1,
});


leaveSchema.index({
    leaveCategory: 1,
    status: 1,
});


leaveSchema.index({
    status: 1,
    createdAt: -1,
});


leaveSchema.index({
    createdAt: -1,
});


// =====================================================
// MODEL
// =====================================================

const Leave =
    mongoose.model(
        "Leave",
        leaveSchema
    );


// =====================================================
// EXPORT
// =====================================================

module.exports = Leave;