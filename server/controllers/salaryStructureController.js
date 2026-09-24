const mongoose = require("mongoose");

const SalaryStructure =
    require("../models/SalaryStructure");

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

    const number = Number(value);

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

    if (typeof value === "boolean") {
        return value;
    }

    return String(value).toLowerCase() === "true";
};


const validatePercentage = (
    value,
    field
) => {

    const number = Number(value);

    if (
        !Number.isFinite(number) ||
        number < 0 ||
        number > 100
    ) {

        return `${field} must be between 0 and 100.`;
    }

    return null;
};


const getEmployee = async (
    employeeId
) => {

    if (
        !isValidObjectId(employeeId)
    ) {
        return null;
    }

    return Employee.findById(
        employeeId
    );
};


// =====================================================
// CREATE
// POST /api/salary-structures
// =====================================================

const createSalaryStructure = async (
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
                message: "Authentication required.",
            });
        }

        if (
            role !== "SUPER_ADMIN" &&
            role !== "HR"
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to create salary structures.",
            });
        }

        const body =
            req.body || {};

        const employeeId =
            body.employee;

        if (!employeeId) {

            return res.status(400).json({
                success: false,
                message: "Employee is required.",
            });
        }

        if (
            !isValidObjectId(employeeId)
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid employee ID.",
            });
        }

        const employee =
            await getEmployee(
                employeeId
            );

        if (!employee) {

            return res.status(404).json({
                success: false,
                message: "Employee not found.",
            });
        }

        if (
            employee.isActive === false
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "Cannot create salary structure for an inactive employee.",
            });
        }

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

        const pfPercentage =
            numberValue(
                body.pfPercentage,
                12
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
                message: pfError,
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
                message: esiError,
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
                message: tdsError,
            });
        }

        // -------------------------------------------------
        // IMPORTANT:
        // Existing inactive structures are allowed.
        // A new structure is created as active.
        // Previous active structures are deactivated.
        // -------------------------------------------------

        await SalaryStructure.updateMany(
            {
                employee: employeeId,
                isActive: true,
            },
            {
                $set: {
                    isActive: false,
                    updatedBy: userId,
                    effectiveTo: new Date(),
                },
            }
        );

        const salaryStructure =
            new SalaryStructure({

                employee: employeeId,

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

                overtimeRatePerHour:
                    numberValue(
                        body.overtimeRatePerHour
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

                isActive: true,

                effectiveFrom:
                    body.effectiveFrom
                        ? new Date(
                            body.effectiveFrom
                        )
                        : new Date(),

                effectiveTo: null,

                notes:
                    body.notes || "",

                createdBy:
                    userId,

                updatedBy:
                    userId,
            });

        await salaryStructure.save();

        await salaryStructure.populate({
            path: "employee",
            select:
                "employeeId firstName lastName email department designation joiningDate employmentType profileImage isActive",
        });

        return res.status(201).json({

            success: true,

            message:
                "Salary structure created successfully.",

            salaryStructure,
        });

    } catch (error) {

        console.error(
            "CREATE SALARY STRUCTURE ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to create salary structure.",

            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};


// =====================================================
// GET ALL
// GET /api/salary-structures
// =====================================================

const getAllSalaryStructures = async (
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
                    "You are not authorized to view salary structures.",
            });
        }

        const {
            search,
            department,
            designation,
            isActive,
        } = req.query;

        const filter = {};

        if (
            isActive !== undefined
        ) {

            filter.isActive =
                String(isActive)
                    .toLowerCase() === "true";
        }

        if (
            search ||
            department ||
            designation
        ) {

            const employeeFilter = {};

            if (department) {

                employeeFilter.department = {
                    $regex:
                        String(
                            department
                        ).trim(),
                    $options: "i",
                };
            }

            if (designation) {

                employeeFilter.designation = {
                    $regex:
                        String(
                            designation
                        ).trim(),
                    $options: "i",
                };
            }

            if (search) {

                const searchText =
                    String(
                        search
                    ).trim();

                employeeFilter.$or = [

                    {
                        employeeId: {
                            $regex:
                                searchText,
                            $options: "i",
                        },
                    },

                    {
                        firstName: {
                            $regex:
                                searchText,
                            $options: "i",
                        },
                    },

                    {
                        lastName: {
                            $regex:
                                searchText,
                            $options: "i",
                        },
                    },

                    {
                        email: {
                            $regex:
                                searchText,
                            $options: "i",
                        },
                    },
                ];
            }

            const employees =
                await Employee.find(
                    employeeFilter
                ).select("_id");

            filter.employee = {
                $in:
                    employees.map(
                        employee =>
                            employee._id
                    ),
            };
        }

        const salaryStructures =
            await SalaryStructure.find(
                filter
            )
                .populate({
                    path: "employee",
                    select:
                        "employeeId firstName lastName email department designation joiningDate employmentType profileImage isActive",
                })
                .populate({
                    path: "createdBy",
                    select:
                        "name email role profileImage",
                })
                .populate({
                    path: "updatedBy",
                    select:
                        "name email role profileImage",
                })
                .sort({
                    isActive: -1,
                    createdAt: -1,
                });

        return res.status(200).json({

            success: true,

            count:
                salaryStructures.length,

            summary: {

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
            },

            salaryStructures,
        });

    } catch (error) {

        console.error(
            "GET SALARY STRUCTURES ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to load salary structures.",
        });
    }
};


// =====================================================
// GET BY EMPLOYEE
// GET /api/salary-structures/employee/:employeeId
// =====================================================

