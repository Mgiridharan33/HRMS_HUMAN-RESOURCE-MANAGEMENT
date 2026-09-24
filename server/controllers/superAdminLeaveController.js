const mongoose = require("mongoose");

const Leave = require("../models/Leave");


// =====================================================
// GET USER ID
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
// GET USER ROLE
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

    return (
        id &&
        mongoose.Types.ObjectId.isValid(id)
    );
};


// =====================================================
// POPULATE LEAVE
// =====================================================

const populateLeave = (query) => {

    return query

        // =================================================
        // EMPLOYEE
        // =================================================

        .populate(
            "employee",
            [
                "employeeId",
                "empCode",
                "firstName",
                "lastName",
                "name",
                "email",
                "profileImage",
                "phone",
                "role",
                "isActive",
                "department",
                "designation",
                "joiningDate",
                "employmentType",
            ].join(" ")
        )

        // =================================================
        // APPROVED BY
        // =================================================

        .populate(
            "approvedBy",
            [
                "name",
                "firstName",
                "lastName",
                "email",
                "profileImage",
                "phone",
                "role",
            ].join(" ")
        )

        // =================================================
        // CANCELLED BY
        // =================================================

        .populate(
            "cancelledBy",
            [
                "name",
                "firstName",
                "lastName",
                "email",
                "profileImage",
                "phone",
                "role",
            ].join(" ")
        );
};


// =====================================================
// CHECK SUPER ADMIN
// =====================================================

const checkSuperAdmin = (
    req,
    res
) => {

    const userId =
        getUserId(req);


    if (!userId) {

        res.status(401).json({

            success: false,

            message:
                "Authentication required.",

        });

        return false;
    }


    const role =
        getUserRole(req);


    if (
        role !== "SUPER_ADMIN"
    ) {

        res.status(403).json({

            success: false,

            message:
                "Only Super Admin can access this page.",

        });

        return false;
    }


    return true;
};


// =====================================================
// GET ALL LEAVE APPLICATIONS
//
// GET /api/super-admin/leaves
// =====================================================

const getAllLeavesForSuperAdmin = async (
    req,
    res
) => {

    try {

        // =================================================
        // AUTHORIZATION
        // =================================================

        if (
            !checkSuperAdmin(
                req,
                res
            )
        ) {

            return;
        }


        // =================================================
        // QUERY
        // =================================================

        const {
            status,
            leaveType,
            employee,
            fromDate,
            toDate,
            search,
        } = req.query;


        // =================================================
        // FILTER
        // =================================================

        const filter = {};


        // =================================================
        // STATUS
        // =================================================

        if (
            status &&
            String(status).trim() !== "All"
        ) {

            filter.status =
                String(
                    status
                ).trim();
        }


        // =================================================
        // LEAVE TYPE
        // =================================================

        if (
            leaveType &&
            String(leaveType).trim() !== "All"
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
        // EMPLOYEE
        // =================================================

        if (
            employee &&
            isValidObjectId(
                employee
            )
        ) {

            filter.employee =
                employee;
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


            // Remove empty date object
            if (
                Object.keys(
                    filter.startDate
                ).length === 0
            ) {

                delete filter.startDate;
            }
        }


        // =================================================
        // SEARCH
        // =================================================
        //
        // IMPORTANT:
        // No hrReply.
        // No HR response system.
        //
        // Search only current Leave fields.
        // =================================================

        if (search) {

            const searchText =
                String(
                    search
                ).trim();


            if (searchText) {

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
                        reason: {
                            $regex:
                                searchText,

                            $options:
                                "i",
                        },
                    },

                    {
                        cancellationReason: {
                            $regex:
                                searchText,

                            $options:
                                "i",
                        },
                    },

                ];
            }
        }


        // =================================================
        // GET LEAVES
        // =================================================

        const leaves =
            await populateLeave(
                Leave.find(
                    filter
                )
                    .sort({
                        createdAt: -1,
                    })
            );


        // =================================================
        // SUMMARY
        // =================================================

        const summary = {

            total:
                leaves.length,

            pending:
                leaves.filter(
                    (item) =>
                        item.status ===
                        "Pending"
                ).length,

            approved:
                leaves.filter(
                    (item) =>
                        item.status ===
                        "Approved"
                ).length,

            cancelled:
                leaves.filter(
                    (item) =>
                        item.status ===
                        "Cancelled"
                ).length,

            totalDays:
                leaves.reduce(
                    (
                        total,
                        item
                    ) =>
                        total +
                        Number(
                            item.totalDays ||
                            0
                        ),
                    0
                ),
        };


        // =================================================
        // RESPONSE
        // =================================================

        return res.status(200).json({

            success: true,

            count:
                leaves.length,

            summary,

            leaves,

        });

    } catch (error) {

        console.error(
            "SUPER ADMIN GET ALL LEAVES ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load leave applications.",

            error:
                process.env.NODE_ENV ===
                "development"
                    ? error.message
                    : undefined,

        });
    }
};


// =====================================================
// GET SINGLE LEAVE
//
// GET /api/super-admin/leaves/:id
// =====================================================

const getLeaveDetailsForSuperAdmin = async (
    req,
    res
) => {

    try {

        // =================================================
        // AUTHORIZATION
        // =================================================

        if (
            !checkSuperAdmin(
                req,
                res
            )
        ) {

            return;
        }


        // =================================================
        // ID
        // =================================================

        const {
            id
        } = req.params;


        if (
            !id ||
            !isValidObjectId(
                id
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid leave ID is required.",

            });
        }


        // =================================================
        // FIND LEAVE
        // =================================================

        const leave =
            await populateLeave(
                Leave.findById(
                    id
                )
            );


        // =================================================
        // NOT FOUND
        // =================================================

        if (!leave) {

            return res.status(404).json({

                success: false,

                message:
                    "Leave application not found.",

            });
        }


        // =================================================
        // RESPONSE
        // =================================================

        return res.status(200).json({

            success: true,

            leave,

        });

    } catch (error) {

        console.error(
            "SUPER ADMIN GET LEAVE DETAILS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load leave application details.",

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

    getAllLeavesForSuperAdmin,

    getLeaveDetailsForSuperAdmin,

};