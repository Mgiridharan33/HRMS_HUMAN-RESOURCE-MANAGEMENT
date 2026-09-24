const mongoose = require("mongoose");

const Leave =
    require("../models/Leave");

const User =
    require("../models/User");

const Employee =
    require("../models/Employee");


// =====================================================
// GET AUTHENTICATED USER ID
// =====================================================

const getUserId = (req) => {

    return (
        req.user?._id ||
        req.user?.id ||
        req.userId ||
        null
    );
};


// =====================================================
// GET AUTHENTICATED ROLE
// =====================================================

const getUserRole = (req) => {

    return String(
        req.user?.role ||
        req.userType ||
        ""
    )
        .trim()
        .toUpperCase();
};


// =====================================================
// VALIDATE OBJECT ID
// =====================================================

const isValidObjectId = (id) => {

    return Boolean(
        id &&
        mongoose.Types.ObjectId.isValid(id)
    );
};


// =====================================================
// VALIDATE DATE
// =====================================================

const isValidDate = (value) => {

    if (!value) {
        return false;
    }

    const date =
        new Date(value);

    return !Number.isNaN(
        date.getTime()
    );
};


// =====================================================
// NORMALIZE DATE
// =====================================================

const normalizeDate = (value) => {

    const date =
        new Date(value);

    date.setHours(
        0,
        0,
        0,
        0
    );

    return date;
};


// =====================================================
// CALCULATE TOTAL DAYS
// =====================================================

const calculateTotalDays = (
    startDate,
    endDate
) => {

    const start =
        normalizeDate(startDate);

    const end =
        normalizeDate(endDate);

    const difference =
        end.getTime() -
        start.getTime();

    const millisecondsPerDay =
        1000 *
        60 *
        60 *
        24;

    return (
        Math.floor(
            difference /
            millisecondsPerDay
        ) + 1
    );
};


// =====================================================
// EMPLOYEE NAME
// =====================================================

const getEmployeeName = (
    employee
) => {

    if (!employee) {
        return "Unknown";
    }

    if (
        employee.name &&
        String(employee.name).trim()
    ) {

        return String(
            employee.name
        ).trim();
    }

    const fullName =
        `${employee.firstName || ""} ${employee.lastName || ""}`
            .trim();

    if (fullName) {
        return fullName;
    }

    if (employee.email) {
        return employee.email;
    }

    return "Unknown";
};


// =====================================================
// EMPLOYEE CODE
// =====================================================

const getEmployeeCode = (
    employee
) => {

    if (!employee) {
        return "";
    }

    return String(
        employee.employeeId ||
        employee.empCode ||
        ""
    ).trim();
};


// =====================================================
// FIND EMPLOYEE FOR USER
// =====================================================

const findEmployeeForUser = async (
    userId
) => {

    if (
        !userId ||
        !isValidObjectId(userId)
    ) {

        return null;
    }


    // =================================================
    // CASE 1
    // DIRECT EMPLOYEE ID
    // =================================================

    let employee =
        await Employee.findById(
            userId
        );


    if (employee) {

        return employee;
    }


    // =================================================
    // CASE 2
    // Employee.user
    // =================================================

    employee =
        await Employee.findOne({
            user: userId,
        });


    if (employee) {

        return employee;
    }


    // =================================================
    // CASE 3
    // USER -> employeeId
    // =================================================

    const user =
        await User.findById(
            userId
        )
            .select(
                [
                    "name",
                    "firstName",
                    "lastName",
                    "email",
                    "profileImage",
                    "phone",
                    "role",
                    "isActive",
                    "employeeId",
                    "department",
                    "designation",
                ].join(" ")
            );


    if (!user) {

        return null;
    }


    if (
        user.employeeId &&
        isValidObjectId(
            user.employeeId
        )
    ) {

        employee =
            await Employee.findById(
                user.employeeId
            );

        if (employee) {

            return employee;
        }
    }


    // =================================================
    // CASE 4
    // MATCH EMAIL
    // =================================================

    if (user.email) {

        employee =
            await Employee.findOne({
                email: user.email,
            });

        if (employee) {

            return employee;
        }
    }


    return null;
};


