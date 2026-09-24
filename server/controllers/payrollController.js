const mongoose = require("mongoose");

const Payroll =
    require("../models/Payroll");

const Employee =
    require("../models/Employee");

const SalaryStructure =
    require("../models/SalaryStructure");


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


const isValidObjectId = (
    id
) => {

    return Boolean(
        id &&
        mongoose.Types.ObjectId.isValid(id)
    );
};


const money = (
    value
) => {

    const number =
        Number(value);

    if (
        !Number.isFinite(number)
    ) {
        return 0;
    }

    return Math.round(
        number * 100
    ) / 100;
};


const positiveNumber = (
    value,
    fallback = 0
) => {

    const number =
        Number(value);

    if (
        !Number.isFinite(number) ||
        number < 0
    ) {
        return fallback;
    }

    return number;
};


// =====================================================
// CREATE PAYROLL
// POST /api/payroll
// =====================================================

const createPayroll = async (
    req,
    res
) => {

    try {

        // =================================================
        // AUTH
        // =================================================

        const userId =
            getUserId(req);

        const role =
            getUserRole(req);

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

        if (
            role !== "SUPER_ADMIN" &&
            role !== "HR"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "You are not authorized to create payroll.",
            });
        }


        // =================================================
        // REQUEST
        // =================================================

        const {
            employee,
            month,
            year,
        } = req.body || {};


        // =================================================
        // VALIDATION
        // =================================================

        if (!employee) {

            return res.status(400).json({

                success: false,

                message:
                    "Employee is required.",
            });
        }


        if (
            !isValidObjectId(
                employee
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid employee ID.",
            });
        }


        const payrollMonth =
            Number(month);

        const payrollYear =
            Number(year);


        if (
            !Number.isInteger(
                payrollMonth
            ) ||
            payrollMonth < 1 ||
            payrollMonth > 12
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid payroll month.",
            });
        }


        if (
            !Number.isInteger(
                payrollYear
            ) ||
            payrollYear < 2000 ||
            payrollYear > 2100
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid payroll year.",
            });
        }


        // =================================================
        // EMPLOYEE
        // =================================================

        const employeeRecord =
            await Employee.findById(
                employee
            );


        if (!employeeRecord) {

            return res.status(404).json({

                success: false,

                message:
                    "Employee not found.",
            });
        }


        if (
            employeeRecord.isActive === false
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Cannot create payroll for an inactive employee.",
            });
        }


        // =================================================
        // CHECK DUPLICATE
        // =================================================

        const existingPayroll =
            await Payroll.findOne({

                employee:
                    employee,

                month:
                    payrollMonth,

                year:
                    payrollYear,
            });


        if (
            existingPayroll
        ) {

            return res.status(409).json({

                success: false,

                message:
                    `Payroll already exists for ${payrollMonth}/${payrollYear}.`,
                
                payroll:
                    existingPayroll,
            });
        }


        // =================================================
        // ACTIVE SALARY STRUCTURE
        // =================================================
        //
        // THIS IS THE PART THAT FIXES YOUR CURRENT ERROR
        //
        // =================================================

        let salaryStructure =
            await SalaryStructure.findOne({

                employee:
                    employee,

                isActive:
                    true,

            })
                .sort({

                    effectiveFrom:
                        -1,

                    createdAt:
                        -1,
                });


        // =================================================
        // FALLBACK:
        // If an old structure exists but isActive is not
        // correctly set, find the latest structure.
        // =================================================

        if (
            !salaryStructure
        ) {

            const latestStructure =
                await SalaryStructure.findOne({

                    employee:
                        employee,

                })
                    .sort({

                        effectiveFrom:
                            -1,

                        createdAt:
                            -1,
                    });


            if (
                latestStructure
            ) {

                // ------------------------------------------------
                // Automatically activate the latest structure.
                //
                // This handles old salary structures created
                // before the active salary logic was corrected.
                // ------------------------------------------------

                await SalaryStructure.updateMany(
                    {
                        employee:
                            employee,

                        _id: {
                            $ne:
                                latestStructure._id,
                        },

                        isActive:
                            true,
                    },
                    {
                        $set: {
                            isActive:
                                false,

                            effectiveTo:
                                new Date(),

                            updatedBy:
                                userId,
                        },
                    }
                );


                latestStructure.isActive =
                    true;

                latestStructure.effectiveTo =
                    null;

                latestStructure.updatedBy =
                    userId;

                await latestStructure.save();


                salaryStructure =
                    latestStructure;
            }
        }


        // =================================================
        // FINAL SALARY STRUCTURE CHECK
        // =================================================

        if (
            !salaryStructure
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Active salary structure not found for this employee. Please create a salary structure before creating payroll.",

                employee:
                    employee,
            });
        }


        // =================================================
        // SALARY VALUES
        // =================================================

        const basicSalary =
            positiveNumber(
                salaryStructure.basicSalary
            );

        const hra =
            positiveNumber(
                salaryStructure.hra
            );

        const da =
            positiveNumber(
                salaryStructure.da
            );

        const conveyanceAllowance =
            positiveNumber(
                salaryStructure.conveyanceAllowance
            );

        const medicalAllowance =
            positiveNumber(
                salaryStructure.medicalAllowance
            );

        const specialAllowance =
            positiveNumber(
                salaryStructure.specialAllowance
            );

        const otherAllowance =
            positiveNumber(
                salaryStructure.otherAllowance
            );

        const bonus =
            positiveNumber(
                salaryStructure.bonus
            );

        const incentive =
            positiveNumber(
                salaryStructure.incentive
            );

        const overtimeRate =
            positiveNumber(
                salaryStructure.overtimeRatePerHour
            );


        // =================================================
        // WORKING DAYS
        // =================================================

        const standardWorkingDays =
            positiveNumber(
                salaryStructure.standardWorkingDaysPerMonth,
                26
            );


        // =================================================
        // ATTENDANCE
        //
        // For initial payroll generation, salary structure
        // working days are used as the payroll basis.
        //
        // Later attendance integration can update these
        // values before approval.
        // =================================================

        const workingDays =
            standardWorkingDays;

        const presentDays =
            standardWorkingDays;

        const paidLeaveDays =
            0;

        const unpaidLeaveDays =
            0;

        const absentDays =
            0;

        const overtimeHours =
            0;


        // =================================================
        // OVERTIME
        // =================================================

        const overtimeAmount =
            money(
                overtimeHours *
                overtimeRate
            );


        // =================================================
        // GROSS
        // =================================================

        const grossSalary =
            money(

                basicSalary +

                hra +

                da +

                conveyanceAllowance +

                medicalAllowance +

                specialAllowance +

                otherAllowance +

                overtimeAmount +

                bonus +

                incentive
            );


        // =================================================
        // PF
        // =================================================

        let pfAmount =
            0;

        if (
            salaryStructure.pfEnabled
        ) {

            pfAmount =
                money(

                    basicSalary *
                    (
                        positiveNumber(
                            salaryStructure.pfPercentage
                        ) / 100
                    )
                );
        }


        // =================================================
        // ESI
        // =================================================

        let esiAmount =
            0;

        if (
            salaryStructure.esiEnabled
        ) {

            esiAmount =
                money(

                    grossSalary *
                    (
                        positiveNumber(
                            salaryStructure.esiPercentage
                        ) / 100
                    )
                );
        }


        // =================================================
        // PROFESSIONAL TAX
        // =================================================

        const professionalTax =
            money(
                salaryStructure.professionalTax
            );


        // =================================================
        // TDS
        // =================================================

        const tdsAmount =
            money(

                grossSalary *
                (
                    positiveNumber(
                        salaryStructure.tdsPercentage
                    ) / 100
                )
            );


        // =================================================
        // LOAN
        // =================================================

        const loanDeduction =
            money(
                salaryStructure.loanDeduction
            );


        // =================================================
        // OTHER DEDUCTION
        // =================================================

        const otherDeduction =
            money(
                salaryStructure.otherDeduction
            );


        // =================================================
        // TOTAL DEDUCTIONS
        // =================================================

        const totalDeductions =
            money(

                pfAmount +

                esiAmount +

                professionalTax +

                tdsAmount +

                loanDeduction +

                otherDeduction
            );


        // =================================================
        // NET SALARY
        // =================================================

        const netSalary =
            money(

                Math.max(
                    0,
                    grossSalary -
                    totalDeductions
                )
            );


        // =================================================
        // CREATE PAYROLL
        // =================================================

        const payroll =
            new Payroll({

                employee:
                    employeeRecord._id,

                salaryStructure:
                    salaryStructure._id,

                month:
                    payrollMonth,

                year:
                    payrollYear,

                workingDays,

                presentDays,

                paidLeaveDays,

                unpaidLeaveDays,

                absentDays,

                overtimeHours,

                basicSalary,

                hra,

                da,

                conveyanceAllowance,

                medicalAllowance,

                specialAllowance,

                otherAllowance,

                overtimeAmount,

                bonus,

                incentive,

                grossSalary,

                pfAmount,

                esiAmount,

                professionalTax,

                tdsAmount,

                loanDeduction,

                otherDeduction,

                totalDeductions,

                netSalary,

                status:
                    "DRAFT",

                createdBy:
                    userId,

                updatedBy:
                    userId,
            });


        await payroll.save();


        // =================================================
        // POPULATE
        // =================================================

        await payroll.populate([
            {
                path: "employee",

                select:
                    "employeeId firstName lastName email department designation profileImage",
            },

            {
                path:
                    "salaryStructure",
            },

            {
                path:
                    "createdBy",

                select:
                    "name email role",
            },
        ]);


        // =================================================
        // SUCCESS
        // =================================================

        return res.status(201).json({

            success: true,

            message:
                "Payroll created successfully.",

            payroll,
        });

    } catch (error) {

        console.error(
            "CREATE PAYROLL ERROR:",
            error
        );


        // =================================================
        // DUPLICATE KEY
        // =================================================

        if (
            error.code === 11000
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "Payroll already exists for this employee and payroll period.",
            });
        }


        return res.status(500).json({

            success: false,

            message:
                "Failed to create payroll.",

            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};


// =====================================================
// GET ALL PAYROLL
// GET /api/payroll
// =====================================================

const getAllPayroll =
    async (
        req,
        res
    ) => {

        try {

            const role =
                getUserRole(req);

            if (
                role !== "SUPER_ADMIN" &&
                role !== "HR"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You are not authorized to view payroll.",
                });
            }


            const {
                month,
                year,
                status,
                search,
            } = req.query;


            const filter = {};


            if (
                month
            ) {

                filter.month =
                    Number(month);
            }


            if (
                year
            ) {

                filter.year =
                    Number(year);
            }


            if (
                status
            ) {

                filter.status =
                    String(status)
                        .toUpperCase();
            }


            // =================================================
            // EMPLOYEE SEARCH
            // =================================================

            if (
                search &&
                String(search).trim()
            ) {

                const searchText =
                    String(
                        search
                    ).trim();


                const employees =
                    await Employee.find({

                        $or: [

                            {
                                employeeId: {
                                    $regex:
                                        searchText,

                                    $options:
                                        "i",
                                },
                            },

                            {
                                firstName: {
                                    $regex:
                                        searchText,

                                    $options:
                                        "i",
                                },
                            },

                            {
                                lastName: {
                                    $regex:
                                        searchText,

                                    $options:
                                        "i",
                                },
                            },

                            {
                                email: {
                                    $regex:
                                        searchText,

                                    $options:
                                        "i",
                                },
                            },
                        ],

                    }).select("_id");


                filter.employee = {

                    $in:
                        employees.map(
                            item =>
                                item._id
                        ),
                };
            }


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
                            "createdBy",

                        select:
                            "name email role",

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


            const summary = {

                total:
                    payrolls.length,

                draft:
                    payrolls.filter(
                        item =>
                            item.status ===
                            "DRAFT"
                    ).length,

                approved:
                    payrolls.filter(
                        item =>
                            item.status ===
                            "APPROVED"
                    ).length,

                paid:
                    payrolls.filter(
                        item =>
                            item.status ===
                            "PAID"
                    ).length,

                cancelled:
                    payrolls.filter(
                        item =>
                            item.status ===
                            "CANCELLED"
                    ).length,

                gross:

                    money(
                        payrolls.reduce(
                            (
                                total,
                                item
                            ) =>
                                total +
                                Number(
                                    item.grossSalary ||
                                    0
                                ),

                            0
                        )
                    ),

                deductions:

                    money(
                        payrolls.reduce(
                            (
                                total,
                                item
                            ) =>
                                total +
                                Number(
                                    item.totalDeductions ||
                                    0
                                ),

                            0
                        )
                    ),

                net:

                    money(
                        payrolls.reduce(
                            (
                                total,
                                item
                            ) =>
                                total +
                                Number(
                                    item.netSalary ||
                                    0
                                ),

                            0
                        )
                    ),
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
                "GET PAYROLL ERROR:",
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
// GET PAYROLL BY ID
// GET /api/payroll/:id
// =====================================================

const getPayrollById =
    async (
        req,
        res
    ) => {

        try {

            const role =
                getUserRole(req);

            if (
                role !== "SUPER_ADMIN" &&
                role !== "HR"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You are not authorized.",
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
                await Payroll.findById(
                    id
                )
                    .populate(
                        "employee"
                    )
                    .populate(
                        "salaryStructure"
                    )
                    .populate({
                        path:
                            "createdBy",

                        select:
                            "name email role",
                    })
                    .populate({
                        path:
                            "approvedBy",

                        select:
                            "name email role",
                    });


            if (
                !payroll
            ) {

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
                "GET PAYROLL BY ID ERROR:",
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
// APPROVE PAYROLL
// PUT /api/payroll/:id/approve
// =====================================================

const approvePayroll =
    async (
        req,
        res
    ) => {

        try {

            const userId =
                getUserId(req);

            const role =
                getUserRole(req);


            if (
                role !== "SUPER_ADMIN" &&
                role !== "HR"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You are not authorized.",
                });
            }


            const {
                id,
            } = req.params;


            const payroll =
                await Payroll.findById(
                    id
                );


            if (
                !payroll
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Payroll not found.",
                });
            }


            if (
                payroll.status ===
                "PAID"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Paid payroll cannot be approved again.",
                });
            }


            if (
                payroll.status ===
                "CANCELLED"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Cancelled payroll cannot be approved.",
                });
            }


            payroll.status =
                "APPROVED";

            payroll.approvedBy =
                userId;

            payroll.approvedAt =
                new Date();

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
// PAY PAYROLL
// PUT /api/payroll/:id/pay
// =====================================================

