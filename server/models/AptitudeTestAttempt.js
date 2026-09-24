const mongoose = require("mongoose");


const answerSchema =
    new mongoose.Schema(
        {

            question: {
                type:
                    mongoose.Schema.Types.ObjectId,
                ref: "AptitudeQuestion",
                required: true,
            },

            selectedOption: {
                type: String,
                trim: true,
                default: "",
            },

            isCorrect: {
                type: Boolean,
                default: false,
            },

            answeredAt: {
                type: Date,
                default: null,
            },

        },
        {
            _id: false,
        }
    );


const aptitudeTestAttemptSchema =
    new mongoose.Schema(
        {

            // =================================================
            // QUESTION ASSIGNMENT
            // =================================================

            assignment: {
                type:
                    mongoose.Schema.Types.ObjectId,
                ref:
                    "AptitudeQuestionAssignment",
                required: true,
            },


            // =================================================
            // APPLICATION
            // =================================================

            jobApplication: {
                type:
                    mongoose.Schema.Types.ObjectId,
                ref:
                    "JobApplication",
                required: true,
            },


            // =================================================
            // CANDIDATE
            // =================================================

            candidate: {
                type:
                    mongoose.Schema.Types.ObjectId,
                ref:
                    "Candidate",
                required: true,
            },


            // =================================================
            // HR
            // =================================================

            assignedHR: {
                type:
                    mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },


            // =================================================
            // QUESTIONS
            // =================================================

            answers: {
                type: [answerSchema],
                default: [],
            },


            // =================================================
            // RESULT
            // =================================================

            totalQuestions: {
                type: Number,
                default: 0,
            },

            answeredQuestions: {
                type: Number,
                default: 0,
            },

            correctAnswers: {
                type: Number,
                default: 0,
            },

            wrongAnswers: {
                type: Number,
                default: 0,
            },

            score: {
                type: Number,
                default: 0,
            },

            percentage: {
                type: Number,
                default: 0,
            },


            // =================================================
            // ATTEMPT STATUS
            // =================================================

            status: {
                type: String,

                enum: [
                    "Started",
                    "Submitted",
                    "Expired",
                ],

                default: "Started",
            },


            // =================================================
            // TIME
            // =================================================

            startedAt: {
                type: Date,
                default: null,
            },

            submittedAt: {
                type: Date,
                default: null,
            },

            expiresAt: {
                type: Date,
                default: null,
            },


            // =================================================
            // FINAL RESULT
            // =================================================

            resultPublished: {
                type: Boolean,
                default: false,
            },

        },

        {
            timestamps: true,
        }
    );


// =========================================================
// IMPORTANT INDEXES
// =========================================================

// One candidate gets only ONE attempt for one assignment.

aptitudeTestAttemptSchema.index(
    {
        assignment: 1,
        candidate: 1,
    },
    {
        unique: true,
    }
);


aptitudeTestAttemptSchema.index({
    assignedHR: 1,
});


aptitudeTestAttemptSchema.index({
    jobApplication: 1,
});


module.exports =
    mongoose.model(
        "AptitudeTestAttempt",
        aptitudeTestAttemptSchema
    );