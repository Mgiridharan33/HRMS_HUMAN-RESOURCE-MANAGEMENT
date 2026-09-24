const mongoose = require("mongoose");

const JobApplication =
    require("../models/JobApplication");

const {
    sendJobConfirmationEmail,
} = require("../services/mailService");


// =========================================================
// HELPERS
// =========================================================

const isValidObjectId = (id) => {

    return mongoose.Types.ObjectId.isValid(id);

};


// =========================================================
// GET LOGGED-IN USER ID
// =========================================================

const getUserId = (req) => {

    return (
        req.user?._id ||
        req.user?.id ||
        req.user?.userId ||
        null
    );

};


// =========================================================
// GET USER ROLE
//
// Your auth.js sets:
//
// req.user = User
// req.userType = "HR"
// =========================================================

const getUserRole = (req) => {

    return String(
        req.user?.role ||
        req.userType ||
        ""
    )
        .trim()
        .toUpperCase();

};


// =========================================================
// ENSURE HR
// =========================================================

const ensureHR = (req, res) => {

    const role =
        getUserRole(req);


    if (role !== "HR") {

        res.status(403).json({

            success: false,

            message:
                "HR access is required",

        });

        return false;
    }


    return true;

};


// =========================================================
// POPULATE APPLICATION
// =========================================================

const populateApplication = (query) => {

    return query

        // Candidate
        .populate(
            "candidate",
            "name email phone profileImage resume skills education experience address"
        )

        // Job
        .populate(
            "job",
            "title department designation location employmentType salaryMin salaryMax salaryCurrency vacancies status isActive"
        )

        // Super Admin / reviewer
        .populate(
            "reviewedBy",
            "name email role"
        )

        // HR who accepted
        .populate(
            "acceptedByHR",
            "name email phone profileImage role isActive"
        )

        // Super Admin who sent
        .populate(
            "sentToHRBy",
            "name email role"
        )

        // Backward compatibility
        .populate(
            "assignedHR",
            "name email phone profileImage role isActive"
        )

        .populate(
            "assignedBy",
            "name email role"
        );

};


// =========================================================
// ALLOWED STATUS
// =========================================================

const allowedStatuses = [

    "Pending",

    "Shortlisted",

    "Interview",

    "Selected",

    "Rejected",

    "Withdrawn",

];


// =========================================================
// GET HR APPLICATIONS
//
// GET /api/hr/job-applications
//
// IMPORTANT:
//
// BEFORE ACCEPT:
//
// sentToHR = true
// acceptedByHR = null
//
// Therefore ALL HR users can see it.
//
// AFTER ACCEPT:
//
// acceptedByHR = logged-in HR
//
// Therefore only that HR sees it.
// =========================================================

const getHRApplications = async (
    req,
    res
) => {

    try {

        if (!ensureHR(req, res)) {

            return;
        }


        const userId =
            getUserId(req);


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authenticated HR user not found",

            });

        }


        const {

            status = "",

            search = "",

        } = req.query;


        // =====================================================
        // IMPORTANT QUERY
        // =====================================================

        /*
            CASE 1
            -------------------------------------------------

            Application sent by Super Admin
            but not accepted by anybody.

            sentToHR = true
            acceptedByHR = null

            ALL HR users see it.


            CASE 2
            -------------------------------------------------

            Application already accepted by an HR.

            acceptedByHR = logged-in HR

            Only that HR sees it.
        */

        const visibilityQuery = {

            $or: [

                {
                    sentToHR: true,

                    acceptedByHR: null,
                },

                {
                    acceptedByHR: userId,
                },

            ],

        };


        // =====================================================
        // MAIN QUERY
        // =====================================================

        const query = {

            $and: [

                visibilityQuery,

            ],

        };


        // =====================================================
        // STATUS FILTER
        // =====================================================

        if (
            status &&
            status !== "All"
        ) {

            if (
                !allowedStatuses.includes(
                    status
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid application status",

                });

            }


            query.$and.push({

                status: status,

            });

        }


        // =====================================================
        // SEARCH
        // =====================================================

        if (
            search &&
            String(search).trim()
        ) {

            const safeSearch =
                String(search)
                    .trim()
                    .replace(
                        /[.*+?^${}()|[\]\\]/g,
                        "\\$&"
                    );


            query.$and.push({

                $or: [

                    {
                        candidateName: {
                            $regex:
                                safeSearch,
                            $options:
                                "i",
                        },
                    },

                    {
                        candidateEmail: {
                            $regex:
                                safeSearch,
                            $options:
                                "i",
                        },
                    },

                    {
                        candidatePhone: {
                            $regex:
                                safeSearch,
                            $options:
                                "i",
                        },
                    },

                    {
                        jobTitle: {
                            $regex:
                                safeSearch,
                            $options:
                                "i",
                        },
                    },

                    {
                        jobDepartment: {
                            $regex:
                                safeSearch,
                            $options:
                                "i",
                        },
                    },

                ],

            });

        }


        // =====================================================
        // FETCH
        // =====================================================

        const applications =
            await populateApplication(

                JobApplication
                    .find(query)
                    .sort({
                        createdAt: -1,
                    })
                    .lean()

            );


        return res.status(200).json({

            success: true,

            count:
                applications.length,

            applications,

        });

    } catch (error) {

        console.error(
            "GET HR APPLICATIONS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load HR applications",

            error:
                process.env.NODE_ENV ===
                "development"
                    ? error.message
                    : undefined,

        });

    }

};


