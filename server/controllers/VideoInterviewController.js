const mongoose = require("mongoose");

const VideoInterview =
    require("../models/VideoInterview");

const AptitudeTestAttempt =
    require("../models/AptitudeTestAttempt");

const JobApplication =
    require("../models/JobApplication");

const Employee =
    require("../models/Employee");

const Candidate =
    require("../models/Candidate");


// ============================================================
// HELPERS
// ============================================================

const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};


const getUserId = (req) => {
    return (
        req.user?._id ||
        req.user?.id ||
        null
    );
};


const getUserType = (req) => {
    return String(
        req.userType ||
        req.user?.role ||
        ""
    )
        .trim()
        .toUpperCase();
};


const isAdmin = (req) => {
    return getUserType(req) === "SUPER_ADMIN";
};


const isHR = (req) => {
    return getUserType(req) === "HR";
};


const isEmployee = (req) => {
    return getUserType(req) === "EMPLOYEE";
};


// ============================================================
// COMMON POPULATE
// ============================================================

const populateInterview = async (
    interviewId
) => {

    return await VideoInterview.findById(
        interviewId
    )

        .populate(
            "candidate",
            "firstName lastName name email phone profileImage"
        )

        .populate(
            "assignedEmployee",
            "employeeId firstName lastName name email department designation profileImage"
        )

        .populate(
            "assignedHR",
            "name email"
        )

        .populate(
            "assignedBy",
            "name email role"
        )

        .populate(
            "scheduleApprovedBy",
            "name email role"
        )

        .populate(
            "job",
            "title department designation"
        )

        .populate(
            "jobApplication"
        );
};


// ============================================================
// ADMIN
// GET EMPLOYEES
// ============================================================

const getVideoInterviewEmployees =
    async (req, res) => {

        try {

            if (!isAdmin(req)) {

                return res.status(403).json({
                    success: false,
                    message:
                        "Only Super Admin can load interview employees",
                });

            }


            const employees =
                await Employee.find({
                    $or: [
                        {
                            status: {
                                $in: [
                                    "Active",
                                    "active",
                                ],
                            },
                        },
                        {
                            isActive: true,
                        },
                    ],
                })

                    .select(
                        "_id employeeId firstName lastName name email department designation profileImage status isActive"
                    )

                    .sort({
                        firstName: 1,
                        lastName: 1,
                    })

                    .lean();


            return res.json({

                success: true,

                employees,

            });

        } catch (error) {

            console.error(
                "GET VIDEO INTERVIEW EMPLOYEES ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to load employees",

            });

        }

    };


// ============================================================
// ADMIN
// GET APTITUDE COMPLETED CANDIDATES
// ============================================================

const getVideoInterviewEligibleApplications =
    async (req, res) => {

        try {

            if (!isAdmin(req)) {

                return res.status(403).json({
                    success: false,
                    message:
                        "Only Super Admin can access eligible candidates",
                });

            }


            const attempts =
                await AptitudeTestAttempt.find({

                    status: "Submitted",

                })

                    .populate({
                        path: "candidate",
                        select:
                            "firstName lastName name email phone profileImage",
                    })

                    .populate({
                        path: "jobApplication",
                        populate: [
                            {
                                path: "job",
                                select:
                                    "title department designation",
                            },
                            {
                                path: "assignedHR",
                                select:
                                    "name email",
                            },
                            {
                                path: "acceptedByHR",
                                select:
                                    "name email",
                            },
                        ],
                    })

                    .sort({
                        submittedAt: -1,
                    })

                    .lean();


            const result = [];


            for (
                const attempt of attempts
            ) {

                if (
                    !attempt.jobApplication
                ) {

                    continue;

                }


                const existingInterview =
                    await VideoInterview.findOne({

                        jobApplication:
                            attempt.jobApplication._id,

                        status: {
                            $nin: [
                                "Cancelled",
                                "Rejected",
                            ],
                        },

                    })

                        .select(
                                "_id status assignedEmployee scheduledDate scheduledAt startTime endTime meetingLink meetingPlatform meetingNotes recordingUrl scheduleSubmittedAt completedAt completedBy employeeReview performanceRating employeeRecommendation"
                        )

                            .populate(
                                "assignedEmployee",
                                "employeeId firstName lastName name email department designation"
                            )

                        .lean();


                result.push({

                    aptitudeAttempt:
                        attempt._id,

                    jobApplication:
                        attempt.jobApplication,

                    candidate:
                        attempt.candidate,

                    score:
                        attempt.score,

                    percentage:
                        attempt.percentage,

                    totalQuestions:
                        attempt.totalQuestions,

                    answeredQuestions:
                        attempt.answeredQuestions,

                    correctAnswers:
                        attempt.correctAnswers,

                    wrongAnswers:
                        attempt.wrongAnswers,

                    submittedAt:
                        attempt.submittedAt,

                    videoInterview:
                        existingInterview ||
                        null,

                });

            }


            return res.json({

                success: true,

                applications: result,

            });

        } catch (error) {

            console.error(
                "GET VIDEO INTERVIEW ELIGIBLE APPLICATIONS ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to load eligible candidates",

                error:
                    error.message,

            });

        }

    };


