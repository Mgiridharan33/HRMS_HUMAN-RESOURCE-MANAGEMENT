const mongoose = require("mongoose");


/*
=====================================================
BREAK SUB-SCHEMA
=====================================================
*/

const breakSchema = new mongoose.Schema(
    {
        start: {
            type: Date,
            default: null,
        },

        end: {
            type: Date,
            default: null,
        },

        durationMinutes: {
            type: Number,
            default: 0,
        },
    },
    {
        _id: true,
    }
);


/*
=====================================================
LUNCH SUB-SCHEMA
=====================================================
*/

const lunchSchema = new mongoose.Schema(
    {
        start: {
            type: Date,
            default: null,
        },

        end: {
            type: Date,
            default: null,
        },

        totalMinutes: {
            type: Number,
            default: 0,
        },
    },
    {
        _id: false,
    }
);


/*
=====================================================
ATTENDANCE SCHEMA
=====================================================
*/

const attendanceSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },


        /*
        ==============================================
        DATE
        ==============================================
        */

        date: {
            type: Date,
            required: true,
        },


        /*
        ==============================================
        PUNCH IN / OUT
        ==============================================
        */

        punchIn: {
            type: Date,
            default: null,
        },

        punchOut: {
            type: Date,
            default: null,
        },


        /*
        ==============================================
        BREAKS
        ==============================================
        */

        breaks: {
            type: [breakSchema],
            default: [],
        },


        /*
        ==============================================
        LUNCH
        ==============================================
        */

        lunch: {
            type: lunchSchema,
            default: () => ({
                start: null,
                end: null,
                totalMinutes: 0,
            }),
        },


        /*
        ==============================================
        TOTAL BREAK TIME
        ==============================================
        */

        totalBreakMinutes: {
            type: Number,
            default: 0,
        },


        /*
        ==============================================
        TOTAL WORKING TIME
        ==============================================
        */

        totalWorkingMinutes: {
            type: Number,
            default: 0,
        },


        /*
        ==============================================
        TOTAL WORKING SECONDS
        ==============================================
        */

        totalWorkingSeconds: {
            type: Number,
            default: 0,
        },


        /*
        ==============================================
        STATUS
        ==============================================
        */

        status: {
            type: String,

            enum: [
                "Present",
                "Absent",
                "Half Day",
                "Leave",
                "Completed",
            ],

            default: "Present",
        },
    },

    {
        timestamps: true,
    }
);


/*
=====================================================
ONE ATTENDANCE RECORD PER EMPLOYEE PER DAY
=====================================================
*/

attendanceSchema.index(
    {
        employee: 1,
        date: 1,
    },
    {
        unique: true,
    }
);


/*
=====================================================
MODEL
=====================================================
*/

module.exports =
    mongoose.model(
        "Attendance",
        attendanceSchema
    );