const payPayroll =
    async (
        req,
        res
    ) => {

        try {

            const userId =
                getUserId(req);

            const role =
                getUserRole(req);


            if (
                role !== "SUPER_ADMIN" &&
                role !== "HR"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You are not authorized.",
                });
            }


            const {
                id,
            } = req.params;


            const {
                paymentMethod,
                paymentReference,
            } =
                req.body || {};


            const payroll =
                await Payroll.findById(
                    id
                );


            if (
                !payroll
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Payroll not found.",
                });
            }


            if (
                payroll.status !==
                "APPROVED"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Only approved payroll can be marked as paid.",
                });
            }


            const validMethods = [

                "BANK_TRANSFER",

                "CASH",

                "CHEQUE",

                "OTHER",
            ];


            const finalMethod =
                String(
                    paymentMethod ||
                    ""
                )
                    .toUpperCase();


            if (
                !validMethods.includes(
                    finalMethod
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid payment method.",
                });
            }


            payroll.status =
                "PAID";

            payroll.paymentMethod =
                finalMethod;

            payroll.paymentReference =
                paymentReference || "";

            payroll.paidAt =
                new Date();

            payroll.updatedBy =
                userId;


            await payroll.save();


            return res.status(200).json({

                success: true,

                message:
                    "Payroll marked as paid successfully.",

                payroll,
            });

        } catch (error) {

            console.error(
                "PAY PAYROLL ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to process payroll payment.",
            });
        }
    };