// =========================================================
// HR APPLICATION SUMMARY
//
// GET /api/hr/job-applications/summary
// =========================================================

const getHRApplicationSummary = async (
    req,
    res
) => {

    try {

        if (!ensureHR(req, res)) {

            return;
        }


        const userId =
            getUserId(req);


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authenticated HR user not found",

            });

        }


        // =====================================================
        // SAME VISIBILITY RULE AS LIST
        // =====================================================

        const rows =
            await JobApplication.aggregate([

                {
                    $match: {

                        $or: [

                            {
                                sentToHR:
                                    true,

                                acceptedByHR:
                                    null,
                            },

                            {
                                acceptedByHR:
                                    new mongoose.Types.ObjectId(
                                        String(userId)
                                    ),
                            },

                        ],

                    },

                },

                {
                    $group: {

                        _id:
                            "$status",

                        count: {
                            $sum: 1,
                        },

                    },

                },

            ]);


        // =====================================================
        // DEFAULT SUMMARY
        // =====================================================

        const summary = {

            total: 0,

            Pending: 0,

            Shortlisted: 0,

            Interview: 0,

            Selected: 0,

            Rejected: 0,

            Withdrawn: 0,

        };


        // =====================================================
        // BUILD SUMMARY
        // =====================================================

        rows.forEach(
            (row) => {

                const status =
                    row._id;

                const count =
                    row.count || 0;


                if (
                    Object.prototype.hasOwnProperty.call(
                        summary,
                        status
                    )
                ) {

                    summary[status] =
                        count;

                }


                summary.total +=
                    count;

            }
        );


        return res.status(200).json({

            success: true,

            summary,

        });

    } catch (error) {

        console.error(
            "GET HR APPLICATION SUMMARY ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load HR application summary",

        });

    }

};


// =========================================================
// GET SINGLE HR APPLICATION
//
// GET /api/hr/job-applications/:id
// =========================================================

const getHRApplicationById = async (
    req,
    res
) => {

    try {

        if (!ensureHR(req, res)) {

            return;
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
                    "Invalid application ID",

            });

        }


        const userId =
            getUserId(req);


        // =====================================================
        // IMPORTANT
        //
        // HR can open application if:
        //
        // 1. It was sent to HR and nobody accepted it
        //
        // OR
        //
        // 2. This HR accepted it
        // =====================================================

        const application =
            await populateApplication(

                JobApplication.findOne({

                    _id: id,

                    $or: [

                        {
                            sentToHR: true,

                            acceptedByHR: null,
                        },

                        {
                            acceptedByHR:
                                userId,
                        },

                    ],

                })

            );


        if (!application) {

            return res.status(404).json({

                success: false,

                message:
                    "Application not found or not available to you",

            });

        }


        return res.status(200).json({

            success: true,

            application,

        });

    } catch (error) {

        console.error(
            "GET HR APPLICATION BY ID ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load application",

        });

    }

};