// ============================================================
// ADMIN
// ASSIGN EMPLOYEE
// ============================================================

const assignVideoInterviewEmployee =
    async (req, res) => {

        try {

            if (!isAdmin(req)) {

                return res.status(403).json({
                    success: false,
                    message:
                        "Only Super Admin can assign interview employees",
                });

            }


            const {
                jobApplicationId,
                employeeId,
            } = req.body;


            if (
                !jobApplicationId ||
                !employeeId
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Job application and employee are required",

                });

            }


            if (
                !isValidObjectId(
                    jobApplicationId
                ) ||
                !isValidObjectId(
                    employeeId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid application or employee ID",

                });

            }


            // ==================================================
            // APTITUDE
            // ==================================================

            const aptitudeAttempt =
                await AptitudeTestAttempt.findOne({

                    jobApplication:
                        jobApplicationId,

                    status:
                        "Submitted",

                });


            if (!aptitudeAttempt) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Candidate must complete the aptitude test before video interview",

                });

            }


            // ==================================================
            // APPLICATION
            // ==================================================

            const application =
                await JobApplication.findById(
                    jobApplicationId
                );


            if (!application) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Job application not found",

                });

            }


            // ==================================================
            // EMPLOYEE
            // ==================================================

            const employee =
                await Employee.findById(
                    employeeId
                );


            if (!employee) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Employee not found",

                });

            }


            if (
                employee.isActive === false
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Selected employee is inactive",

                });

            }


            // ==================================================
            // EXISTING INTERVIEW
            // ==================================================

            const existingInterview =
                await VideoInterview.findOne({

                    jobApplication:
                        jobApplicationId,

                    status: {
                        $nin: [
                            "Cancelled",
                            "Rejected",
                        ],
                    },

                });


            if (existingInterview) {

                return res.status(409).json({

                    success: false,

                    message:
                        "A video interview already exists for this candidate",

                    interview:
                        existingInterview,

                });

            }


            // ==================================================
            // HR
            // ==================================================

            const assignedHR =
                application.assignedHR ||
                application.acceptedByHR ||
                null;


            // ==================================================
            // CREATE
            // ==================================================

            const interview =
                await VideoInterview.create({

                    jobApplication:
                        application._id,

                    job:
                        application.job,

                    candidate:
                        aptitudeAttempt.candidate,

                    assignedHR,

                    assignedEmployee:
                        employee._id,

                    assignedBy:
                        getUserId(req),

                    assignedAt:
                        new Date(),

                    status:
                        "PendingSchedule",

                });


            const populatedInterview =
                await populateInterview(
                    interview._id
                );


            return res.status(201).json({

                success: true,

                message:
                    "Employee assigned for video interview",

                interview:
                    populatedInterview,

            });

        } catch (error) {

            console.error(
                "ASSIGN VIDEO INTERVIEW EMPLOYEE ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to assign employee",

                error:
                    error.message,

            });

        }

    };