const getSalaryStructureByEmployee = async (
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
            employeeId,
        } = req.params;

        if (
            !isValidObjectId(
                employeeId
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid employee ID.",
            });
        }

        const salaryStructure =
            await SalaryStructure.findOne({
                employee: employeeId,
                isActive: true,
            })
                .sort({
                    effectiveFrom: -1,
                    createdAt: -1,
                })
                .populate({
                    path: "employee",
                    select:
                        "employeeId firstName lastName email department designation joiningDate employmentType profileImage isActive",
                })
                .populate({
                    path: "createdBy",
                    select:
                        "name email role",
                })
                .populate({
                    path: "updatedBy",
                    select:
                        "name email role",
                });

        if (
            !salaryStructure
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Active salary structure not found for this employee.",
            });
        }

        return res.status(200).json({

            success: true,

            salaryStructure,
        });

    } catch (error) {

        console.error(
            "GET SALARY STRUCTURE BY EMPLOYEE ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to load salary structure.",
        });
    }
};


// =====================================================
// GET BY ID
// GET /api/salary-structures/:id
// =====================================================

const getSalaryStructureById = async (
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
                    "Invalid salary structure ID.",
            });
        }

        const salaryStructure =
            await SalaryStructure.findById(
                id
            )
                .populate({
                    path: "employee",
                    select:
                        "employeeId firstName lastName email department designation joiningDate employmentType profileImage isActive",
                })
                .populate({
                    path: "createdBy",
                    select:
                        "name email role",
                })
                .populate({
                    path: "updatedBy",
                    select:
                        "name email role",
                });

        if (
            !salaryStructure
        ) {

            return res.status(404).json({
                success: false,
                message:
                    "Salary structure not found.",
            });
        }

        return res.status(200).json({

            success: true,

            salaryStructure,
        });

    } catch (error) {

        console.error(
            "GET SALARY STRUCTURE BY ID ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to load salary structure.",
        });
    }
};


// =====================================================
// UPDATE
// PUT /api/salary-structures/:id
// =====================================================

const updateSalaryStructure = async (
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
                    "Invalid salary structure ID.",
            });
        }

        const salaryStructure =
            await SalaryStructure.findById(
                id
            );

        if (
            !salaryStructure
        ) {

            return res.status(404).json({
                success: false,
                message:
                    "Salary structure not found.",
            });
        }

        const body =
            req.body || {};

        const numberFields = [

            "basicSalary",

            "hra",
            "da",

            "conveyanceAllowance",
            "medicalAllowance",
            "specialAllowance",
            "otherAllowance",

            "overtimeRatePerHour",

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

                await SalaryStructure.updateMany(
                    {
                        employee:
                            salaryStructure.employee,

                        _id: {
                            $ne:
                                salaryStructure._id,
                        },

                        isActive: true,
                    },
                    {
                        $set: {
                            isActive: false,
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
            path: "employee",
            select:
                "employeeId firstName lastName email department designation joiningDate employmentType profileImage isActive",
        });

        return res.status(200).json({

            success: true,

            message:
                "Salary structure updated successfully.",

            salaryStructure,
        });

    } catch (error) {

        console.error(
            "UPDATE SALARY STRUCTURE ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to update salary structure.",

            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};


// =====================================================
// ACTIVATE
// PUT /api/salary-structures/:id/activate
// =====================================================

const activateSalaryStructure = async (
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
                    "Invalid salary structure ID.",
            });
        }

        const structure =
            await SalaryStructure.findById(
                id
            );

        if (!structure) {

            return res.status(404).json({
                success: false,
                message:
                    "Salary structure not found.",
            });
        }

        await SalaryStructure.updateMany(
            {
                employee:
                    structure.employee,

                _id: {
                    $ne:
                        structure._id,
                },

                isActive: true,
            },
            {
                $set: {
                    isActive: false,
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
                "Salary structure activated successfully.",

            salaryStructure:
                structure,
        });

    } catch (error) {

        console.error(
            "ACTIVATE SALARY STRUCTURE ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to activate salary structure.",
        });
    }
};


// =====================================================
// DEACTIVATE
// PUT /api/salary-structures/:id/deactivate
// =====================================================

const deactivateSalaryStructure = async (
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
                    "Invalid salary structure ID.",
            });
        }

        const structure =
            await SalaryStructure.findById(
                id
            );

        if (!structure) {

            return res.status(404).json({
                success: false,
                message:
                    "Salary structure not found.",
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
                "Salary structure deactivated successfully.",

            salaryStructure:
                structure,
        });

    } catch (error) {

        console.error(
            "DEACTIVATE SALARY STRUCTURE ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to deactivate salary structure.",
        });
    }
};


// =====================================================
// DELETE
// DELETE /api/salary-structures/:id
// =====================================================

const deleteSalaryStructure = async (
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
                    "Only Super Admin can delete salary structures.",
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
                    "Invalid salary structure ID.",
            });
        }

        const structure =
            await SalaryStructure.findById(
                id
            );

        if (!structure) {

            return res.status(404).json({
                success: false,
                message:
                    "Salary structure not found.",
            });
        }

        await SalaryStructure.findByIdAndDelete(
            id
        );

        return res.status(200).json({

            success: true,

            message:
                "Salary structure deleted successfully.",
        });

    } catch (error) {

        console.error(
            "DELETE SALARY STRUCTURE ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to delete salary structure.",
        });
    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    createSalaryStructure,

    getAllSalaryStructures,

    getSalaryStructureByEmployee,

    getSalaryStructureById,

    updateSalaryStructure,

    activateSalaryStructure,

    deactivateSalaryStructure,

    deleteSalaryStructure,
};