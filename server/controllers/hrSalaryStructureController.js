const mongoose = require("mongoose");

const HRSalaryStructure =
    require("../models/HRSalaryStructure");

const User =
    require("../models/User");


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


const numberValue = (
    value,
    defaultValue = 0
) => {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return defaultValue;
    }

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : defaultValue;
};


const booleanValue = (
    value,
    defaultValue = false
) => {

    if (
        value === undefined ||
        value === null
    ) {
        return defaultValue;
    }

    if (
        typeof value === "boolean"
    ) {
        return value;
    }

    return (
        String(value)
            .toLowerCase() === "true"
    );
};


const validatePercentage = (
    value,
    field
) => {

    const number =
        Number(value);

    if (
        !Number.isFinite(number) ||
        number < 0 ||
        number > 100
    ) {

        return `${field} must be between 0 and 100.`;
    }

    return null;
};


// =====================================================
// GET HR USERS
// GET /api/hr-salary-structures/hr-users
// =====================================================

const getHRUsers = async (
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
                    "Only Super Admin can view HR users.",
            });
        }


        const hrUsers =
            await User.find({

                role: {
                    $in: [
                        "HR",
                        "hr",
                    ],
                },

            })
                .select(
                    "_id name email role profileImage isActive"
                )
                .sort({
                    name: 1,
                });


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
                "Failed to load HR users.",
        });
    }
};


// =====================================================
// CREATE HR SALARY STRUCTURE
// POST /api/hr-salary-structures
// =====================================================