// =====================================================
// POPULATE LEAVE
// =====================================================

const populateLeave = async (
    leave
) => {

    if (!leave) {
        return leave;
    }

    try {

        await leave.populate([

            {
                path: "employee",

                select:
                    "employeeId empCode firstName lastName name email profileImage phone role isActive department designation joiningDate employmentType",
            },

            {
                path: "approvedBy",

                select:
                    "name firstName lastName email profileImage phone role",
            },

            {
                path: "cancelledBy",

                select:
                    "name firstName lastName email profileImage phone role",
            },

        ]);

    } catch (error) {

        console.error(
            "POPULATE LEAVE ERROR:",
            error
        );
    }

    return leave;
};


// =====================================================
// APPLY LEAVE
// POST /api/leave/apply
// =====================================================

const applyLeave = async (
    req,
    res
) => {

    try {

        // =================================================
        // AUTHENTICATION
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
        // FIND EMPLOYEE
        // =================================================

        const employee =
            await findEmployeeForUser(
                userId
            );


        if (!employee) {

            return res.status(404).json({

                success: false,

                message:
                    "Employee profile not found for this account.",
            });
        }


        // =================================================
        // ACTIVE CHECK
        // =================================================

        if (
            employee.isActive === false
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Your employee account is inactive.",
            });
        }


        // =================================================
        // REQUEST BODY
        // =================================================

        const {
            leaveType,
            leaveCategory,
            startDate,
            endDate,
            reason,
        } = req.body || {};


        // =================================================
        // REQUIRED
        // =================================================

        if (
            !leaveType ||
            !leaveCategory ||
            !startDate ||
            !endDate ||
            !reason
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Leave type, leave category, start date, end date and reason are required.",
            });
        }


        // =================================================
        // CLEAN VALUES
        // =================================================

        const cleanLeaveType =
            String(
                leaveType
            ).trim();


        const cleanLeaveCategory =
            String(
                leaveCategory
            ).trim();


        const cleanReason =
            String(
                reason
            ).trim();


        // =================================================
        // VALIDATE LEAVE TYPE
        // =================================================

        if (
            !cleanLeaveType
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Leave type is required.",
            });
        }


        if (
            cleanLeaveType.length > 100
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Leave type cannot exceed 100 characters.",
            });
        }


        // =================================================
        // VALIDATE LEAVE CATEGORY
        // =================================================

        if (
            ![
                "Paid",
                "Unpaid",
            ].includes(
                cleanLeaveCategory
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Leave category must be either Paid or Unpaid.",
            });
        }


        // =================================================
        // VALIDATE REASON
        // =================================================

        if (
            cleanReason.length < 3
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Leave reason must contain at least 3 characters.",
            });
        }


        if (
            cleanReason.length > 500
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Leave reason cannot exceed 500 characters.",
            });
        }


        // =================================================
        // DATE VALIDATION
        // =================================================

        if (
            !isValidDate(startDate) ||
            !isValidDate(endDate)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid leave dates.",
            });
        }


        const start =
            normalizeDate(
                startDate
            );


        const end =
            normalizeDate(
                endDate
            );


        // =================================================
        // DATE ORDER
        // =================================================

        if (
            end < start
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "End date cannot be before start date.",
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


        if (
            totalDays < 1
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Leave duration must be at least one day.",
            });
        }


        // =================================================
        // EMPLOYEE SNAPSHOT
        // =================================================

        const employeeName =
            getEmployeeName(
                employee
            );


        const empCode =
            getEmployeeCode(
                employee
            );


        if (!empCode) {

            return res.status(400).json({

                success: false,

                message:
                    "Employee code is missing from employee profile.",
            });
        }


        // =================================================
        // CHECK OVERLAPPING LEAVE
        // =================================================

        const overlappingLeave =
            await Leave.findOne({

                employee:
                    employee._id,

                status: {
                    $in: [
                        "Pending",
                        "Approved",
                    ],
                },

                startDate: {
                    $lte: end,
                },

                endDate: {
                    $gte: start,
                },

            });


        if (
            overlappingLeave
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "You already have a pending or approved leave during the selected dates.",
            });
        }


        // =================================================
        // CREATE LEAVE
        // =================================================

        const leave =
            new Leave({

                employee:
                    employee._id,

                employeeName:
                    employeeName,

                empCode:
                    empCode,

                leaveType:
                    cleanLeaveType,

                leaveCategory:
                    cleanLeaveCategory,

                startDate:
                    start,

                endDate:
                    end,

                totalDays:
                    totalDays,

                reason:
                    cleanReason,

                status:
                    "Pending",

                approvedBy:
                    null,

                approvedAt:
                    null,

                cancelledBy:
                    null,

                cancelledAt:
                    null,

                cancellationReason:
                    "",

            });


        await leave.save();


        // =================================================
        // POPULATE
        // =================================================

        await populateLeave(
            leave
        );


        // =================================================
        // RESPONSE
        // =================================================

        return res.status(201).json({

            success: true,

            message:
                "Leave request submitted successfully.",

            leave,

        });

    } catch (error) {

        console.error(
            "APPLY LEAVE ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to submit leave request.",

            error:
                process.env.NODE_ENV ===
                "development"
                    ? error.message
                    : undefined,

        });
    }
};


