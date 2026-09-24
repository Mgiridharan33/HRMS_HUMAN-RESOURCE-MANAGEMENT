const mongoose = require("mongoose");


const VideoInterviewSchema =
    new mongoose.Schema(
        {

            // =================================================
            // APPLICATION
            // =================================================

            jobApplication: {
                type:
                    mongoose.Schema.Types.ObjectId,
                ref:
                    "JobApplication",
                required:
                    true,
                index:
                    true,
            },


            // =================================================
            // JOB
            // =================================================

            job: {
                type:
                    mongoose.Schema.Types.ObjectId,
                ref:
                    "Job",
                required:
                    true,
                index:
                    true,
            },


            // =================================================
            // CANDIDATE
            // =================================================

            candidate: {
                type:
                    mongoose.Schema.Types.ObjectId,
                ref:
                    "Candidate",
                required:
                    true,
                index:
                    true,
            },


            // =================================================
            // HR
            // =================================================

            assignedHR: {
                type:
                    mongoose.Schema.Types.ObjectId,
                ref:
                    "User",
                default:
                    null,
                index:
                    true,
            },


            // =================================================
            // EMPLOYEE
            // =================================================

            assignedEmployee: {
                type:
                    mongoose.Schema.Types.ObjectId,
                ref:
                    "Employee",
                required:
                    true,
                index:
                    true,
            },


            assignedBy: {
                type:
                    mongoose.Schema.Types.ObjectId,
                ref:
                    "User",
                default:
                    null,
            },


            assignedAt: {
                type:
                    Date,
                default:
                    null,
            },


            // =================================================
            // STATUS
            // =================================================

            status: {

                type:
                    String,

                enum: [

                    "PendingSchedule",

                    "Scheduled",

                    "SchedulePendingApproval",

                    "ScheduleApproved",

                    "ScheduleRejected",

                    "Approved",

                    "SentToHR",

                    "SentToCandidate",

                    "MeetingStarted",

                    "Completed",

                    "Cancelled",

                    "Rejected",

                ],

                default:
                    "PendingSchedule",

                index:
                    true,
            },


            // =================================================
            // SCHEDULE
            // =================================================

            scheduledDate: {
                type:
                    Date,
                default:
                    null,
            },


            scheduledAt: {
                type:
                    Date,
                default:
                    null,
            },


            startTime: {
                type:
                    String,
                trim:
                    true,
                default:
                    "",
            },


            endTime: {
                type:
                    String,
                trim:
                    true,
                default:
                    "",
            },


            // =================================================
            // MEETING
            // =================================================

            meetingLink: {
                type:
                    String,
                trim:
                    true,
                default:
                    "",
            },


            meetingPlatform: {
                type:
                    String,
                trim:
                    true,
                default:
                    "Google Meet",
            },


            meetingNotes: {
                type:
                    String,
                trim:
                    true,
                default:
                    "",
            },


            recordingUrl: {
                type:
                    String,
                trim:
                    true,
                default:
                    "",
            },


            // =================================================
            // ADMIN APPROVAL
            // =================================================

            scheduleSubmittedAt: {
                type:
                    Date,
                default:
                    null,
            },


            scheduleApprovedAt: {
                type:
                    Date,
                default:
                    null,
            },


            scheduleApprovedBy: {
                type:
                    mongoose.Schema.Types.ObjectId,
                ref:
                    "User",
                default:
                    null,
            },


            scheduleRejectedAt: {
                type:
                    Date,
                default:
                    null,
            },


            scheduleRejectedReason: {
                type:
                    String,
                trim:
                    true,
                default:
                    "",
            },


            // =================================================
            // SENT TO HR
            // =================================================

            sentToHRAt: {
                type:
                    Date,
                default:
                    null,
            },


            // =================================================
            // SENT TO CANDIDATE
            // =================================================

            sentToCandidateAt: {
                type:
                    Date,
                default:
                    null,
            },


            // =================================================
            // MEETING
            // =================================================

            meetingStartedAt: {
                type:
                    Date,
                default:
                    null,
            },


            meetingCompletedAt: {
                type:
                    Date,
                default:
                    null,
            },


            completedAt: {
                type:
                    Date,
                default:
                    null,
            },


            completedBy: {
                type:
                    mongoose.Schema.Types.ObjectId,
                ref:
                    "Employee",
                default:
                    null,
            },


            employeeReview: {
                type:
                    String,
                trim:
                    true,
                default:
                    "",
            },


            performanceRating: {
                type:
                    Number,
                min:
                    1,
                max:
                    5,
                default:
                    null,
            },


            employeeRecommendation: {
                type:
                    String,
                enum: [
                    "Strongly Recommend",
                    "Recommend",
                    "Hold",
                    "Do Not Recommend",
                    "",
                ],
                default:
                    "",
            },

        },

        {
            timestamps:
                true,
        }
    );


VideoInterviewSchema.index({
    assignedEmployee: 1,
    status: 1,
});


VideoInterviewSchema.index({
    assignedHR: 1,
    status: 1,
});


VideoInterviewSchema.index({
    candidate: 1,
    status: 1,
});


VideoInterviewSchema.index({
    scheduledDate: 1,
});


module.exports =
    mongoose.model(
        "VideoInterview",
        VideoInterviewSchema
    );