const mongoose = require("mongoose");

const AptitudeQuestionSchema =
    new mongoose.Schema(
        {
            assignment: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "AptitudeQuestionAssignment",
                required: true,
            },

            job: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Job",
                required: true,
            },

            question: {
                type: String,
                required: true,
                trim: true,
            },

            options: {
                type: [String],
                required: true,
                validate: {
                    validator: value =>
                        Array.isArray(value) &&
                        value.length >= 2,
                    message:
                        "At least two options are required",
                },
            },

            correctAnswer: {
                type: Number,
                required: true,
                min: 0,
            },

            marks: {
                type: Number,
                default: 1,
                min: 1,
            },

            createdBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Employee",
                default: null,
            },

                createdByEmployee: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Employee",
                    default: null,
                },
        },

        {
            timestamps: true,
        }
    );


AptitudeQuestionSchema.index({
    assignment: 1,
});

AptitudeQuestionSchema.index({
    job: 1,
});


module.exports =
    mongoose.model(
        "AptitudeQuestion",
        AptitudeQuestionSchema
    );