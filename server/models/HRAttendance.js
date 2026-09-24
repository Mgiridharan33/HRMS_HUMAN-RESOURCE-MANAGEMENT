const mongoose = require("mongoose");


/*
=====================================================
BREAK SUB-SCHEMA
=====================================================
*/

const hrBreakSchema = new mongoose.Schema(
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

const hrLunchSchema = new mongoose.Schema(
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
HR ATTENDANCE SCHEMA
=====================================================
*/

const hrAttendanceSchema = new mongoose.Schema(
    {

        /*
        ==============================================
        HR USER
        ==============================================
        */

        hr: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
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
        PUNCH IN
        ==============================================
        */

        punchIn: {
            type: Date,
            default: null,
        },


        /*
        ==============================================
        PUNCH OUT
        ==============================================
        */

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
            type: [hrBreakSchema],
            default: [],
        },


        /*
        ==============================================
        LUNCH
        ==============================================
        */

        lunch: {
            type: hrLunchSchema,

            default: () => ({
                start: null,
                end: null,
                totalMinutes: 0,
            }),
        },


        /*
        ==============================================
        TOTAL BREAK MINUTES
        ==============================================
        */

        totalBreakMinutes: {
            type: Number,
            default: 0,
        },


        /*
        ==============================================
        TOTAL LUNCH MINUTES
        ==============================================
        */

        totalLunchMinutes: {
            type: Number,
            default: 0,
        },


        /*
        ==============================================
        TOTAL WORKING MINUTES
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
ONE HR ATTENDANCE RECORD PER HR PER DAY
=====================================================
*/

hrAttendanceSchema.index(
    {
        hr: 1,
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
        "HRAttendance",
        hrAttendanceSchema
    );