const createHRSalaryStructure = async (
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


        // -------------------------------------------------
        // ONLY SUPER ADMIN
        // -------------------------------------------------

        if (
            role !== "SUPER_ADMIN"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Only Super Admin can create HR salary structures.",
            });
        }


        const body =
            req.body || {};


        const hrId =
            body.hr;


        // -------------------------------------------------
        // HR VALIDATION
        // -------------------------------------------------

        if (!hrId) {

            return res.status(400).json({

                success: false,

                message:
                    "HR user is required.",
            });
        }


        if (
            !isValidObjectId(hrId)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid HR user ID.",
            });
        }


        const hrUser =
            await User.findById(
                hrId
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
                    "Cannot create salary structure for an inactive HR.",
            });
        }


        // -------------------------------------------------
        // BASIC SALARY
        // -------------------------------------------------

        const basicSalary =
            numberValue(
                body.basicSalary
            );


        if (
            basicSalary <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Basic salary must be greater than zero.",
            });
        }


        // -------------------------------------------------
        // PERCENTAGES
        // -------------------------------------------------

        const pfPercentage =
            numberValue(
                body.pfPercentage,
                0
            );

        const esiPercentage =
            numberValue(
                body.esiPercentage,
                0
            );

        const tdsPercentage =
            numberValue(
                body.tdsPercentage,
                0
            );


        const pfError =
            validatePercentage(
                pfPercentage,
                "PF percentage"
            );

        if (pfError) {

            return res.status(400).json({

                success: false,

                message:
                    pfError,
            });
        }


        const esiError =
            validatePercentage(
                esiPercentage,
                "ESI percentage"
            );

        if (esiError) {

            return res.status(400).json({

                success: false,

                message:
                    esiError,
            });
        }


        const tdsError =
            validatePercentage(
                tdsPercentage,
                "TDS percentage"
            );

        if (tdsError) {

            return res.status(400).json({

                success: false,

                message:
                    tdsError,
            });
        }


        // -------------------------------------------------
        // DEACTIVATE OLD ACTIVE STRUCTURES
        // -------------------------------------------------

        await HRSalaryStructure.updateMany(

            {
                hr:
                    hrId,

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


        // -------------------------------------------------
        // CREATE
        // -------------------------------------------------

        const salaryStructure =
            new HRSalaryStructure({

                hr:
                    hrId,

                basicSalary,

                hra:
                    numberValue(
                        body.hra
                    ),

                da:
                    numberValue(
                        body.da
                    ),

                conveyanceAllowance:
                    numberValue(
                        body.conveyanceAllowance
                    ),

                medicalAllowance:
                    numberValue(
                        body.medicalAllowance
                    ),

                specialAllowance:
                    numberValue(
                        body.specialAllowance
                    ),

                otherAllowance:
                    numberValue(
                        body.otherAllowance
                    ),

                bonus:
                    numberValue(
                        body.bonus
                    ),

                incentive:
                    numberValue(
                        body.incentive
                    ),

                pfEnabled:
                    booleanValue(
                        body.pfEnabled,
                        false
                    ),

                pfPercentage,

                esiEnabled:
                    booleanValue(
                        body.esiEnabled,
                        false
                    ),

                esiPercentage,

                professionalTax:
                    numberValue(
                        body.professionalTax
                    ),

                tdsPercentage,

                loanDeduction:
                    numberValue(
                        body.loanDeduction
                    ),

                otherDeduction:
                    numberValue(
                        body.otherDeduction
                    ),

                standardWorkingHoursPerDay:
                    numberValue(
                        body.standardWorkingHoursPerDay,
                        8
                    ),

                standardWorkingDaysPerMonth:
                    numberValue(
                        body.standardWorkingDaysPerMonth,
                        26
                    ),

                isActive:
                    true,

                effectiveFrom:
                    body.effectiveFrom
                        ? new Date(
                            body.effectiveFrom
                        )
                        : new Date(),

                effectiveTo:
                    null,

                notes:
                    body.notes || "",

                createdBy:
                    userId,

                updatedBy:
                    userId,
            });


        await salaryStructure.save();


        // -------------------------------------------------
        // POPULATE HR
        // -------------------------------------------------

        await salaryStructure.populate({

            path:
                "hr",

            select:
                "name email role profileImage isActive",
        });


        return res.status(201).json({

            success: true,

            message:
                "HR salary structure created successfully.",

            salaryStructure,
        });

    } catch (error) {

        console.error(
            "CREATE HR SALARY STRUCTURE ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to create HR salary structure.",

            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};


// =====================================================
// GET ALL HR SALARY STRUCTURES
// GET /api/hr-salary-structures
// =====================================================

const getAllHRSalaryStructures = async (
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
                    "You are not authorized to view HR salary structures.",
            });
        }


        const {
            search,
            isActive,
        } =
            req.query;


        const filter = {};


        // -------------------------------------------------
        // ACTIVE FILTER
        // -------------------------------------------------

        if (
            isActive !== undefined
        ) {

            filter.isActive =
                String(
                    isActive
                ).toLowerCase() ===
                "true";
        }


        // -------------------------------------------------
        // SEARCH HR
        // -------------------------------------------------

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


            filter.hr = {

                $in:
                    hrUsers.map(
                        user =>
                            user._id
                    ),
            };
        }


        const salaryStructures =
            await HRSalaryStructure.find(
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
                        "createdBy",

                    select:
                        "name email role profileImage",
                })
                .populate({

                    path:
                        "updatedBy",

                    select:
                        "name email role profileImage",
                })
                .sort({

                    isActive:
                        -1,

                    createdAt:
                        -1,
                });


        const summary = {

            total:
                salaryStructures.length,

            active:
                salaryStructures.filter(
                    item =>
                        item.isActive
                ).length,

            inactive:
                salaryStructures.filter(
                    item =>
                        !item.isActive
                ).length,
        };


        return res.status(200).json({

            success: true,

            count:
                salaryStructures.length,

            summary,

            salaryStructures,
        });

    } catch (error) {

        console.error(
            "GET HR SALARY STRUCTURES ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to load HR salary structures.",
        });
    }
};


// =====================================================
// GET BY HR
// GET /api/hr-salary-structures/hr/:hrId
// =====================================================

