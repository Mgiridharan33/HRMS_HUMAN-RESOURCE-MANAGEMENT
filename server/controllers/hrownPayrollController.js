const mongoose = require("mongoose");

const HRPayroll =
    require("../models/HRPayroll");

const User =
    require("../models/User");

const HRSalaryStructure =
    require("../models/HRSalaryStructure");


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


const money = (value) => {

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
// CREATE HR PAYROLL
//
// POST /api/hr-payroll
//
// SUPER ADMIN ONLY
//
// DRAFT is created.
// No approval required.
// =====================================================

const createHRPayroll = async (
    req,
    res
) => {

    try {

        const userId =
            getUserId(req);

        const role =
            getUserRole(req);


        // =================================================
        // AUTH
        // =================================================

        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required.",
            });
        }


        // =================================================
        // ONLY SUPER ADMIN
        // =================================================

        if (
            role !== "SUPER_ADMIN"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Only Super Admin can create HR payroll.",
            });
        }


        // =================================================
        // REQUEST
        // =================================================

        const {
            hr,
            month,
            year,
        } =
            req.body || {};


        // =================================================
        // HR VALIDATION
        // =================================================

        if (!hr) {

            return res.status(400).json({

                success: false,

                message:
                    "HR user is required.",
            });
        }


        if (
            !isValidObjectId(hr)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid HR user ID.",
            });
        }


        // =================================================
        // MONTH / YEAR
        // =================================================

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
        // HR USER
        // =================================================

        const hrUser =
            await User.findById(
                hr
            );


        if (!hrUser) {

            return res.status(404).json({

                success: false,

                message:
                    "HR user not found.",
            });
        }


        if (
            String(hrUser.role)
                .toUpperCase() !== "HR"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Selected user is not an HR.",
            });
        }


        if (
            hrUser.isActive === false
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Cannot create payroll for an inactive HR.",
            });
        }


        // =================================================
        // DUPLICATE CHECK
        // =================================================

        const existingPayroll =
            await HRPayroll.findOne({

                hr:
                    hr,

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
                    `HR payroll already exists for ${payrollMonth}/${payrollYear}.`,

                payroll:
                    existingPayroll,
            });
        }


        // =================================================
        // ACTIVE HR SALARY STRUCTURE
        // =================================================

        let salaryStructure =
            await HRSalaryStructure.findOne({

                hr:
                    hr,

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
        // FALLBACK
        // =================================================

        if (
            !salaryStructure
        ) {

            const latestStructure =
                await HRSalaryStructure.findOne({

                    hr:
                        hr,

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

                await HRSalaryStructure.updateMany(

                    {
                        hr:
                            hr,

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
        // SALARY STRUCTURE REQUIRED
        // =================================================

        if (
            !salaryStructure
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Active HR salary structure not found. Please create a salary structure before creating HR payroll.",

                hr:
                    hr,
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


        // =================================================
        // WORKING DAYS
        // =================================================

        const standardWorkingDays =
            positiveNumber(
                salaryStructure.standardWorkingDaysPerMonth,
                26
            );


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
            new HRPayroll({

                hr:
                    hrUser._id,

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

                basicSalary,

                hra,

                da,

                conveyanceAllowance,

                medicalAllowance,

                specialAllowance,

                otherAllowance,

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

                // IMPORTANT
                // HR payroll starts as DRAFT.
                // Super Admin can directly pay it.
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
                path:
                    "hr",

                select:
                    "name email role profileImage isActive",
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
                "HR payroll created successfully.",

            payroll,
        });

    } catch (error) {

        console.error(
            "CREATE HR PAYROLL ERROR:",
            error
        );


        if (
            error.code === 11000
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "HR payroll already exists for this HR and payroll period.",
            });
        }


        return res.status(500).json({

            success: false,

            message:
                "Failed to create HR payroll.",

            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};


// =====================================================
// GET ALL HR PAYROLL
//
// GET /api/hr-payroll
//
// SUPER ADMIN → ALL HR PAYROLL
// HR → THEIR OWN PAYROLL
// =====================================================

const getAllHRPayroll =
    async (
        req,
        res
    ) => {

        try {

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


            if (
                role !== "SUPER_ADMIN" &&
                role !== "HR"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You are not authorized to view HR payroll.",
                });
            }


            const {
                month,
                year,
                status,
                search,
            } =
                req.query;


            const filter = {};


            // =================================================
            // HR CAN ONLY SEE THEIR OWN PAYROLL
            // =================================================

            if (
                role === "HR"
            ) {

                filter.hr =
                    userId;
            }


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
                    String(
                        status
                    )
                        .toUpperCase();
            }


            // =================================================
            // SEARCH HR
            // =================================================

            if (
                search &&
                String(search).trim()
            ) {

                const searchText =
                    String(
                        search
                    ).trim();


                const hrUsers =
                    await User.find({

                        role: {
                            $in: [
                                "HR",
                                "hr",
                            ],
                        },

                        $or: [

                            {
                                name: {
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


                const hrIds =
                    hrUsers.map(
                        item =>
                            item._id
                    );


                if (
                    role === "HR"
                ) {

                    filter.hr = userId;

                } else {

                    filter.hr = {

                        $in:
                            hrIds,
                    };
                }
            }


            // =================================================
            // FETCH
            // =================================================

            const payrolls =
                await HRPayroll.find(
                    filter
                )
                    .populate({

                        path:
                            "hr",

                        select:
                            "name email role profileImage isActive",
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
                            "paidBy",

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

                draft:
                    payrolls.filter(
                        item =>
                            item.status ===
                            "DRAFT"
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
                "GET HR PAYROLL ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to load HR payroll.",
            });
        }
    };


// =====================================================
// GET HR PAYROLL BY ID
//
// GET /api/hr-payroll/:id
// =====================================================

const getHRPayrollById =
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
            } =
                req.params;


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
                await HRPayroll.findById(
                    id
                )
                    .populate(
                        "hr"
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
                            "paidBy",

                        select:
                            "name email role",
                    });


            if (
                !payroll
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "HR payroll not found.",
                });
            }


            // HR can only access own payroll

            if (
                role === "HR" &&
                String(
                    payroll.hr?._id ||
                    payroll.hr
                ) !==
                String(userId)
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You are not authorized to view this payroll.",
                });
            }


            return res.status(200).json({

                success: true,

                payroll,
            });

        } catch (error) {

            console.error(
                "GET HR PAYROLL BY ID ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to load HR payroll.",
            });
        }
    };


// =====================================================
// PAY HR PAYROLL DIRECTLY
//
// PUT /api/hr-payroll/:id/pay
//
// SUPER ADMIN ONLY
//
// IMPORTANT:
// DRAFT → PAID
//
// NO APPROVAL REQUIRED
// =====================================================

const payHRPayroll =
    async (
        req,
        res
    ) => {

        try {

            const userId =
                getUserId(req);

            const role =
                getUserRole(req);


            // =================================================
            // ONLY SUPER ADMIN
            // =================================================

            if (
                role !== "SUPER_ADMIN"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Only Super Admin can pay HR payroll.",
                });
            }


            const {
                id,
            } =
                req.params;


            const {
                paymentMethod,
                paymentReference,
                notes,
            } =
                req.body || {};


            // =================================================
            // FIND PAYROLL
            // =================================================

            const payroll =
                await HRPayroll.findById(
                    id
                );


            if (
                !payroll
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "HR payroll not found.",
                });
            }


            // =================================================
            // ALREADY PAID
            // =================================================

            if (
                payroll.status ===
                "PAID"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "This HR payroll has already been paid.",
                });
            }


            // =================================================
            // CANCELLED
            // =================================================

            if (
                payroll.status ===
                "CANCELLED"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Cancelled HR payroll cannot be paid.",
                });
            }


            // =================================================
            // PAYMENT METHOD
            // =================================================

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
                    .trim()
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


            // =================================================
            // DIRECT PAYMENT
            //
            // NO APPROVAL CHECK
            // =================================================

            payroll.status =
                "PAID";


            payroll.paymentMethod =
                finalMethod;


            payroll.paymentReference =
                paymentReference || "";


            payroll.paidAt =
                new Date();


            payroll.paidBy =
                userId;


            if (
                notes !== undefined
            ) {

                payroll.notes =
                    String(notes);
            }


            payroll.updatedBy =
                userId;


            await payroll.save();


            await payroll.populate([

                {
                    path:
                        "hr",

                    select:
                        "name email role profileImage",
                },

                {
                    path:
                        "paidBy",

                    select:
                        "name email role",
                },
            ]);


            return res.status(200).json({

                success: true,

                message:
                    "HR payroll paid successfully.",

                payroll,
            });

        } catch (error) {

            console.error(
                "PAY HR PAYROLL ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to process HR payroll payment.",
            });
        }
    };


