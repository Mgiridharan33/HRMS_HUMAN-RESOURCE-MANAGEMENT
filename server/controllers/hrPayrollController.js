const mongoose = require("mongoose");

const Payroll =
    require("../models/Payroll");


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
// GET ROLE
// =====================================================

const getRole = (req) => {

    return String(
        req.user?.role ||
        req.userType ||
        ""
    )
        .trim()
        .toUpperCase();
};


// =====================================================
// VALID OBJECT ID
// =====================================================

const isValidObjectId = (id) => {

    return Boolean(
        id &&
        mongoose.Types.ObjectId.isValid(id)
    );
};


// =====================================================
// GET HR PAYROLLS
// GET /api/payroll/hr
// =====================================================

const getHRPayrolls = async (
    req,
    res
) => {

    try {

        const role =
            getRole(req);


        if (role !== "HR") {

            return res.status(403).json({

                success: false,

                message:
                    "Only HR can access HR payroll management.",
            });
        }


        const {
            search,
            status,
            month,
            year,
        } = req.query;


        const filter = {};


        // =================================================
        // STATUS
        // =================================================

        if (
            status &&
            String(status).trim()
        ) {

            filter.status =
                String(status).trim();
        }


        // =================================================
        // MONTH
        // =================================================

        if (month) {

            const monthNumber =
                Number(month);

            if (
                Number.isInteger(monthNumber) &&
                monthNumber >= 1 &&
                monthNumber <= 12
            ) {

                filter.month =
                    monthNumber;
            }
        }


        // =================================================
        // YEAR
        // =================================================

        if (year) {

            const yearNumber =
                Number(year);

            if (
                Number.isInteger(yearNumber)
            ) {

                filter.year =
                    yearNumber;
            }
        }


        // =================================================
        // EMPLOYEE SEARCH
        // =================================================

        let payrollQuery =
            Payroll.find(filter);


        payrollQuery =
            payrollQuery
                .populate({

                    path: "employee",

                    select:
                        "employeeId firstName lastName email department designation joiningDate employmentType profileImage isActive",

                })
                .populate({

                    path: "salaryStructure",

                    select:
                        "basicSalary hra da conveyanceAllowance medicalAllowance specialAllowance otherAllowance overtimeRatePerHour pfEnabled pfPercentage esiEnabled esiPercentage professionalTax tdsPercentage loanDeduction otherDeduction",

                })
                .populate({

                    path: "submittedBy",

                    select:
                        "name email role",

                })
                .populate({

                    path: "approvedBy",

                    select:
                        "name email role",

                })
                .populate({

                    path: "rejectedBy",

                    select:
                        "name email role",

                });


        let payrolls =
            await payrollQuery
                .sort({
                    year: -1,
                    month: -1,
                    createdAt: -1,
                })
                .lean();


        // =================================================
        // SEARCH AFTER POPULATE
        // =================================================

        if (
            search &&
            String(search).trim()
        ) {

            const text =
                String(search)
                    .trim()
                    .toLowerCase();


            payrolls =
                payrolls.filter(
                    payroll => {

                        const employee =
                            payroll.employee || {};


                        const fullName =
                            `${employee.firstName || ""} ${employee.lastName || ""}`
                                .trim()
                                .toLowerCase();


                        const employeeId =
                            String(
                                employee.employeeId || ""
                            )
                                .toLowerCase();


                        const email =
                            String(
                                employee.email || ""
                            )
                                .toLowerCase();


                        return (
                            fullName.includes(text) ||
                            employeeId.includes(text) ||
                            email.includes(text)
                        );
                    }
                );
        }


        // =================================================
        // SUMMARY
        // =================================================

        const summary = {

            total:
                payrolls.length,

            draft:
                payrolls.filter(
                    item =>
                        item.status === "Draft"
                ).length,

            pendingApproval:
                payrolls.filter(
                    item =>
                        item.status ===
                        "Pending Approval"
                ).length,

            approved:
                payrolls.filter(
                    item =>
                        item.status === "Approved"
                ).length,

            rejected:
                payrolls.filter(
                    item =>
                        item.status === "Rejected"
                ).length,

            processing:
                payrolls.filter(
                    item =>
                        item.status === "Processing"
                ).length,

            paid:
                payrolls.filter(
                    item =>
                        item.status === "Paid"
                ).length,

        };


        return res.status(200).json({

            success: true,

            count:
                payrolls.length,

            summary,

            payrolls,

        });

    } catch (error) {

        console.error(
            "GET HR PAYROLLS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load HR payrolls.",

            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,

        });
    }
};


// =====================================================
// GET SINGLE HR PAYROLL
// GET /api/payroll/hr/:id
// =====================================================