// ============================================================
// EMPLOYEE
// GET MY VIDEO INTERVIEWS
// ============================================================

const getEmployeeVideoInterviews =
    async (req, res) => {

        try {

            if (!isEmployee(req)) {

                return res.status(403).json({
                    success: false,
                    message:
                        "Only employees can access assigned interviews",
                });

            }


            const employeeId =
                getUserId(req);


            if (!employeeId) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Employee authentication information missing",
                });

            }


            const interviews =
                await VideoInterview.find({

                    assignedEmployee:
                        employeeId,

                })

                    .populate(
                        "candidate",
                        "firstName lastName name email phone profileImage"
                    )

                    .populate(
                        "job",
                        "title department designation"
                    )

                    .populate(
                        "assignedHR",
                        "name email"
                    )

                    .populate(
                        "jobApplication"
                    )

                    .sort({
                        createdAt: -1,
                    });


            return res.json({

                success: true,

                interviews,

            });

        } catch (error) {

            console.error(
                "GET EMPLOYEE VIDEO INTERVIEWS ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to load assigned interviews",

            });

        }

    };


// ============================================================
// EMPLOYEE
// GET SINGLE ASSIGNED INTERVIEW
// ============================================================

const getEmployeeVideoInterviewById =
    async (req, res) => {

        try {

            if (!isEmployee(req)) {

                return res.status(403).json({
                    success: false,
                    message:
                        "Only employees can access this interview",
                });

            }


            const {
                id,
            } = req.params;


            if (
                !isValidObjectId(id)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid interview ID",

                });

            }


            const employeeId =
                getUserId(req);


            const interview =
                await populateInterview(id);


            if (!interview) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Video interview not found",

                });

            }


            if (
                String(
                    interview.assignedEmployee?._id
                ) !==
                String(employeeId)
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "This interview is not assigned to you",

                });

            }


            return res.json({

                success: true,

                interview,

            });

        } catch (error) {

            console.error(
                "GET EMPLOYEE VIDEO INTERVIEW ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to load interview",

            });

        }

    };


// ============================================================
// EMPLOYEE
// SCHEDULE INTERVIEW
// ============================================================

const scheduleVideoInterview =
    async (req, res) => {

        try {

            if (!isEmployee(req)) {

                return res.status(403).json({
                    success: false,
                    message:
                        "Only assigned employee can schedule interview",
                });

            }


            const {
                id,
            } = req.params;


            const {
                scheduledDate,
                scheduledStartTime,
                scheduledEndTime,
                scheduledAt,
                durationMinutes,
                meetingLink,
                meetingTitle,
                meetingNotes,
            } = req.body;


            if (
                !isValidObjectId(id)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid interview ID",

                });

            }


            const requestedScheduledAt =
                scheduledAt ||
                (
                    scheduledDate &&
                    scheduledStartTime
                        ? `${scheduledDate}T${scheduledStartTime}`
                        : null
                );


            if (
                !requestedScheduledAt
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Meeting date and time are required",

                });

            }


            if (
                !meetingLink ||
                !String(
                    meetingLink
                ).trim()
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Meeting link is required",

                });

            }


            const scheduleDate =
                new Date(
                    requestedScheduledAt
                );


            if (
                Number.isNaN(
                    scheduleDate.getTime()
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid meeting date and time",

                });

            }


            if (
                scheduleDate <= new Date()
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Meeting must be scheduled for a future date and time",

                });

            }


            const employeeId =
                getUserId(req);


            const interview =
                await VideoInterview.findById(
                    id
                );


            if (!interview) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Video interview not found",

                });

            }


            if (
                String(
                    interview.assignedEmployee
                ) !==
                String(employeeId)
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "This interview is not assigned to you",

                });

            }


            if (
                [
                    "Approved",
                    "SentToHR",
                    "SentToCandidate",
                    "Completed",
                    "Cancelled",
                    "Rejected",
                ].includes(
                    interview.status
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        `Interview cannot be scheduled while status is ${interview.status}`,

                });

            }


            interview.scheduledAt =
                scheduleDate;


            if (scheduledDate) {

                interview.scheduledDate =
                    new Date(scheduledDate);

            }


            if (scheduledStartTime) {

                interview.scheduledStartTime =
                    String(scheduledStartTime).trim();

            }


            if (scheduledEndTime) {

                interview.scheduledEndTime =
                    String(scheduledEndTime).trim();

            }


            interview.durationMinutes =
                Number(
                    durationMinutes
                ) || 30;


            interview.meetingLink =
                String(
                    meetingLink
                ).trim();


            interview.meetingTitle =
                String(
                    meetingTitle ||
                    "Video Interview"
                ).trim();


            interview.meetingNotes =
                String(
                    meetingNotes ||
                    ""
                ).trim();


            interview.status =
                "Scheduled";


            interview.scheduledBy =
                employeeId;


            interview.scheduledAtByEmployee =
                new Date();


            await interview.save();


            const populatedInterview =
                await populateInterview(
                    interview._id
                );


            return res.json({

                success: true,

                message:
                    "Interview scheduled and sent to admin for approval",

                interview:
                    populatedInterview,

            });

        } catch (error) {

            console.error(
                "SCHEDULE VIDEO INTERVIEW ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to schedule video interview",

                error:
                    error.message,

            });

        }

    };


