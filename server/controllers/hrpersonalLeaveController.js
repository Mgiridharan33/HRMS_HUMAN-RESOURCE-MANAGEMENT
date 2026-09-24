const HRPersonalLeave = require("../models/HRPersonalLeave");
const User = require("../models/User");
const Employee = require("../models/Employee");


// =====================================================
// GET USER ID
// =====================================================

const getUserId = (req) => {

    return (
        req.user?._id ||
        req.user?.id ||
        req.user?.userId ||
        null
    );
};


// =====================================================
// GET USER ROLE
// =====================================================

const getUserRole = (req) => {

    return String(
        req.user?.role || ""
    )
        .trim()
        .toUpperCase();
};


// =====================================================
// CALCULATE TOTAL DAYS
// =====================================================

const calculateTotalDays = (
    fromDate,
    toDate
) => {

    const start = new Date(fromDate);
    const end = new Date(toDate);

    start.setHours(
        0,
        0,
        0,
        0
    );

    end.setHours(
        0,
        0,
        0,
        0
    );

    const difference =
        end.getTime() -
        start.getTime();

    return (
        Math.floor(
            difference /
            (1000 * 60 * 60 * 24)
        ) + 1
    );
};


// =====================================================
// HR APPLY PERSONAL LEAVE
// POST /api/hr-personal-leaves
// =====================================================

const applyHRPersonalLeave = async (
    req,
    res
) => {

    try {

        // =================================================
        // USER
        // =================================================

        const userId =
            getUserId(req);


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required.",

            });
        }


        // =================================================
        // ROLE
        // =================================================

        const role =
            getUserRole(req);


        if (
            role !== "HR" &&
            role !== "HUMAN RESOURCE" &&
            role !== "HUMAN_RESOURCES"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Only HR users can apply for personal leave.",

            });
        }


        // =================================================
        // REQUEST BODY
        // =================================================

        const {
            leaveType,
            fromDate,
            toDate,
            reason,
        } = req.body;


        // =================================================
        // VALIDATION
        // =================================================

        if (
            !leaveType ||
            !fromDate ||
            !toDate ||
            !reason
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Leave type, dates and reason are required.",

            });
        }


        // =================================================
        // NORMALIZE DATES
        // =================================================

        const start =
            new Date(fromDate);

        const end =
            new Date(toDate);


        if (
            Number.isNaN(
                start.getTime()
            ) ||
            Number.isNaN(
                end.getTime()
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid leave dates.",

            });
        }


        start.setHours(
            0,
            0,
            0,
            0
        );

        end.setHours(
            0,
            0,
            0,
            0
        );


        // =================================================
        // DATE VALIDATION
        // =================================================

        if (end < start) {

            return res.status(400).json({

                success: false,

                message:
                    "To date cannot be before from date.",

            });
        }


        // =================================================
        // TOTAL DAYS
        // =================================================

        const totalDays =
            calculateTotalDays(
                start,
                end
            );


        if (totalDays <= 0) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid leave duration.",

            });
        }


        // =================================================
        // CHECK OVERLAPPING PENDING / APPROVED LEAVE
        // =================================================

        const existingLeave =
            await HRPersonalLeave.findOne({

                hr: userId,

                status: {
                    $in: [
                        "Pending",
                        "Approved",
                    ],
                },

                fromDate: {
                    $lte: end,
                },

                toDate: {
                    $gte: start,
                },

            });


        if (existingLeave) {

            return res.status(409).json({

                success: false,

                message:
                    "You already have a pending or approved leave application for these dates.",

            });
        }


        // =================================================
        // FIND EMPLOYEE PROFILE
        // =================================================

        let employeeId = null;


        try {

            const employee =
                await Employee.findOne({

                    $or: [
                        {
                            user: userId,
                        },
                        {
                            userId: userId,
                        },
                    ],

                })
                    .select("_id")
                    .lean();


            if (employee) {

                employeeId =
                    employee._id;

            }

        } catch (employeeError) {

            console.log(
                "Employee lookup skipped:",
                employeeError.message
            );

        }


        // =================================================
        // CREATE LEAVE
        // =================================================

        const leave =
            await HRPersonalLeave.create({

                hr: userId,

                employee:
                    employeeId,

                leaveType:
                    String(
                        leaveType
                    ).trim(),

                fromDate:
                    start,

                toDate:
                    end,

                totalDays:
                    totalDays,

                reason:
                    String(
                        reason
                    ).trim(),

                status:
                    "Pending",

                adminRemark:
                    "",

                reviewedBy:
                    null,

                reviewedAt:
                    null,

            });


        // =================================================
        // POPULATE CREATED LEAVE
        // =================================================

        const populatedLeave =
            await HRPersonalLeave
                .findById(
                    leave._id
                )

                .populate(
                    "hr",
                    "name firstName lastName email role"
                )

                .populate(
                    "employee",
                    "name employeeId email"
                )

                .populate(
                    "reviewedBy",
                    "name firstName lastName email role"
                )

                .lean();


        // =================================================
        // RESPONSE
        // =================================================

        return res.status(201).json({

            success: true,

            message:
                "Leave application submitted successfully.",

            leave:
                populatedLeave,

        });

    } catch (error) {

        console.error(
            "Apply HR personal leave error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to submit leave application.",

            error:
                error.message,

        });
    }
};