// =========================================================
// ACCEPT APPLICATION
//
// PATCH /api/hr/job-applications/:id/accept
//
// IMPORTANT:
//
// Multiple HRs may see the same application.
//
// Therefore acceptance MUST be atomic.
//
// The first HR who successfully updates:
//
// acceptedByHR = HR ID
//
// wins.
//
// Other HRs receive 409.
// =========================================================

const acceptHRApplication = async (
    req,
    res
) => {

    try {

        if (!ensureHR(req, res)) {

            return;
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
                    "Invalid application ID",

            });

        }


        const hrId =
            getUserId(req);


        if (
            !hrId ||
            !isValidObjectId(
                String(hrId)
            )
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Authenticated HR user not found",

            });

        }


        // =====================================================
        // ATOMIC ACCEPT
        // =====================================================

        const application =
            await JobApplication.findOneAndUpdate(

                {
                    _id: id,

                    sentToHR: true,

                    acceptedByHR: null,

                },

                {
                    $set: {

                        acceptedByHR:
                            hrId,

                        acceptedByHRAt:
                            new Date(),

                        // Backward compatibility
                        assignedHR:
                            hrId,

                        // Super Admin who sent it
                        // is already stored in sentToHRBy.
                        //
                        // Keep assignedBy as that sender.
                        assignedBy:
                            undefined,

                        assignedAt:
                            new Date(),

                    },

                },

                {
                    new: true,

                }

            );


        // =====================================================
        // ACCEPT FAILED
        // =====================================================

        if (!application) {

            const existing =
                await JobApplication.findById(
                    id
                );


            if (!existing) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Application not found",

                });

            }


            if (
                existing.acceptedByHR
            ) {

                if (
                    String(
                        existing.acceptedByHR
                    ) ===
                    String(hrId)
                ) {

                    const sameApplication =
                        await populateApplication(

                            JobApplication.findById(
                                id
                            )

                        );


                    return res.status(200).json({

                        success: true,

                        alreadyAccepted:
                            true,

                        message:
                            "You have already accepted this application",

                        application:
                            sameApplication,

                    });

                }


                return res.status(409).json({

                    success: false,

                    message:
                        "This application has already been accepted by another HR",

                });

            }


            if (
                existing.sentToHR !== true
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "This application has not been sent to HR yet",

                });

            }


            return res.status(409).json({

                success: false,

                message:
                    "Application could not be accepted",

            });

        }


        // =====================================================
        // IMPORTANT
        //
        // assignedBy should contain the Super Admin
        // who sent the application.
        //
        // Fix it using sentToHRBy.
        // =====================================================

        if (
            application.sentToHRBy
        ) {

            application.assignedBy =
                application.sentToHRBy;

        }


        await application.save();


        // =====================================================
        // POPULATE RESPONSE
        // =====================================================

        const updatedApplication =
            await populateApplication(

                JobApplication.findById(
                    application._id
                )

            );


        return res.status(200).json({

            success: true,

            alreadyAccepted:
                false,

            message:
                "Application accepted successfully",

            application:
                updatedApplication,

        });

    } catch (error) {

        console.error(
            "ACCEPT HR APPLICATION ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to accept application",

            error:
                process.env.NODE_ENV ===
                "development"
                    ? error.message
                    : undefined,

        });

    }

};


// =========================================================
// UPDATE APPLICATION STATUS
//
// PATCH /api/hr/job-applications/:id/status
// =========================================================

const updateHRApplicationStatus = async (
    req,
    res
) => {

    try {

        if (!ensureHR(req, res)) {

            return;
        }


        const {
            id,
        } = req.params;


        const {
            status,
        } = req.body;


        if (
            !isValidObjectId(id)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid application ID",

            });

        }


        if (
            !allowedStatuses.includes(
                status
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid application status",

            });

        }


        const hrId =
            getUserId(req);


        // =====================================================
        // ONLY THE HR WHO ACCEPTED CAN UPDATE
        // =====================================================

        const application =
            await JobApplication.findOne({

                _id: id,

                acceptedByHR:
                    hrId,

            });


        if (!application) {

            return res.status(403).json({

                success: false,

                message:
                    "Only the HR who accepted this application can update its status",

            });

        }


        application.status =
            status;


        application.reviewedBy =
            hrId;


        application.reviewedAt =
            new Date();


        await application.save();


        const updatedApplication =
            await populateApplication(

                JobApplication.findById(
                    id
                )

            );


        return res.status(200).json({

            success: true,

            message:
                "Application status updated successfully",

            application:
                updatedApplication,

        });

    } catch (error) {

        console.error(
            "UPDATE HR APPLICATION STATUS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to update application status",

        });

    }

};


