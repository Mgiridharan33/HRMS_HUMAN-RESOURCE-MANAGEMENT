const mongoose =
    require("mongoose");

const JobApplication =
    require("../models/JobApplication");

const User =
    require("../models/User");


// =========================================================
// HELPERS
// =========================================================

const getUserId = (req) => {

    return (
        req.user?.id ||
        req.user?._id ||
        null
    );

};


const isValidObjectId = (id) => {

    return mongoose.Types.ObjectId.isValid(
        id
    );

};


const allowedStatuses = [

    "Pending",

    "Shortlisted",

    "Interview",

    "Selected",

    "Rejected",

    "Withdrawn",

];


// =========================================================
// POPULATE APPLICATION
// =========================================================

const populateApplication = (query) => {

    return query

        .populate(
            "candidate",
            "name email phone profileImage resume skills education experience address"
        )

        .populate(
            "job",
            "title department designation location employmentType salaryMin salaryMax salaryCurrency vacancies status isActive"
        )

        .populate(
            "reviewedBy",
            "name email role"
        )

        .populate(
            "acceptedByHR",
            "name email phone profileImage role isActive"
        )

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
// GET ALL APPLICATIONS
//
// GET /api/admin/job-applications
//
// SUPER ADMIN
// =========================================================

const getAllApplications = async (
    req,
    res
) => {

    try {

        const {
            status,
            jobId,
            search,
            sentToHR,
            accepted,
        } = req.query;


        const filter = {};


        // =====================================================
        // STATUS
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


            filter.status =
                status;

        }


        // =====================================================
        // JOB
        // =====================================================

        if (jobId) {

            if (
                !isValidObjectId(jobId)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid job ID",

                });

            }


            filter.job =
                jobId;

        }


        // =====================================================
        // SENT TO HR
        // =====================================================

        if (
            sentToHR === "true"
        ) {

            filter.sentToHR =
                true;

        }


        if (
            sentToHR === "false"
        ) {

            filter.sentToHR =
                false;

        }


        // =====================================================
        // ACCEPTED
        // =====================================================

        if (
            accepted === "true"
        ) {

            filter.acceptedByHR = {
                $ne: null,
            };

        }


        if (
            accepted === "false"
        ) {

            filter.acceptedByHR =
                null;

        }


        // =====================================================
        // SEARCH
        // =====================================================

        if (
            search &&
            String(search).trim()
        ) {

            const searchValue =
                String(search).trim();


            filter.$or = [

                {
                    candidateName: {
                        $regex:
                            searchValue,
                        $options: "i",
                    },
                },

                {
                    candidateEmail: {
                        $regex:
                            searchValue,
                        $options: "i",
                    },
                },

                {
                    candidatePhone: {
                        $regex:
                            searchValue,
                        $options: "i",
                    },
                },

                {
                    jobTitle: {
                        $regex:
                            searchValue,
                        $options: "i",
                    },
                },

                {
                    jobDepartment: {
                        $regex:
                            searchValue,
                        $options: "i",
                    },
                },

            ];

        }


        // =====================================================
        // FETCH
        // =====================================================

        const applications =
            await populateApplication(

                JobApplication.find(
                    filter
                )

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
            "GET ALL APPLICATIONS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch job applications",

            error:
                process.env.NODE_ENV ===
                "development"
                    ? error.message
                    : undefined,

        });

    }

};


// =========================================================
// GET APPLICATION BY ID
//
// GET /api/admin/job-applications/:id
// =========================================================

const getApplicationById = async (
    req,
    res
) => {

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
                    "Invalid application ID",

            });

        }


        const application =
            await populateApplication(

                JobApplication.findById(
                    id
                )

            );


        if (!application) {

            return res.status(404).json({

                success: false,

                message:
                    "Application not found",

            });

        }


        return res.status(200).json({

            success: true,

            application,

        });

    } catch (error) {

        console.error(
            "GET APPLICATION BY ID ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch application",

        });

    }

};


// =========================================================
// SEND APPLICATION TO ALL HR
//
// PATCH /api/admin/job-applications/:id/send-to-hr
//
// SUPER ADMIN ONLY
//
// IMPORTANT:
// This DOES NOT assign one HR.
//
// It makes the application visible to ALL active HR users.
// =========================================================

const sendApplicationToHR = async (
    req,
    res
) => {

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
                    "Invalid application ID",

            });

        }


        const superAdminId =
            getUserId(req);


        if (
            !superAdminId ||
            !isValidObjectId(
                superAdminId
            )
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Super Admin authentication required",

            });

        }


        // =====================================================
        // ATOMIC SEND
        //
        // Only send if it has not already been accepted.
        // =====================================================

        const application =
            await JobApplication.findOneAndUpdate(

                {
                    _id:
                        id,

                    acceptedByHR:
                        null,

                },

                {
                    $set: {

                        sentToHR:
                            true,

                        sentToHRBy:
                            superAdminId,

                        sentToHRAt:
                            new Date(),

                    },

                },

                {
                    new: true,
                }

            );


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

                return res.status(409).json({

                    success: false,

                    message:
                        "Application has already been accepted by an HR",

                });

            }


            return res.status(400).json({

                success: false,

                message:
                    "Unable to send application to HR",

            });

        }


        const updatedApplication =
            await populateApplication(
                JobApplication.findById(
                    application._id
                )
            );


        return res.status(200).json({

            success: true,

            message:
                "Application sent to all active HR users successfully",

            application:
                updatedApplication,

        });

    } catch (error) {

        console.error(
            "SEND APPLICATION TO HR ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to send application to HR",

        });

    }

};