// =====================================================
// HR GET OWN PERSONAL LEAVES
// GET /api/hr-personal-leaves/my
// =====================================================

const getMyHRPersonalLeaves = async (
    req,
    res
) => {

    try {

        // =================================================
        // USER
        // =================================================

        const userId =
            getUserId(req);


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authenticated user not found.",

            });
        }


        // =================================================
        // GET LEAVES
        // =================================================

        const leaves =
            await HRPersonalLeave
                .find({

                    hr: userId,

                })

                .populate(
                    "hr",
                    "name firstName lastName email role"
                )

                .populate(
                    "employee",
                    "name employeeId email"
                )

                .populate(
                    "reviewedBy",
                    "name firstName lastName email role"
                )

                .sort({

                    createdAt: -1,

                })

                .lean();


        // =================================================
        // RESPONSE
        // =================================================

        return res.status(200).json({

            success: true,

            count:
                leaves.length,

            leaves,

        });

    } catch (error) {

        console.error(
            "Get my HR personal leaves error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load your HR personal leaves.",

            error:
                error.message,

        });
    }
};


// =====================================================
// SUPER ADMIN GET ALL HR PERSONAL LEAVES
// GET /api/hr-personal-leaves
// =====================================================

const getAllHRPersonalLeaves = async (
    req,
    res
) => {

    try {

        // =================================================
        // ROLE
        // =================================================

        const role =
            getUserRole(req);


        if (
            role !== "SUPERADMIN" &&
            role !== "SUPER ADMIN" &&
            role !== "SUPER_ADMIN"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Only Super Admin can view HR personal leave applications.",

            });
        }


        // =================================================
        // GET ALL LEAVES
        // =================================================

        const leaves =
            await HRPersonalLeave
                .find({})

                .populate(
                    "hr",
                    "name firstName lastName email role"
                )

                .populate(
                    "employee",
                    "name employeeId email"
                )

                .populate(
                    "reviewedBy",
                    "name firstName lastName email role"
                )

                .sort({

                    createdAt: -1,

                })

                .lean();


        // =================================================
        // RESPONSE
        // =================================================

        return res.status(200).json({

            success: true,

            count:
                leaves.length,

            leaves,

        });

    } catch (error) {

        console.error(
            "Get all HR personal leaves error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load HR personal leave applications.",

            error:
                error.message,

        });
    }
};


// =====================================================
// SUPER ADMIN APPROVE
// PATCH /api/hr-personal-leaves/:id/approve
// =====================================================