// ============================================================
// ADMIN
// GET INTERVIEWS WAITING FOR APPROVAL
// ============================================================

const getAdminVideoInterviews =
    async (req, res) => {

        try {

            if (!isAdmin(req)) {

                return res.status(403).json({
                    success: false,
                    message:
                        "Only Super Admin can access interview approvals",
                });

            }


            const interviews =
                await VideoInterview.find({})

                    .populate(
                        "candidate",
                        "firstName lastName name email phone profileImage"
                    )

                    .populate(
                        "assignedEmployee",
                        "employeeId firstName lastName name email department designation"
                    )

                    .populate(
                        "assignedHR",
                        "name email"
                    )

                    .populate(
                        "job",
                        "title department designation"
                    )

                    .populate(
                        "jobApplication"
                    )

                    .sort({
                        createdAt: -1,
                    });


            return res.json({

                success: true,

                interviews,

            });

        } catch (error) {

            console.error(
                "GET ADMIN VIDEO INTERVIEWS ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to load video interviews",

            });

        }

    };


// ============================================================
// ADMIN
// APPROVE SCHEDULE
// ============================================================

const approveVideoInterview =
    async (req, res) => {

        try {

            if (!isAdmin(req)) {

                return res.status(403).json({
                    success: false,
                    message:
                        "Only Super Admin can approve interviews",
                });

            }


            const {
                id,
            } = req.params;


            if (
                !isValidObjectId(id)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid interview ID",

                });

            }


            const interview =
                await VideoInterview.findById(
                    id
                );


            if (!interview) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Video interview not found",

                });

            }


            if (
                ![
                    "Scheduled",
                    "SchedulePendingApproval",
                ].includes(
                    interview.status
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Only scheduled interviews can be approved",

                });

            }


            if (
                !(
                    interview.scheduledAt ||
                    interview.scheduledDate
                ) ||
                !interview.meetingLink
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Interview schedule and meeting link are required",

                });

            }


            interview.status =
                "Approved";


            interview.scheduleApprovedBy =
                getUserId(req);


            interview.scheduleApprovedAt =
                new Date();


            await interview.save();


            const populatedInterview =
                await populateInterview(
                    interview._id
                );


            return res.json({

                success: true,

                message:
                    "Video interview approved and sent to HR",

                interview:
                    populatedInterview,

            });

        } catch (error) {

            console.error(
                "APPROVE VIDEO INTERVIEW ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to approve video interview",

            });

        }

    };


// ============================================================
// ADMIN
// REJECT SCHEDULE
// ============================================================