// =========================================================
// CANCEL / REMOVE HR BROADCAST
//
// PATCH /api/admin/job-applications/:id/remove-from-hr
//
// SUPER ADMIN ONLY
//
// Only possible BEFORE HR accepts.
// =========================================================

const removeApplicationFromHR = async (
    req,
    res
) => {

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
                    "Invalid application ID",

            });

        }


        const application =
            await JobApplication.findOneAndUpdate(

                {
                    _id:
                        id,

                    acceptedByHR:
                        null,

                },

                {
                    $set: {

                        sentToHR:
                            false,

                        sentToHRBy:
                            null,

                        sentToHRAt:
                            null,

                    },

                },

                {
                    new: true,
                }

            );


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

                return res.status(409).json({

                    success: false,

                    message:
                        "Cannot remove application after an HR has accepted it",

                });

            }

        }


        const updatedApplication =
            await populateApplication(
                JobApplication.findById(
                    id
                )
            );


        return res.status(200).json({

            success: true,

            message:
                "Application removed from HR queue",

            application:
                updatedApplication,

        });

    } catch (error) {

        console.error(
            "REMOVE APPLICATION FROM HR ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to remove application from HR queue",

        });

    }

};


// =========================================================
// GET ACTIVE HR USERS
//
// GET /api/admin/job-applications/hr-users
// =========================================================

const getHRUsers = async (
    req,
    res
) => {

    try {

        const hrUsers =
            await User.find({

                role:
                    "HR",

                isActive:
                    true,

            })

                .select(
                    "name email phone profileImage role isActive"
                )

                .sort({
                    name: 1,
                })

                .lean();


        return res.status(200).json({

            success: true,

            count:
                hrUsers.length,

            hrUsers,

        });

    } catch (error) {

        console.error(
            "GET HR USERS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch HR users",

        });

    }

};


// =========================================================
// UPDATE APPLICATION STATUS
//
// PATCH /api/admin/job-applications/:id/status
// =========================================================

const updateApplicationStatus = async (
    req,
    res
) => {

    try {

        const {
            id,
        } = req.params;


        const {
            status,
            adminNotes,
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


        const application =
            await JobApplication.findById(
                id
            );


        if (!application) {

            return res.status(404).json({

                success: false,

                message:
                    "Application not found",

            });

        }


        application.status =
            status;


        if (
            adminNotes !== undefined
        ) {

            application.adminNotes =
                String(
                    adminNotes || ""
                ).trim();

        }


        application.reviewedBy =
            getUserId(req);

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
            "UPDATE APPLICATION STATUS ERROR:",
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
// UPDATE ADMIN NOTES
//
// PATCH /api/admin/job-applications/:id/notes
// =========================================================

const updateApplicationNotes = async (
    req,
    res
) => {

    try {

        const {
            id,
        } = req.params;


        const {
            adminNotes,
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


        const application =
            await JobApplication.findById(
                id
            );


        if (!application) {

            return res.status(404).json({

                success: false,

                message:
                    "Application not found",

            });

        }


        application.adminNotes =
            String(
                adminNotes || ""
            ).trim();


        application.reviewedBy =
            getUserId(req);

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
                "Application notes updated successfully",

            application:
                updatedApplication,

        });

    } catch (error) {

        console.error(
            "UPDATE APPLICATION NOTES ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to update application notes",

        });

    }

};


// =========================================================
// DELETE APPLICATION
//
// DELETE /api/admin/job-applications/:id
// =========================================================

const deleteApplication = async (
    req,
    res
) => {

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
                    "Invalid application ID",

            });

        }


        const application =
            await JobApplication.findById(
                id
            );


        if (!application) {

            return res.status(404).json({

                success: false,

                message:
                    "Application not found",

            });

        }


        await JobApplication.findByIdAndDelete(
            id
        );


        return res.status(200).json({

            success: true,

            message:
                "Application deleted successfully",

        });

    } catch (error) {

        console.error(
            "DELETE APPLICATION ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to delete application",

        });

    }

};


// =========================================================
// APPLICATION SUMMARY
//
// GET /api/admin/job-applications/summary
// =========================================================

const getApplicationSummary = async (
    req,
    res
) => {

    try {

        const summary =
            await JobApplication.aggregate([

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


        const result = {

            total: 0,

            Pending: 0,

            Shortlisted: 0,

            Interview: 0,

            Selected: 0,

            Rejected: 0,

            Withdrawn: 0,

        };


        summary.forEach(
            item => {

                if (
                    Object.prototype.hasOwnProperty.call(
                        result,
                        item._id
                    )
                ) {

                    result[item._id] =
                        item.count;

                }


                result.total +=
                    item.count;

            }
        );


        return res.status(200).json({

            success: true,

            summary:
                result,

        });

    } catch (error) {

        console.error(
            "APPLICATION SUMMARY ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch application summary",

        });

    }

};


// =========================================================
// EXPORT
// =========================================================

module.exports = {

    getAllApplications,

    getApplicationById,

    sendApplicationToHR,

    removeApplicationFromHR,

    getHRUsers,

    updateApplicationStatus,

    updateApplicationNotes,

    deleteApplication,

    getApplicationSummary,

};