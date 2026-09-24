const mongoose = require("mongoose");

const Payroll =
    require("../models/Payroll");

const Employee =
    require("../models/Employee");


// =====================================================
// HELPERS
// =====================================================

const getUserId = (req) => {

    return (
        req.user?._id ||
        req.user?.id ||
        req.userId ||
        null
    );

};


const getUserRole = (req) => {

    return String(
        req.user?.role ||
        req.userType ||
        ""
    )
        .trim()
        .toUpperCase();

};


const isValidObjectId = (id) => {

    return Boolean(
        id &&
        mongoose.Types.ObjectId.isValid(id)
    );

};


// =====================================================
// GET LOGGED-IN EMPLOYEE
// =====================================================
//
// IMPORTANT:
//
// Your auth middleware does:
//
// EMPLOYEE
//     ↓
// Employee.findById(decoded.id)
//
// Therefore req.user is already the Employee document.
//
// We should NOT do:
//
// Employee.findOne({ user: req.user._id })
//
// =====================================================

const getLoggedInEmployee = async (req) => {

    const role =
        getUserRole(req);


    if (
        role !== "EMPLOYEE"
    ) {

        return null;

    }


    const employeeId =
        getUserId(req);


    if (
        !isValidObjectId(
            employeeId
        )
    ) {

        return null;

    }


    // =================================================
    // req.user may already contain the Employee document
    // =================================================

    if (
        req.user &&
        req.user._id
    ) {

        return req.user;

    }


    // =================================================
    // Fallback
    // =================================================

    return await Employee.findById(
        employeeId
    );

};


// =====================================================
// GET MY PAYROLL
// GET /api/employee/payroll
// =====================================================

const getMyPayroll = async (
    req,
    res
) => {

    try {

        // =================================================
        // AUTH
        // =================================================

        const role =
            getUserRole(req);


        console.log(
            "EMPLOYEE PAYROLL ROLE:",
            role
        );


        console.log(
            "EMPLOYEE PAYROLL USER:",
            req.user?._id
        );


        if (
            role !== "EMPLOYEE"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Only employees can access employee payroll.",

            });

        }


        // =================================================
        // EMPLOYEE
        // =================================================

        const employee =
            await getLoggedInEmployee(
                req
            );


        if (!employee) {

            return res.status(404).json({

                success: false,

                message:
                    "Employee profile not found.",

            });

        }


        console.log(
            "EMPLOYEE PAYROLL EMPLOYEE ID:",
            employee._id
        );


        // =================================================
        // PAYROLL FILTER
        // =================================================
        //
        // Employee can see ONLY:
        //
        // APPROVED
        // PAID
        //
        // DRAFT is internal.
        // CANCELLED is hidden.
        //
        // =================================================

        const filter = {

            employee:
                employee._id,

            status: {

                $in: [

                    "APPROVED",

                    "PAID",

                ],

            },

        };


        // =================================================
        // MONTH FILTER
        // =================================================

        if (
            req.query.month
        ) {

            const month =
                Number(
                    req.query.month
                );


            if (
                Number.isInteger(month) &&
                month >= 1 &&
                month <= 12
            ) {

                filter.month =
                    month;

            }

        }


        // =================================================
        // YEAR FILTER
        // =================================================

        if (
            req.query.year
        ) {

            const year =
                Number(
                    req.query.year
                );


            if (
                Number.isInteger(year) &&
                year >= 2000 &&
                year <= 2100
            ) {

                filter.year =
                    year;

            }

        }


        // =================================================
        // GET PAYROLL
        // =================================================

        const payrolls =
            await Payroll.find(
                filter
            )

                .populate({

                    path:
                        "employee",

                    select:
                        "employeeId firstName lastName email department designation profileImage",

                })

                .populate({

                    path:
                        "salaryStructure",

                })

                .populate({

                    path:
                        "approvedBy",

                    select:
                        "name email role",

                })

                .sort({

                    year:
                        -1,

                    month:
                        -1,

                    createdAt:
                        -1,

                });


        // =================================================
        // SUMMARY
        // =================================================

        const summary = {

            total:
                payrolls.length,


            approved:

                payrolls.filter(
                    payroll =>
                        payroll.status ===
                        "APPROVED"
                ).length,


            paid:

                payrolls.filter(
                    payroll =>
                        payroll.status ===
                        "PAID"
                ).length,


            grossSalary:

                payrolls.reduce(

                    (
                        total,
                        payroll
                    ) =>

                        total +
                        Number(
                            payroll.grossSalary ||
                            0
                        ),

                    0

                ),


            totalDeductions:

                payrolls.reduce(

                    (
                        total,
                        payroll
                    ) =>

                        total +
                        Number(
                            payroll.totalDeductions ||
                            0
                        ),

                    0

                ),


            netSalary:

                payrolls.reduce(

                    (
                        total,
                        payroll
                    ) =>

                        total +
                        Number(
                            payroll.netSalary ||
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

            employee: {

                _id:
                    employee._id,

                employeeId:
                    employee.employeeId,

                firstName:
                    employee.firstName,

                lastName:
                    employee.lastName,

                email:
                    employee.email,

                department:
                    employee.department,

                designation:
                    employee.designation,

                profileImage:
                    employee.profileImage,

            },

            count:
                payrolls.length,

            summary,

            payrolls,

        });


    } catch (error) {

        console.error(
            "GET MY PAYROLL ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load employee payroll.",

            error:
                process.env.NODE_ENV ===
                "development"

                    ? error.message

                    : undefined,

        });

    }

};


// =====================================================
// GET SINGLE MY PAYROLL
// GET /api/employee/payroll/:id
// =====================================================

const getMyPayrollById = async (
    req,
    res
) => {

    try {

        const role =
            getUserRole(req);


        if (
            role !== "EMPLOYEE"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Only employees can access employee payroll.",

            });

        }


        // =================================================
        // EMPLOYEE
        // =================================================

        const employee =
            await getLoggedInEmployee(
                req
            );


        if (!employee) {

            return res.status(404).json({

                success: false,

                message:
                    "Employee profile not found.",

            });

        }


        // =================================================
        // PAYROLL ID
        // =================================================

        const {
            id
        } = req.params;


        if (
            !isValidObjectId(id)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid payroll ID.",

            });

        }


        // =================================================
        // IMPORTANT SECURITY
        //
        // The payroll MUST belong to the logged-in employee.
        // =================================================

        const payroll =
            await Payroll.findOne({

                _id:
                    id,

                employee:
                    employee._id,

                status: {

                    $in: [

                        "APPROVED",

                        "PAID",

                    ],

                },

            })

                .populate({

                    path:
                        "employee",

                    select:
                        "employeeId firstName lastName email department designation profileImage",

                })

                .populate({

                    path:
                        "salaryStructure",

                })

                .populate({

                    path:
                        "approvedBy",

                    select:
                        "name email role",

                });


        if (!payroll) {

            return res.status(404).json({

                success: false,

                message:
                    "Payroll not found.",

            });

        }


        return res.status(200).json({

            success: true,

            payroll,

        });


    } catch (error) {

        console.error(
            "GET MY PAYROLL BY ID ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load payroll.",

        });

    }

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    getMyPayroll,

    getMyPayrollById,

};