// =========================================================
// UPDATE HR NOTES
//
// PATCH /api/hr/job-applications/:id/notes
// =========================================================

const updateHRApplicationNotes = async (
    req,
    res
) => {

    try {

        if (!ensureHR(req, res)) {

            return;
        }


        const {
            id,
        } = req.params;


        const {
            hrNotes = "",
        } = req.body;


        if (
            !isValidObjectId(id)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid application ID",

            });

        }


        const hrId =
            getUserId(req);


        // =====================================================
        // ONLY ACCEPTING HR CAN UPDATE
        // =====================================================

        const application =
            await JobApplication.findOne({

                _id: id,

                acceptedByHR:
                    hrId,

            });


        if (!application) {

            return res.status(403).json({

                success: false,

                message:
                    "Only the HR who accepted this application can update notes",

            });

        }


        /*
            IMPORTANT:

            Your current JobApplication schema does NOT
            contain hrNotes.

            Mongoose strict mode will normally ignore an
            unknown field.

            Therefore this controller should NOT pretend
            that hrNotes is persisted unless the schema
            already contains it.

            Since you said you don't want schema changes,
            we will store HR notes in adminNotes only if
            that is the existing shared notes field.
        */

        application.adminNotes =
            String(
                hrNotes || ""
            ).trim();


        application.reviewedBy =
            hrId;


        application.reviewedAt =
            new Date();


        await application.save();


        const updatedApplication =
            await populateApplication(

                JobApplication.findById(
                    id
                )

            );


        return res.status(200).json({

            success: true,

            message:
                "HR notes updated successfully",

            application:
                updatedApplication,

        });

    } catch (error) {

        console.error(
            "UPDATE HR APPLICATION NOTES ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to update HR notes",

        });

    }

};


// =========================================================
// SEND JOB CONFIRMATION EMAIL
// =========================================================

const sendJobConfirmation = async (
    req,
    res
) => {

    try {

        if (!ensureHR(req, res)) {
            return;
        }

        const { id } = req.params;
        const { joiningDate, message } = req.body || {};

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application ID",
            });
        }

        const hrId = getUserId(req);
        const application = await JobApplication.findOne({
            _id: id,
            acceptedByHR: hrId,
        })
            .populate("candidate", "name email")
            .populate("job", "title department");

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found or not assigned to you",
            });
        }

        if (application.status !== "Selected") {
            return res.status(400).json({
                success: false,
                message: "Candidate must have Selected status before confirmation email",
            });
        }

        const candidateEmail =
            application.candidateEmail ||
            application.candidate?.email;

        const info = await sendJobConfirmationEmail({
            candidateName:
                application.candidateName ||
                application.candidate?.name,
            candidateEmail,
            jobTitle:
                application.jobTitle ||
                application.job?.title,
            department:
                application.jobDepartment ||
                application.job?.department,
            senderName: req.user?.name || "HR Team",
            joiningDate,
            additionalMessage: message,
        });

        application.confirmationEmailSentAt = new Date();
        application.confirmationEmailSentBy = hrId;
        application.confirmationEmailMessageId = info.messageId || "";
        await application.save();

        return res.json({
            success: true,
            message: "Job confirmation email sent successfully",
            sentAt: application.confirmationEmailSentAt,
        });

    } catch (error) {

        console.error(
            "SEND JOB CONFIRMATION EMAIL ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to send job confirmation email",
        });

    }

};


// =========================================================
// EXPORTS
// =========================================================

module.exports = {

    getHRApplications,

    getHRApplicationSummary,

    getHRApplicationById,

    acceptHRApplication,

    updateHRApplicationStatus,

    updateHRApplicationNotes,

    sendJobConfirmation,

};