// =====================================================
// CANCEL PAYROLL
// PUT /api/payroll/:id/cancel
// =====================================================

const cancelPayroll =
    async (
        req,
        res
    ) => {

        try {

            const userId =
                getUserId(req);

            const role =
                getUserRole(req);


            if (
                role !== "SUPER_ADMIN" &&
                role !== "HR"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You are not authorized.",
                });
            }


            const {
                id,
            } = req.params;


            const payroll =
                await Payroll.findById(
                    id
                );


            if (
                !payroll
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Payroll not found.",
                });
            }


            if (
                payroll.status ===
                "PAID"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Paid payroll cannot be cancelled.",
                });
            }


            payroll.status =
                "CANCELLED";

            payroll.updatedBy =
                userId;


            await payroll.save();


            return res.status(200).json({

                success: true,

                message:
                    "Payroll cancelled successfully.",

                payroll,
            });

        } catch (error) {

            console.error(
                "CANCEL PAYROLL ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to cancel payroll.",
            });
        }
    };


// =====================================================
// DELETE PAYROLL
// DELETE /api/payroll/:id
// =====================================================

const deletePayroll =
    async (
        req,
        res
    ) => {

        try {

            const role =
                getUserRole(req);


            if (
                role !== "SUPER_ADMIN"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Only Super Admin can delete payroll.",
                });
            }


            const {
                id,
            } = req.params;


            const payroll =
                await Payroll.findById(
                    id
                );


            if (
                !payroll
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Payroll not found.",
                });
            }


            if (
                payroll.status ===
                "PAID"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Paid payroll cannot be deleted.",
                });
            }


            await Payroll.findByIdAndDelete(
                id
            );


            return res.status(200).json({

                success: true,

                message:
                    "Payroll deleted successfully.",
            });

        } catch (error) {

            console.error(
                "DELETE PAYROLL ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to delete payroll.",
            });
        }
    };


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    createPayroll,

    getAllPayroll,

    getPayrollById,

    approvePayroll,

    payPayroll,

    cancelPayroll,

    deletePayroll,
};