const getHRSalaryStructureByHR = async (
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
            hrId,
        } =
            req.params;


        if (
            !isValidObjectId(hrId)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid HR ID.",
            });
        }


        const salaryStructure =
            await HRSalaryStructure.findOne({

                hr:
                    hrId,

                isActive:
                    true,

            })
                .sort({

                    effectiveFrom:
                        -1,

                    createdAt:
                        -1,
                })
                .populate({

                    path:
                        "hr",

                    select:
                        "name email role profileImage isActive",
                })
                .populate({

                    path:
                        "createdBy",

                    select:
                        "name email role",
                })
                .populate({

                    path:
                        "updatedBy",

                    select:
                        "name email role",
                });


        if (
            !salaryStructure
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Active HR salary structure not found.",
            });
        }


        return res.status(200).json({

            success: true,

            salaryStructure,
        });

    } catch (error) {

        console.error(
            "GET HR SALARY STRUCTURE ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to load HR salary structure.",
        });
    }
};


// =====================================================
// GET BY ID
// GET /api/hr-salary-structures/:id
// =====================================================

const getHRSalaryStructureById = async (
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
        } =
            req.params;


        if (
            !isValidObjectId(id)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid HR salary structure ID.",
            });
        }


        const salaryStructure =
            await HRSalaryStructure.findById(
                id
            )
                .populate({

                    path:
                        "hr",

                    select:
                        "name email role profileImage isActive",
                })
                .populate({

                    path:
                        "createdBy",

                    select:
                        "name email role",
                })
                .populate({

                    path:
                        "updatedBy",

                    select:
                        "name email role",
                });


        if (
            !salaryStructure
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "HR salary structure not found.",
            });
        }


        return res.status(200).json({

            success: true,

            salaryStructure,
        });

    } catch (error) {

        console.error(
            "GET HR SALARY STRUCTURE BY ID ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to load HR salary structure.",
        });
    }
};


// =====================================================
// UPDATE
// PUT /api/hr-salary-structures/:id
// =====================================================

const updateHRSalaryStructure = async (
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
            role !== "SUPER_ADMIN"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Only Super Admin can update HR salary structures.",
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
                    "Invalid salary structure ID.",
            });
        }


        const salaryStructure =
            await HRSalaryStructure.findById(
                id
            );


        if (
            !salaryStructure
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "HR salary structure not found.",
            });
        }


        const body =
            req.body || {};


        // -------------------------------------------------
        // NUMBER FIELDS
        // -------------------------------------------------

        const numberFields = [

            "basicSalary",

            "hra",

            "da",

            "conveyanceAllowance",

            "medicalAllowance",

            "specialAllowance",

            "otherAllowance",

            "bonus",

            "incentive",

            "professionalTax",

            "loanDeduction",

            "otherDeduction",

            "standardWorkingHoursPerDay",

            "standardWorkingDaysPerMonth",
        ];


        for (
            const field of numberFields
        ) {

            if (
                body[field] !== undefined
            ) {

                const value =
                    Number(
                        body[field]
                    );


                if (
                    !Number.isFinite(value) ||
                    value < 0
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            `${field} must be a valid non-negative number.`,
                    });
                }


                salaryStructure[field] =
                    value;
            }
        }


        if (
            salaryStructure.basicSalary <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Basic salary must be greater than zero.",
            });
        }


        // -------------------------------------------------
        // PERCENTAGES
        // -------------------------------------------------

        for (
            const field of [
                "pfPercentage",
                "esiPercentage",
                "tdsPercentage",
            ]
        ) {

            if (
                body[field] !== undefined
            ) {

                const value =
                    Number(
                        body[field]
                    );


                if (
                    !Number.isFinite(value) ||
                    value < 0 ||
                    value > 100
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            `${field} must be between 0 and 100.`,
                    });
                }


                salaryStructure[field] =
                    value;
            }
        }


        // -------------------------------------------------
        // ENABLE / DISABLE
        // -------------------------------------------------

        if (
            body.pfEnabled !== undefined
        ) {

            salaryStructure.pfEnabled =
                booleanValue(
                    body.pfEnabled
                );
        }


        if (
            body.esiEnabled !== undefined
        ) {

            salaryStructure.esiEnabled =
                booleanValue(
                    body.esiEnabled
                );
        }


        // -------------------------------------------------
        // ACTIVE STATUS
        // -------------------------------------------------

        if (
            body.isActive !== undefined
        ) {

            const newStatus =
                booleanValue(
                    body.isActive
                );


            if (
                newStatus === true
            ) {

                await HRSalaryStructure.updateMany(

                    {
                        hr:
                            salaryStructure.hr,

                        _id: {
                            $ne:
                                salaryStructure._id,
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
            }


            salaryStructure.isActive =
                newStatus;


            if (
                newStatus === false
            ) {

                salaryStructure.effectiveTo =
                    new Date();

            } else {

                salaryStructure.effectiveTo =
                    null;
            }
        }


        if (
            body.notes !== undefined
        ) {

            salaryStructure.notes =
                String(
                    body.notes
                );
        }


        salaryStructure.updatedBy =
            userId;


        await salaryStructure.save();


        await salaryStructure.populate({

            path:
                "hr",

            select:
                "name email role profileImage isActive",
        });


        return res.status(200).json({

            success: true,

            message:
                "HR salary structure updated successfully.",

            salaryStructure,
        });

    } catch (error) {

        console.error(
            "UPDATE HR SALARY STRUCTURE ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to update HR salary structure.",
        });
    }
};


