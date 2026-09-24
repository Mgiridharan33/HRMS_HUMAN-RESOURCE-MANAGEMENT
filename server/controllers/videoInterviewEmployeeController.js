const mongoose = require("mongoose");

const VideoInterview =
    require("../models/VideoInterview");


// ============================================================
// HELPER
// ============================================================

const isValidObjectId = (id) => {

    return mongoose.Types.ObjectId.isValid(id);

};


// ============================================================
// EMPLOYEE ID
//
// auth.js sets:
// req.user = Employee
// req.userType = EMPLOYEE
// ============================================================

const getEmployeeId = (req) => {

    return (
        req.user?._id ||
        req.user?.id ||
        null
    );

};


// ============================================================
// GET EMPLOYEE VIDEO INTERVIEWS
// ============================================================

const getEmployeeVideoInterviews = async (
    req,
    res
) => {

    try {

        if (
            req.userType !== "EMPLOYEE"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Only employees can access assigned video interviews",

            });

        }


        const employeeId =
            getEmployeeId(req);


        if (!employeeId) {

            return res.status(401).json({

                success: false,

                message:
                    "Employee authentication data not found",

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
                    "title department"
                )

                .populate(
                    "assignedHR",
                    "name email"
                )

                .sort({

                    createdAt: -1,

                })

                .lean();


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
                "Failed to load video interviews",

        });

    }

};


// ============================================================
// GET SINGLE EMPLOYEE VIDEO INTERVIEW
// ============================================================

const getEmployeeVideoInterviewById =
    async (
        req,
        res
    ) => {

        try {

            if (
                req.userType !== "EMPLOYEE"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Only employees can access this interview",

                });

            }


            const {
                interviewId,
            } = req.params;


            if (
                !isValidObjectId(
                    interviewId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid interview ID",

                });

            }


            const employeeId =
                getEmployeeId(req);


            const interview =
                await VideoInterview.findOne({

                    _id:
                        interviewId,

                    assignedEmployee:
                        employeeId,

                })

                    .populate(
                        "candidate",
                        "firstName lastName name email phone profileImage"
                    )

                    .populate(
                        "job",
                        "title department"
                    )

                    .populate(
                        "assignedHR",
                        "name email"
                    )

                    .lean();


            if (!interview) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Video interview not found",

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
// EMPLOYEE - SCHEDULE VIDEO INTERVIEW
// ============================================================

const scheduleVideoInterview =
    async (
        req,
        res
    ) => {

        try {

            if (
                req.userType !== "EMPLOYEE"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Only employees can schedule interviews",

                });

            }


            const {
                interviewId,
            } = req.params;


            const {
                scheduledDate,
                startTime,
                endTime,
                meetingLink,
                meetingPlatform,
                meetingNotes,
            } = req.body;


            if (
                !isValidObjectId(
                    interviewId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid interview ID",

                });

            }


            if (
                !scheduledDate ||
                !startTime ||
                !endTime
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Date, start time and end time are required",

                });

            }


            if (
                !meetingLink ||
                !meetingLink.trim()
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Meeting link is required",

                });

            }


            const employeeId =
                getEmployeeId(req);


            const interview =
                await VideoInterview.findOne({

                    _id:
                        interviewId,

                    assignedEmployee:
                        employeeId,

                });


            if (!interview) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Video interview not found or not assigned to you",

                });

            }


            // =================================================
            // ONLY PENDING SCHEDULE
            // =================================================

            if (
                ![
                    "PendingSchedule",
                    "ScheduleRejected",
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


            // =================================================
            // SAVE SCHEDULE
            // =================================================

            interview.scheduledDate =
                new Date(
                    scheduledDate
                );

            interview.scheduledAt =
                new Date(
                    `${scheduledDate}T${startTime}`
                );

            interview.startTime =
                startTime;

            interview.endTime =
                endTime;

            interview.meetingLink =
                meetingLink.trim();

            interview.meetingPlatform =
                meetingPlatform?.trim() ||
                "Google Meet";

            interview.meetingNotes =
                meetingNotes?.trim() ||
                "";

            interview.scheduleSubmittedAt =
                new Date();

            interview.scheduleRejectedReason =
                "";

            interview.status =
                "SchedulePendingApproval";


            await interview.save();


            const populatedInterview =
                await VideoInterview.findById(
                    interview._id
                )

                    .populate(
                        "candidate",
                        "firstName lastName name email phone profileImage"
                    )

                    .populate(
                        "job",
                        "title department"
                    )

                    .populate(
                        "assignedEmployee",
                        "employeeId firstName lastName name email"
                    )

                    .populate(
                        "assignedHR",
                        "name email"
                    );


            return res.json({

                success: true,

                message:
                    "Interview schedule submitted to admin for approval",

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
// EMPLOYEE - UPDATE SCHEDULE
// ============================================================

const updateVideoInterviewSchedule =
    async (
        req,
        res
    ) => {

        try {

            if (
                req.userType !== "EMPLOYEE"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Only employees can update schedules",

                });

            }


            const {
                interviewId,
            } = req.params;


            const {
                scheduledDate,
                startTime,
                endTime,
                meetingLink,
                meetingPlatform,
                meetingNotes,
            } = req.body;


            if (
                !isValidObjectId(
                    interviewId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid interview ID",

                });

            }


            const employeeId =
                getEmployeeId(req);


            const interview =
                await VideoInterview.findOne({

                    _id:
                        interviewId,

                    assignedEmployee:
                        employeeId,

                });


            if (!interview) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Video interview not found",

                });

            }


            if (
                ![
                    "PendingSchedule",
                    "ScheduleRejected",
                    "SchedulePendingApproval",
                ].includes(
                    interview.status
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "This interview schedule cannot be modified now",

                });

            }


            if (
                scheduledDate
            ) {

                interview.scheduledDate =
                    new Date(
                        scheduledDate
                    );

            }


            if (
                startTime
            ) {

                interview.startTime =
                    startTime;

            }


            if (
                endTime
            ) {

                interview.endTime =
                    endTime;

            }

            if (interview.scheduledDate && interview.startTime) {
                interview.scheduledAt = new Date(
                    `${interview.scheduledDate.toISOString().slice(0, 10)}T${interview.startTime}`
                );
            }


            if (
                meetingLink
            ) {

                interview.meetingLink =
                    meetingLink.trim();

            }


            if (
                meetingPlatform !==
                undefined
            ) {

                interview.meetingPlatform =
                    meetingPlatform.trim();

            }


            if (
                meetingNotes !==
                undefined
            ) {

                interview.meetingNotes =
                    meetingNotes.trim();

            }


            interview.scheduleSubmittedAt =
                new Date();

            interview.scheduleRejectedReason =
                "";

            interview.status =
                "SchedulePendingApproval";


            await interview.save();


            return res.json({

                success: true,

                message:
                    "Interview schedule updated and sent to admin",

                interview,

            });

        } catch (error) {

            console.error(
                "UPDATE VIDEO INTERVIEW SCHEDULE ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to update interview schedule",

            });

        }

    };


module.exports = {

    getEmployeeVideoInterviews,

    getEmployeeVideoInterviewById,

    scheduleVideoInterview,

    updateVideoInterviewSchedule,

};