const approveHRPersonalLeave = async (
    req,
    res
) => {

    try {

        // =================================================
        // ADMIN
        // =================================================

        const adminId =
            getUserId(req);

        const role =
            getUserRole(req);


        if (
            !adminId ||
            (
                role !== "SUPERADMIN" &&
                role !== "SUPER ADMIN" &&
                role !== "SUPER_ADMIN"
            )
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Only Super Admin can approve leave.",

            });
        }


        // =================================================
        // FIND LEAVE
        // =================================================

        const leave =
            await HRPersonalLeave
                .findById(
                    req.params.id
                );


        if (!leave) {

            return res.status(404).json({

                success: false,

                message:
                    "Leave application not found.",

            });
        }


        // =================================================
        // STATUS CHECK
        // =================================================

        if (
            leave.status !==
            "Pending"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    `Leave is already ${leave.status}.`,

            });
        }


        // =================================================
        // ADMIN REMARK
        // =================================================

        const adminRemark =
            req.body?.adminRemark ||
            "";


        // =================================================
        // UPDATE
        // =================================================

        leave.status =
            "Approved";

        leave.adminRemark =
            String(
                adminRemark
            ).trim();

        leave.reviewedBy =
            adminId;

        leave.reviewedAt =
            new Date();


        await leave.save();


        // =================================================
        // GET UPDATED LEAVE
        // =================================================

        const updatedLeave =
            await HRPersonalLeave
                .findById(
                    leave._id
                )

                .populate(
                    "hr",
                    "name firstName lastName email role"
                )

                .populate(
                    "employee",
                    "name employeeId email"
                )

                .populate(
                    "reviewedBy",
                    "name firstName lastName email role"
                )

                .lean();


        // =================================================
        // RESPONSE
        // =================================================

        return res.status(200).json({

            success: true,

            message:
                "Leave approved successfully.",

            leave:
                updatedLeave,

        });

    } catch (error) {

        console.error(
            "Approve HR personal leave error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to approve leave.",

            error:
                error.message,

        });
    }
};


// =====================================================
// SUPER ADMIN CANCEL
// PATCH /api/hr-personal-leaves/:id/cancel
// =====================================================

const cancelHRPersonalLeave = async (
    req,
    res
) => {

    try {

        // =================================================
        // ADMIN
        // =================================================

        const adminId =
            getUserId(req);

        const role =
            getUserRole(req);


        if (
            !adminId ||
            (
                role !== "SUPERADMIN" &&
                role !== "SUPER ADMIN" &&
                role !== "SUPER_ADMIN"
            )
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Only Super Admin can cancel leave.",

            });
        }


        // =================================================
        // FIND LEAVE
        // =================================================

        const leave =
            await HRPersonalLeave
                .findById(
                    req.params.id
                );


        if (!leave) {

            return res.status(404).json({

                success: false,

                message:
                    "Leave application not found.",

            });
        }


        // =================================================
        // STATUS CHECK
        // =================================================

        if (
            leave.status !==
            "Pending"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    `Leave is already ${leave.status}.`,

            });
        }


        // =================================================
        // ADMIN REMARK
        // =================================================

        const adminRemark =
            req.body?.adminRemark ||
            "";


        // =================================================
        // UPDATE
        // =================================================

        leave.status =
            "Cancelled";

        leave.adminRemark =
            String(
                adminRemark
            ).trim();

        leave.reviewedBy =
            adminId;

        leave.reviewedAt =
            new Date();


        await leave.save();


        // =================================================
        // GET UPDATED LEAVE
        // =================================================

        const updatedLeave =
            await HRPersonalLeave
                .findById(
                    leave._id
                )

                .populate(
                    "hr",
                    "name firstName lastName email role"
                )

                .populate(
                    "employee",
                    "name employeeId email"
                )

                .populate(
                    "reviewedBy",
                    "name firstName lastName email role"
                )

                .lean();


        // =================================================
        // RESPONSE
        // =================================================

        return res.status(200).json({

            success: true,

            message:
                "Leave cancelled successfully.",

            leave:
                updatedLeave,

        });

    } catch (error) {

        console.error(
            "Cancel HR personal leave error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to cancel leave.",

            error:
                error.message,

        });
    }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {

    applyHRPersonalLeave,

    getMyHRPersonalLeaves,

    getAllHRPersonalLeaves,

    approveHRPersonalLeave,

    cancelHRPersonalLeave,

};