// =====================================================
// CANCEL HR PAYROLL
//
// PUT /api/hr-payroll/:id/cancel
// =====================================================

const cancelHRPayroll =
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
                role !== "SUPER_ADMIN"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Only Super Admin can cancel HR payroll.",
                });
            }


            const {
                id,
            } =
                req.params;


            const payroll =
                await HRPayroll.findById(
                    id
                );


            if (
                !payroll
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "HR payroll not found.",
                });
            }


            if (
                payroll.status ===
                "PAID"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Paid HR payroll cannot be cancelled.",
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
                    "HR payroll cancelled successfully.",

                payroll,
            });

        } catch (error) {

            console.error(
                "CANCEL HR PAYROLL ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to cancel HR payroll.",
            });
        }
    };


// =====================================================
// DELETE HR PAYROLL
//
// DELETE /api/hr-payroll/:id
// =====================================================

const deleteHRPayroll =
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
                        "Only Super Admin can delete HR payroll.",
                });
            }


            const {
                id,
            } =
                req.params;


            const payroll =
                await HRPayroll.findById(
                    id
                );


            if (
                !payroll
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "HR payroll not found.",
                });
            }


            if (
                payroll.status ===
                "PAID"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Paid HR payroll cannot be deleted.",
                });
            }


            await HRPayroll.findByIdAndDelete(
                id
            );


            return res.status(200).json({

                success: true,

                message:
                    "HR payroll deleted successfully.",
            });

        } catch (error) {

            console.error(
                "DELETE HR PAYROLL ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to delete HR payroll.",
            });
        }
    };


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    createHRPayroll,

    getAllHRPayroll,

    getHRPayrollById,

    payHRPayroll,

    cancelHRPayroll,

    deleteHRPayroll,
};