// =====================================================
// GET MY LEAVES
// GET /api/leave/my-leaves
// =====================================================

const getMyLeaves = async (
    req,
    res
) => {

    try {

        const userId =
            getUserId(req);


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required.",
            });
        }


        const employee =
            await findEmployeeForUser(
                userId
            );


        if (!employee) {

            return res.status(404).json({

                success: false,

                message:
                    "Employee profile not found.",
            });
        }


        const leaves =
            await Leave.find({

                employee:
                    employee._id,

            })

                .populate(
                    "employee",
                    "employeeId empCode firstName lastName name email profileImage phone role isActive department designation"
                )

                .populate(
                    "approvedBy",
                    "name firstName lastName email profileImage phone role"
                )

                .populate(
                    "cancelledBy",
                    "name firstName lastName email profileImage phone role"
                )

                .sort({
                    createdAt: -1,
                });


        return res.status(200).json({

            success: true,

            count:
                leaves.length,

            leaves,

        });

    } catch (error) {

        console.error(
            "GET MY LEAVES ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load your leave requests.",

            error:
                process.env.NODE_ENV ===
                "development"
                    ? error.message
                    : undefined,

        });
    }
};


// =====================================================
// GET ALL LEAVES FOR HR
// GET /api/hr-leaves
// =====================================================