const rejectVideoInterview =
    async (req, res) => {

        try {

            if (!isAdmin(req)) {

                return res.status(403).json({
                    success: false,
                    message:
                        "Only Super Admin can reject interviews",
                });

            }


            const {
                id,
            } = req.params;


            const {
                rejectionReason,
            } = req.body;


            if (
                !isValidObjectId(id)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid interview ID",

                });

            }


            const interview =
                await VideoInterview.findById(
                    id
                );


            if (!interview) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Video interview not found",

                });

            }


            interview.status =
                "ScheduleRejected";


            interview.rejectionReason =
                String(
                    rejectionReason ||
                    "Interview schedule rejected by admin"
                ).trim();


            interview.rejectedAt =
                new Date();


            interview.rejectedBy =
                getUserId(req);


            await interview.save();


            const populatedInterview =
                await populateInterview(
                    interview._id
                );


            return res.json({

                success: true,

                message:
                    "Video interview schedule rejected",

                interview:
                    populatedInterview,

            });

        } catch (error) {

            console.error(
                "REJECT VIDEO INTERVIEW ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to reject interview",

            });

        }

    };


// ============================================================
// HR
// GET APPROVED INTERVIEWS
// ============================================================

const getHRVideoInterviews =
    async (req, res) => {

        try {

            if (!isHR(req)) {

                return res.status(403).json({
                    success: false,
                    message:
                        "Only HR can access video interviews",
                });

            }


            const hrId =
                getUserId(req);


            const interviews =
                await VideoInterview.find({

                    assignedHR:
                        hrId,

                    status: {
                        $in: [
                            "Approved",
                            "SentToHR",
                            "SentToCandidate",
                            "Completed",
                        ],
                    },

                })

                    .populate(
                        "candidate",
                        "firstName lastName name email phone profileImage"
                    )

                    .populate(
                        "assignedEmployee",
                        "employeeId firstName lastName name email department designation"
                    )

                    .populate(
                        "job",
                        "title department designation"
                    )

                    .populate(
                        "jobApplication"
                    )

                    .sort({
                        scheduledAt: 1,
                    });


            return res.json({

                success: true,

                interviews,

            });

        } catch (error) {

            console.error(
                "GET HR VIDEO INTERVIEWS ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to load HR video interviews",

            });

        }

    };


// ============================================================
// HR
// SEND INTERVIEW TO CANDIDATE
// ============================================================

const sendVideoInterviewToCandidate =
    async (req, res) => {

        try {

            if (!isHR(req)) {

                return res.status(403).json({
                    success: false,
                    message:
                        "Only HR can send interview to candidate",
                });

            }


            const {
                id,
            } = req.params;


            if (
                !isValidObjectId(id)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid interview ID",

                });

            }


            const hrId =
                getUserId(req);


            const interview =
                await VideoInterview.findById(
                    id
                );


            if (!interview) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Video interview not found",

                });

            }


            if (
                String(
                    interview.assignedHR
                ) !==
                String(hrId)
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "This interview is not assigned to you",

                });

            }


            if (
                interview.status !==
                "Approved"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Only admin-approved interviews can be sent to candidate",

                });

            }


            const scheduledAt =
                interview.scheduledAt ||
                (
                    interview.scheduledDate &&
                    interview.startTime
                        ? new Date(
                            `${new Date(
                                interview.scheduledDate
                            )
                                .toISOString()
                                .slice(0, 10)}T${interview.startTime}`
                        )
                        : null
                );


            if (
                !interview.meetingLink?.trim() ||
                !scheduledAt ||
                Number.isNaN(
                    new Date(scheduledAt).getTime()
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Meeting schedule is incomplete",

                });

            }


            if (!interview.scheduledAt) {

                interview.scheduledAt =
                    scheduledAt;

            }


            interview.status =
                "SentToCandidate";


            interview.sentToCandidateAt =
                new Date();


            await interview.save();


            const populatedInterview =
                await populateInterview(
                    interview._id
                );


            return res.json({

                success: true,

                message:
                    "Video interview sent to candidate",

                interview:
                    populatedInterview,

            });

        } catch (error) {

            console.error(
                "SEND VIDEO INTERVIEW TO CANDIDATE ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to send interview to candidate",

            });

        }

    };


