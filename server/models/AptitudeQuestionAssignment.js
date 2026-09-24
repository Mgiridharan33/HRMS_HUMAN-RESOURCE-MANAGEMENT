const mongoose = require("mongoose");

const AptitudeQuestionAssignmentSchema =
    new mongoose.Schema(
        {
            // =====================================================
            // APPLICATION
            // =====================================================

            jobApplication: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "JobApplication",
                required: true,
            },

            // =====================================================
            // JOB
            // =====================================================

            job: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Job",
                required: true,
                index: true,
            },

            // =====================================================
            // CANDIDATE
            // =====================================================

            candidate: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Candidate",
                default: null,
            },

            // =====================================================
            // HR WHO ACCEPTED THE APPLICATION
            // =====================================================

            assignedHR: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null,
                index: true,
            },

            // =====================================================
            // EMPLOYEE
            // =====================================================

            assignedEmployee: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Employee",
                default: null,
            },

            assignedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null,
            },

            assignedAt: {
                type: Date,
                default: null,
            },

            // =====================================================
            // QUESTION WORKFLOW
            // =====================================================

            requiredQuestionCount: {
                type: Number,
                required: true,
                min: 1,
                default: 20,
            },

            questionCount: {
                type: Number,
                default: 0,
                min: 0,
            },

            // =====================================================
            // QUESTION SOURCE
            // =====================================================

            questionSource: {
                type: String,

                enum: [
                    "New",
                    "Reused",
                ],

                default: "New",
            },

            // =====================================================
            // ORIGINAL ASSIGNMENT USED FOR REUSE
            // =====================================================

            sourceAssignment: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "AptitudeQuestionAssignment",
                default: null,
            },

            // =====================================================
            // STATUS
            // =====================================================

            status: {
                type: String,

                enum: [
                    "Assigned",
                    "InProgress",
                    "Submitted",
                    "Completed",
                    "AdminReview",
                    "Resubmitted",
                    "Rejected",
                    "Approved",
                    "SentToHR",
                    "SentToCandidate",
                ],

                default: "Assigned",
            },

            // =====================================================
            // REVIEW
            // =====================================================

            rejectionReason: {
                type: String,
                trim: true,
                default: "",
            },

            rejectedAt: {
                type: Date,
                default: null,
            },

            approvedAt: {
                type: Date,
                default: null,
            },

            approvedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null,
            },

            verifiedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null,
            },

            verifiedAt: {
                type: Date,
                default: null,
            },

            sentToHRAt: {
                type: Date,
                default: null,
            },

            sentToCandidateAt: {
                type: Date,
                default: null,
            },

            candidateSubmittedAt: {
                type: Date,
                default: null,
            },
        },

        {
            timestamps: true,
        }
    );


// =========================================================
// INDEXES
// =========================================================

AptitudeQuestionAssignmentSchema.index({
    job: 1,
    status: 1,
});

AptitudeQuestionAssignmentSchema.index({
    jobApplication: 1,
});

AptitudeQuestionAssignmentSchema.index({
    candidate: 1,
});

AptitudeQuestionAssignmentSchema.index({
    assignedEmployee: 1,
});


module.exports =
    mongoose.model(
        "AptitudeQuestionAssignment",
        AptitudeQuestionAssignmentSchema
    );