const getAllLeavesForHR = async (
    req,
    res
) => {

    try {

        const userId =
            getUserId(req);


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required.",
            });
        }


        const role =
            getUserRole(req);


        if (
            role !== "HR" &&
            role !== "SUPER_ADMIN"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "You are not authorized to view leave requests.",
            });
        }


        const {
            status,
            leaveType,
            leaveCategory,
            fromDate,
            toDate,
            search,
        } = req.query;


        const filter = {};


        // =================================================
        // STATUS
        // =================================================

        if (
            status &&
            [
                "Pending",
                "Approved",
                "Cancelled",
            ].includes(
                String(status).trim()
            )
        ) {

            filter.status =
                String(status).trim();
        }


        // =================================================
        // LEAVE TYPE
        // =================================================

        if (
            leaveType &&
            String(
                leaveType
            ).trim()
        ) {

            filter.leaveType = {

                $regex:
                    String(
                        leaveType
                    ).trim(),

                $options:
                    "i",
            };
        }


        // =================================================
        // LEAVE CATEGORY
        // =================================================

        if (
            leaveCategory &&
            [
                "Paid",
                "Unpaid",
            ].includes(
                String(
                    leaveCategory
                ).trim()
            )
        ) {

            filter.leaveCategory =
                String(
                    leaveCategory
                ).trim();
        }


        // =================================================
        // DATE FILTER
        // =================================================

        if (
            fromDate ||
            toDate
        ) {

            filter.startDate = {};


            if (fromDate) {

                const start =
                    new Date(
                        fromDate
                    );


                if (
                    !Number.isNaN(
                        start.getTime()
                    )
                ) {

                    start.setHours(
                        0,
                        0,
                        0,
                        0
                    );


                    filter.startDate.$gte =
                        start;
                }
            }


            if (toDate) {

                const end =
                    new Date(
                        toDate
                    );


                if (
                    !Number.isNaN(
                        end.getTime()
                    )
                ) {

                    end.setHours(
                        23,
                        59,
                        59,
                        999
                    );


                    filter.startDate.$lte =
                        end;
                }
            }
        }


        // =================================================
        // SEARCH
        // =================================================

        if (
            search &&
            String(
                search
            ).trim()
        ) {

            const searchText =
                String(
                    search
                ).trim();


            filter.$or = [

                {
                    employeeName: {

                        $regex:
                            searchText,

                        $options:
                            "i",

                    },
                },

                {
                    empCode: {

                        $regex:
                            searchText,

                        $options:
                            "i",

                    },
                },

                {
                    leaveType: {

                        $regex:
                            searchText,

                        $options:
                            "i",

                    },
                },

                {
                    leaveCategory: {

                        $regex:
                            searchText,

                        $options:
                            "i",

                    },
                },

                {
                    reason: {

                        $regex:
                            searchText,

                        $options:
                            "i",

                    },
                },

            ];
        }


        // =================================================
        // GET LEAVES
        // =================================================

        const leaves =
            await Leave.find(
                filter
            )

                .populate(
                    "employee",
                    "employeeId empCode firstName lastName name email profileImage phone role isActive department designation joiningDate employmentType"
                )

                .populate(
                    "approvedBy",
                    "name firstName lastName email profileImage phone role"
                )

                .populate(
                    "cancelledBy",
                    "name firstName lastName email profileImage phone role"
                )

                .sort({
                    createdAt: -1,
                });


        // =================================================
        // SUMMARY
        // =================================================

        const summary = {

            total:
                leaves.length,

            pending:
                leaves.filter(
                    leave =>
                        leave.status ===
                        "Pending"
                ).length,

            approved:
                leaves.filter(
                    leave =>
                        leave.status ===
                        "Approved"
                ).length,

            cancelled:
                leaves.filter(
                    leave =>
                        leave.status ===
                        "Cancelled"
                ).length,

            paid:
                leaves.filter(
                    leave =>
                        leave.leaveCategory ===
                        "Paid"
                ).length,

            unpaid:
                leaves.filter(
                    leave =>
                        leave.leaveCategory ===
                        "Unpaid"
                ).length,

        };


        return res.status(200).json({

            success: true,

            count:
                leaves.length,

            summary,

            leaves,

        });

    } catch (error) {

        console.error(
            "GET HR LEAVES ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load leave requests.",

            error:
                process.env.NODE_ENV ===
                "development"
                    ? error.message
                    : undefined,

        });
    }
};


// =====================================================
// APPROVE LEAVE
// PUT /api/hr-leaves/:leaveId/approve
// =====================================================