// ============================================================
// CANDIDATE
// GET MY VIDEO INTERVIEWS
// ============================================================

const getCandidateVideoInterviews =
    async (req, res) => {

        try {

            /*
             * Your candidate auth middleware should set:
             *
             * req.candidate
             *
             * or
             *
             * req.user
             *
             */

            const candidateId =
                req.candidate?._id ||
                req.candidate?.id ||
                req.user?._id ||
                req.user?.id;


            if (!candidateId) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Candidate authentication required",

                });

            }


            const interviews =
                await VideoInterview.find({

                    candidate:
                        candidateId,

                    status: {
                        $in: [
                            "SentToCandidate",
                            "Completed",
                        ],
                    },

                })

                    .populate(
                        "job",
                        "title department designation"
                    )

                    .populate(
                        "assignedEmployee",
                        "firstName lastName name email designation"
                    )

                    .populate(
                        "assignedHR",
                        "name email"
                    )

                    .sort({
                        scheduledAt: 1,
                    });


            return res.json({

                success: true,

                interviews,

            });

        } catch (error) {

            console.error(
                "GET CANDIDATE VIDEO INTERVIEWS ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to load candidate interviews",

            });

        }

    };


// ============================================================
// GET SINGLE CANDIDATE INTERVIEW
// ============================================================

const getCandidateVideoInterviewById =
    async (req, res) => {

        try {

            const candidateId =
                req.candidate?._id ||
                req.candidate?.id ||
                req.user?._id ||
                req.user?.id;


            if (!candidateId) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Candidate authentication required",

                });

            }


            const {
                id,
            } = req.params;


            if (
                !isValidObjectId(id)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid interview ID",

                });

            }


            const interview =
                await populateInterview(id);


            if (!interview) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Video interview not found",

                });

            }


            if (
                String(
                    interview.candidate?._id
                ) !==
                String(candidateId)
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You cannot access this interview",

                });

            }


            return res.json({

                success: true,

                interview,

            });

        } catch (error) {

            console.error(
                "GET CANDIDATE VIDEO INTERVIEW ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to load interview",

            });

        }

    };


// ============================================================
// EMPLOYEE MARK INTERVIEW COMPLETED
// ============================================================

const completeVideoInterview =
    async (req, res) => {

        try {

            const userType =
                getUserType(req);


            if (userType !== "EMPLOYEE") {

                return res.status(403).json({

                    success: false,

                    message:
                        "You are not allowed to complete this interview",

                });

            }


            const {
                id,
            } = req.params;


            const {
                employeeReview,
                performanceRating,
                employeeRecommendation,
            } = req.body;


            if (
                !isValidObjectId(id)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid interview ID",

                });

            }


            const interview =
                await VideoInterview.findById(
                    id
                );


            if (!interview) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Video interview not found",

                });

            }


            const currentUserId =
                getUserId(req);


            if (
                String(
                    interview.assignedEmployee
                ) !==
                String(currentUserId)
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "This interview is not assigned to you",

                });

            }


            if (
                !String(employeeReview || "").trim()
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Employee review is required",

                });

            }


            const normalizedRating =
                performanceRating === undefined ||
                performanceRating === ""
                    ? null
                    : Number(performanceRating);


            if (
                normalizedRating !== null &&
                (
                    !Number.isFinite(normalizedRating) ||
                    normalizedRating < 1 ||
                    normalizedRating > 5
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Performance rating must be between 1 and 5",

                });

            }


            if (
                interview.status !==
                "SentToCandidate"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Only active candidate interviews can be completed",

                });

            }


            interview.status =
                "Completed";


            interview.completedAt =
                new Date();


            interview.meetingCompletedAt =
                interview.completedAt;


            interview.completedBy =
                currentUserId;


            interview.employeeReview =
                String(employeeReview).trim();


            interview.performanceRating =
                normalizedRating;


            interview.employeeRecommendation =
                String(
                    employeeRecommendation ||
                    ""
                ).trim();


            await interview.save();


            const populatedInterview =
                await populateInterview(
                    interview._id
                );


            return res.json({

                success: true,

                message:
                    "Video interview marked as completed",

                interview:
                    populatedInterview,

            });

        } catch (error) {

            console.error(
                "COMPLETE VIDEO INTERVIEW ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to complete interview",

                error:
                    error.message,

            });

        }

    };


