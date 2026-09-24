const mongoose = require("mongoose");


const JobApplicationSchema =
    new mongoose.Schema(
        {

            // =====================================================
            // EXISTING CANDIDATE
            // =====================================================

            candidate: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Candidate",
                required: true,
            },


            // =====================================================
            // EXISTING JOB
            // =====================================================

            job: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Job",
                required: true,
            },


            // =====================================================
            // SNAPSHOT FIELDS
            // =====================================================

            candidateName: {
                type: String,
                trim: true,
            },

            candidateEmail: {
                type: String,
                trim: true,
            },

            candidatePhone: {
                type: String,
                trim: true,
            },

            candidateProfileImage: {
                type: String,
                trim: true,
            },

            candidateResume: {
                type: String,
                trim: true,
            },

            candidateSkills: {
                type: [String],
                default: [],
            },

            candidateEducation: {
                type: String,
                trim: true,
            },

            candidateExperience: {
                type: String,
                trim: true,
            },

            candidateAddress: {
                type: String,
                trim: true,
            },

            jobTitle: {
                type: String,
                trim: true,
            },

            jobDepartment: {
                type: String,
                trim: true,
            },

            jobLocation: {
                type: String,
                trim: true,
            },


            // =====================================================
            // APPLICATION STATUS
            // =====================================================

            status: {
                type: String,

                enum: [
                    "Pending",
                    "Shortlisted",
                    "Interview",
                    "Selected",
                    "Rejected",
                    "Withdrawn",
                ],

                default: "Pending",
            },


            // =====================================================
            // NEW HR DISTRIBUTION FLOW
            // =====================================================

            /*
            false
                Candidate application is waiting for Super Admin.

            true
                Super Admin sent the application to all active HRs.
            */

            sentToHR: {
                type: Boolean,
                default: false,
            },


            /*
            Who sent the application to HR.
            */

            sentToHRBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null,
            },


            /*
            When Super Admin sent the application to HR.
            */

            sentToHRAt: {
                type: Date,
                default: null,
            },


            /*
            The HR who won the application.

            IMPORTANT:

            Only ONE HR can accept an application.
            */

            acceptedByHR: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null,
            },


            /*
            When HR accepted the application.
            */

            acceptedByHRAt: {
                type: Date,
                default: null,
            },


            // =====================================================
            // BACKWARD COMPATIBILITY
            // =====================================================

            /*
            Keep these because your existing application code
            already uses them.

            After an HR accepts:

            assignedHR = acceptedByHR
            assignedBy = sentToHRBy
            assignedAt = acceptedByHRAt
            */

            assignedHR: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
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
            // REVIEW
            // =====================================================

            reviewedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null,
            },

            reviewedAt: {
                type: Date,
                default: null,
            },

            adminNotes: {
                type: String,
                trim: true,
                default: "",
            },

            coverLetter: {
                type: String,
                trim: true,
                default: "",
            },

            confirmationEmailSentAt: {
                type: Date,
                default: null,
            },

            confirmationEmailSentBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null,
            },

            confirmationEmailMessageId: {
                type: String,
                trim: true,
                default: "",
            },

        },

        {
            timestamps: true,
        }
    );


// =========================================================
// IMPORTANT INDEX
// =========================================================

JobApplicationSchema.index({
    sentToHR: 1,
    acceptedByHR: 1,
});

JobApplicationSchema.index({
    acceptedByHR: 1,
});

JobApplicationSchema.index({
    assignedHR: 1,
});


module.exports =
    mongoose.model(
        "JobApplication",
        JobApplicationSchema
    );