const approveLeave = async (
    req,
    res
) => {

    try {

        const reviewerId =
            getUserId(req);


        if (!reviewerId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required.",
            });
        }


        const role =
            getUserRole(req);


        if (
            role !== "HR" &&
            role !== "SUPER_ADMIN"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "You are not authorized to approve leave requests.",
            });
        }


        const leaveId =
            req.params.leaveId ||
            req.params.id;


        if (
            !isValidObjectId(
                leaveId
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid leave ID is required.",
            });
        }


        const leave =
            await Leave.findById(
                leaveId
            );


        if (!leave) {

            return res.status(404).json({

                success: false,

                message:
                    "Leave request not found.",
            });
        }


        if (
            leave.status !==
            "Pending"
        ) {

            return res.status(409).json({

                success: false,

                message:
                    `This leave request is already ${String(
                        leave.status
                    ).toLowerCase()}.`,
            });
        }


        // =================================================
        // FIND EMPLOYEE
        // =================================================

        const employee =
            await Employee.findById(
                leave.employee
            );


        if (!employee) {

            return res.status(404).json({

                success: false,

                message:
                    "Employee associated with this leave was not found.",
            });
        }


        if (
            employee.isActive === false
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "This employee account is inactive.",
            });
        }


        // =================================================
        // CONFLICT CHECK
        // =================================================

        const conflictingLeave =
            await Leave.findOne({

                _id: {
                    $ne:
                        leave._id,
                },

                employee:
                    leave.employee,

                status:
                    "Approved",

                startDate: {
                    $lte:
                        leave.endDate,
                },

                endDate: {
                    $gte:
                        leave.startDate,
                },

            });


        if (
            conflictingLeave
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "This employee already has an approved leave during the selected dates.",
            });
        }


        // =================================================
        // SNAPSHOT
        // =================================================

        leave.employeeName =
            getEmployeeName(
                employee
            );


        leave.empCode =
            getEmployeeCode(
                employee
            );


        // =================================================
        // APPROVE
        // =================================================

        leave.status =
            "Approved";


        leave.approvedBy =
            reviewerId;


        leave.approvedAt =
            new Date();


        // =================================================
        // CLEAR CANCELLATION
        // =================================================

        leave.cancelledBy =
            null;


        leave.cancelledAt =
            null;


        leave.cancellationReason =
            "";


        await leave.save();


        await populateLeave(
            leave
        );


        return res.status(200).json({

            success: true,

            message:
                "Leave approved successfully.",

            leave,

        });

    } catch (error) {

        console.error(
            "APPROVE LEAVE ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to approve leave request.",

            error:
                process.env.NODE_ENV ===
                "development"
                    ? error.message
                    : undefined,

        });
    }
};


// =====================================================
// CANCEL LEAVE
// PUT /api/hr-leaves/:leaveId/cancel
// =====================================================

const cancelLeave = async (
    req,
    res
) => {

    try {

        const reviewerId =
            getUserId(req);


        if (!reviewerId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required.",
            });
        }


        const role =
            getUserRole(req);


        if (
            role !== "HR" &&
            role !== "SUPER_ADMIN"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "You are not authorized to cancel leave requests.",
            });
        }


        const leaveId =
            req.params.leaveId ||
            req.params.id;


        if (
            !isValidObjectId(
                leaveId
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid leave ID is required.",
            });
        }


        const cleanReason =
            String(
                req.body?.cancellationReason ||
                ""
            ).trim();


        if (
            cleanReason.length < 3
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Cancellation reason must contain at least 3 characters.",
            });
        }


        if (
            cleanReason.length > 500
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Cancellation reason cannot exceed 500 characters.",
            });
        }


        const leave =
            await Leave.findById(
                leaveId
            );


        if (!leave) {

            return res.status(404).json({

                success: false,

                message:
                    "Leave request not found.",
            });
        }


        if (
            leave.status !==
            "Pending"
        ) {

            return res.status(409).json({

                success: false,

                message:
                    `This leave request is already ${String(
                        leave.status
                    ).toLowerCase()} and cannot be cancelled.`,
            });
        }


        const employee =
            await Employee.findById(
                leave.employee
            );


        if (!employee) {

            return res.status(404).json({

                success: false,

                message:
                    "Employee associated with this leave was not found.",
            });
        }


        leave.employeeName =
            getEmployeeName(
                employee
            );


        leave.empCode =
            getEmployeeCode(
                employee
            );


        // =================================================
        // CANCEL
        // =================================================

        leave.status =
            "Cancelled";


        leave.cancelledBy =
            reviewerId;


        leave.cancelledAt =
            new Date();


        leave.cancellationReason =
            cleanReason;


        // =================================================
        // CLEAR APPROVAL
        // =================================================

        leave.approvedBy =
            null;


        leave.approvedAt =
            null;


        await leave.save();


        await populateLeave(
            leave
        );


        return res.status(200).json({

            success: true,

            message:
                "Leave cancelled successfully.",

            leave,

        });

    } catch (error) {

        console.error(
            "CANCEL LEAVE ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to cancel leave request.",

            error:
                process.env.NODE_ENV ===
                "development"
                    ? error.message
                    : undefined,

        });
    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    applyLeave,

    getMyLeaves,

    getAllLeavesForHR,

    approveLeave,

    cancelLeave,

};