// =====================================================
// ACTIVATE
// PUT /api/hr-salary-structures/:id/activate
// =====================================================

const activateHRSalaryStructure = async (
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
                    "Only Super Admin can activate HR salary structures.",
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
                    "Invalid salary structure ID.",
            });
        }


        const structure =
            await HRSalaryStructure.findById(
                id
            );


        if (
            !structure
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "HR salary structure not found.",
            });
        }


        await HRSalaryStructure.updateMany(

            {
                hr:
                    structure.hr,

                _id: {
                    $ne:
                        structure._id,
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


        structure.isActive =
            true;

        structure.effectiveFrom =
            structure.effectiveFrom ||
            new Date();

        structure.effectiveTo =
            null;

        structure.updatedBy =
            userId;


        await structure.save();


        return res.status(200).json({

            success: true,

            message:
                "HR salary structure activated successfully.",

            salaryStructure:
                structure,
        });

    } catch (error) {

        console.error(
            "ACTIVATE HR SALARY STRUCTURE ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to activate HR salary structure.",
        });
    }
};


// =====================================================
// DEACTIVATE
// PUT /api/hr-salary-structures/:id/deactivate
// =====================================================

const deactivateHRSalaryStructure = async (
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
                    "Only Super Admin can deactivate HR salary structures.",
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
                    "Invalid salary structure ID.",
            });
        }


        const structure =
            await HRSalaryStructure.findById(
                id
            );


        if (
            !structure
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "HR salary structure not found.",
            });
        }


        structure.isActive =
            false;

        structure.effectiveTo =
            new Date();

        structure.updatedBy =
            userId;


        await structure.save();


        return res.status(200).json({

            success: true,

            message:
                "HR salary structure deactivated successfully.",

            salaryStructure:
                structure,
        });

    } catch (error) {

        console.error(
            "DEACTIVATE HR SALARY STRUCTURE ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to deactivate HR salary structure.",
        });
    }
};


// =====================================================
// DELETE
// DELETE /api/hr-salary-structures/:id
// =====================================================

const deleteHRSalaryStructure = async (
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
                    "Only Super Admin can delete HR salary structures.",
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
                    "Invalid salary structure ID.",
            });
        }


        const structure =
            await HRSalaryStructure.findById(
                id
            );


        if (
            !structure
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "HR salary structure not found.",
            });
        }


        await HRSalaryStructure.findByIdAndDelete(
            id
        );


        return res.status(200).json({

            success: true,

            message:
                "HR salary structure deleted successfully.",
        });

    } catch (error) {

        console.error(
            "DELETE HR SALARY STRUCTURE ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to delete HR salary structure.",
        });
    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    getHRUsers,

    createHRSalaryStructure,

    getAllHRSalaryStructures,

    getHRSalaryStructureByHR,

    getHRSalaryStructureById,

    updateHRSalaryStructure,

    activateHRSalaryStructure,

    deactivateHRSalaryStructure,

    deleteHRSalaryStructure,
};