// ============================================================
// CANCEL INTERVIEW
// ADMIN / HR / ASSIGNED EMPLOYEE
// ============================================================

const cancelVideoInterview =
    async (req, res) => {

        try {

            const {
                id,
            } = req.params;


            if (
                !isValidObjectId(id)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid interview ID",

                });

            }


            const interview =
                await VideoInterview.findById(
                    id
                );


            if (!interview) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Video interview not found",

                });

            }


            const userType =
                getUserType(req);

            const userId =
                getUserId(req);


            const allowed =
                isAdmin(req) ||

                (
                    isHR(req) &&
                    String(
                        interview.assignedHR
                    ) ===
                    String(userId)
                ) ||

                (
                    isEmployee(req) &&
                    String(
                        interview.assignedEmployee
                    ) ===
                    String(userId)
                );


            if (!allowed) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You are not allowed to cancel this interview",

                });

            }


            interview.status =
                "Cancelled";


            interview.cancelledAt =
                new Date();


            interview.cancelledBy =
                userId;


            interview.cancellationReason =
                String(
                    req.body?.reason ||
                    ""
                ).trim();


            await interview.save();


            return res.json({

                success: true,

                message:
                    "Video interview cancelled",

                interview,

            });

        } catch (error) {

            console.error(
                "CANCEL VIDEO INTERVIEW ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to cancel interview",

            });

        }

    };


// ============================================================
// ASSOCIATE MEETING RECORDING
// ============================================================

const associateVideoInterviewRecording =
    async (req, res) => {

        try {

            const {
                id,
            } = req.params;

            if (!isValidObjectId(id)) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid interview ID",
                });

            }

            const interview =
                await VideoInterview.findById(id);

            if (!interview) {

                return res.status(404).json({
                    success: false,
                    message: "Video interview not found",
                });

            }

            const userId = getUserId(req);
            const allowed =
                isAdmin(req) ||
                (
                    isHR(req) &&
                    String(interview.assignedHR) === String(userId)
                );

            if (!allowed) {

                return res.status(403).json({
                    success: false,
                    message: "Only Admin or the assigned HR can associate a recording",
                });

            }

            const recordingUrl =
                String(req.body?.recordingUrl || "").trim();

            if (recordingUrl) {

                let parsedUrl;

                try {
                    parsedUrl = new URL(recordingUrl);
                } catch {
                    parsedUrl = null;
                }

                if (!parsedUrl || !["http:", "https:"].includes(parsedUrl.protocol)) {

                    return res.status(400).json({
                        success: false,
                        message: "Recording URL must be a valid http or https link",
                    });

                }

            }

            interview.recordingUrl = recordingUrl;
            await interview.save();

            return res.json({
                success: true,
                message: recordingUrl
                    ? "Recording associated with interview"
                    : "Recording removed from interview",
                interview: await populateInterview(interview._id),
            });

        } catch (error) {

            console.error(
                "ASSOCIATE VIDEO INTERVIEW RECORDING ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to associate recording",
                error: error.message,
            });

        }

    };


// ============================================================
// EXPORT
// ============================================================

module.exports = {

    getVideoInterviewEmployees,

    getVideoInterviewEligibleApplications,

    assignVideoInterviewEmployee,

    getEmployeeVideoInterviews,

    getEmployeeVideoInterviewById,

    scheduleVideoInterview,

    getAdminVideoInterviews,

    approveVideoInterview,

    rejectVideoInterview,

    getHRVideoInterviews,

    sendVideoInterviewToCandidate,

    getCandidateVideoInterviews,

    getCandidateVideoInterviewById,

    completeVideoInterview,

    cancelVideoInterview,

    associateVideoInterviewRecording,

};