const getHRPayrollById = async (
    req,
    res
) => {

    try {

        const role =
            getRole(req);


        if (role !== "HR") {

            return res.status(403).json({

                success: false,

                message:
                    "Only HR can access this payroll.",
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
                    "Invalid payroll ID.",
            });
        }


        const payroll =
            await Payroll.findById(id)

                .populate({

                    path: "employee",

                    select:
                        "employeeId firstName lastName email phone department designation joiningDate employmentType profileImage isActive",

                })

                .populate({

                    path: "salaryStructure",

                    select:
                        "basicSalary hra da conveyanceAllowance medicalAllowance specialAllowance otherAllowance overtimeRatePerHour bonus incentive pfEnabled pfPercentage esiEnabled esiPercentage professionalTax tdsPercentage loanDeduction otherDeduction standardWorkingHoursPerDay standardWorkingDaysPerMonth",

                })

                .populate({

                    path: "submittedBy",

                    select:
                        "name email role",

                })

                .populate({

                    path: "approvedBy",

                    select:
                        "name email role",

                })

                .populate({

                    path: "rejectedBy",

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
            "GET HR PAYROLL ERROR:",
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
// SUBMIT FOR APPROVAL
// PATCH /api/payroll/hr/:id/submit
// =====================================================

const submitPayrollForApproval = async (
    req,
    res
) => {

    try {

        const userId =
            getUserId(req);

        const role =
            getRole(req);


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required.",
            });
        }


        if (role !== "HR") {

            return res.status(403).json({

                success: false,

                message:
                    "Only HR can submit payroll for approval.",
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
                    "Invalid payroll ID.",
            });
        }


        const payroll =
            await Payroll.findById(id);


        if (!payroll) {

            return res.status(404).json({

                success: false,

                message:
                    "Payroll not found.",
            });
        }


        // =================================================
        // ONLY DRAFT
        // =================================================

        if (
            payroll.status !== "Draft"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    `Payroll cannot be submitted from ${payroll.status} status.`,
            });
        }


        payroll.status =
            "Pending Approval";


        payroll.submittedForApprovalAt =
            new Date();


        payroll.submittedBy =
            userId;


        payroll.updatedBy =
            userId;


        await payroll.save();


        return res.status(200).json({

            success: true,

            message:
                "Payroll submitted for approval successfully.",

            payroll,

        });

    } catch (error) {

        console.error(
            "SUBMIT PAYROLL ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to submit payroll for approval.",

        });
    }
};


// =====================================================
// APPROVE PAYROLL
// PATCH /api/payroll/hr/:id/approve
// =====================================================

const approvePayroll = async (
    req,
    res
) => {

    try {

        const userId =
            getUserId(req);

        const role =
            getRole(req);


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required.",
            });
        }


        if (role !== "HR") {

            return res.status(403).json({

                success: false,

                message:
                    "Only HR can approve payroll.",
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
                    "Invalid payroll ID.",
            });
        }


        const payroll =
            await Payroll.findById(id);


        if (!payroll) {

            return res.status(404).json({

                success: false,

                message:
                    "Payroll not found.",
            });
        }


        // =================================================
        // ONLY PENDING
        // =================================================

        if (
            payroll.status !==
            "Pending Approval"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    `Only payrolls in Pending Approval status can be approved. Current status: ${payroll.status}`,
            });
        }


        payroll.status =
            "Approved";


        payroll.approvedAt =
            new Date();


        payroll.approvedBy =
            userId;


        payroll.rejectedAt =
            null;

        payroll.rejectedBy =
            null;

        payroll.rejectionReason =
            "";


        payroll.updatedBy =
            userId;


        await payroll.save();


        return res.status(200).json({

            success: true,

            message:
                "Payroll approved successfully.",

            payroll,

        });

    } catch (error) {

        console.error(
            "APPROVE PAYROLL ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to approve payroll.",

        });
    }
};


// =====================================================
// REJECT PAYROLL
// PATCH /api/payroll/hr/:id/reject
// =====================================================

const rejectPayroll = async (
    req,
    res
) => {

    try {

        const userId =
            getUserId(req);

        const role =
            getRole(req);


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required.",
            });
        }


        if (role !== "HR") {

            return res.status(403).json({

                success: false,

                message:
                    "Only HR can reject payroll.",
            });
        }


        const {
            id,
        } = req.params;


        const {
            reason,
        } = req.body || {};


        if (
            !isValidObjectId(id)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid payroll ID.",
            });
        }


        if (
            !reason ||
            !String(reason).trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Rejection reason is required.",
            });
        }


        const payroll =
            await Payroll.findById(id);


        if (!payroll) {

            return res.status(404).json({

                success: false,

                message:
                    "Payroll not found.",
            });
        }


        // =================================================
        // ONLY PENDING
        // =================================================

        if (
            payroll.status !==
            "Pending Approval"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    `Only payrolls in Pending Approval status can be rejected. Current status: ${payroll.status}`,
            });
        }


        payroll.status =
            "Rejected";


        payroll.rejectedAt =
            new Date();


        payroll.rejectedBy =
            userId;


        payroll.rejectionReason =
            String(reason).trim();


        payroll.approvedAt =
            null;

        payroll.approvedBy =
            null;


        payroll.updatedBy =
            userId;


        await payroll.save();


        return res.status(200).json({

            success: true,

            message:
                "Payroll rejected successfully.",

            payroll,

        });

    } catch (error) {

        console.error(
            "REJECT PAYROLL ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to reject payroll.",

        });
    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    getHRPayrolls,

    getHRPayrollById,

    submitPayrollForApproval,

    approvePayroll,

    rejectPayroll,

};