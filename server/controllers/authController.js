const bcrypt = require("bcryptjs");

const User =
    require("../models/User");

const Employee =
    require("../models/Employee");

const generateToken =
    require("../utils/generateToken");


// =====================================================
// LOGIN
// POST /api/auth/login
// =====================================================

const login = async (
    req,
    res
) => {

    try {

        const {
            email,
            password,
        } = req.body;


        // =================================================
        // VALIDATION
        // =================================================

        if (
            !email ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required",
            });
        }


        const normalizedEmail =
            email
                .trim()
                .toLowerCase();


        // =================================================
        // FIRST CHECK USER
        // HR / SUPER ADMIN
        // =================================================

        const user =
            await User.findOne({
                email:
                    normalizedEmail,
            });


        if (user) {

            // ---------------------------------------------
            // ACTIVE
            // ---------------------------------------------

            if (!user.isActive) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Your account has been disabled",
                });
            }


            // ---------------------------------------------
            // PASSWORD
            // ---------------------------------------------

            const passwordMatch =
                await bcrypt.compare(
                    password,
                    user.password
                );


            if (!passwordMatch) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid email or password",
                });
            }


            // ---------------------------------------------
            // LAST LOGIN
            // ---------------------------------------------

            user.lastLogin =
                new Date();

            await user.save();


            // ---------------------------------------------
            // TOKEN
            // ---------------------------------------------

            const token =
                generateToken(
                    user._id,
                    user.role
                );


            // ---------------------------------------------
            // COOKIE
            // ---------------------------------------------

            res.cookie(
                "token",
                token,
                {
                    httpOnly: true,

                    secure:
                        process.env.NODE_ENV ===
                        "production",

                    sameSite:
                        process.env.NODE_ENV ===
                        "production"
                            ? "none"
                            : "lax",

                    maxAge:
                        7 *
                        24 *
                        60 *
                        60 *
                        1000,
                }
            );


            // ---------------------------------------------
            // RESPONSE
            // ---------------------------------------------

            return res.status(200).json({

                success: true,

                message:
                    "Login successful",

                user: {

                    id:
                        user._id,

                    name:
                        user.name,

                    email:
                        user.email,

                    role:
                        user.role,

                    profileImage:
                        user.profileImage,

                    phone:
                        user.phone,

                    isActive:
                        user.isActive,
                },
            });
        }


        // =================================================
        // CHECK EMPLOYEE
        // =================================================

        const employee =
            await Employee.findOne({
                email:
                    normalizedEmail,
            });


        if (!employee) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password",
            });
        }


        // =================================================
        // EMPLOYEE ACTIVE
        // =================================================

        if (!employee.isActive) {

            return res.status(403).json({

                success: false,

                message:
                    "Your employee account has been disabled",
            });
        }


        // =================================================
        // EMPLOYEE PASSWORD
        // =================================================

        const passwordMatch =
            await bcrypt.compare(
                password,
                employee.password
            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password",
            });
        }


        // =================================================
        // EMPLOYEE TOKEN
        // =================================================

        const token =
            generateToken(
                employee._id,
                "EMPLOYEE"
            );


        // =================================================
        // COOKIE
        // =================================================

        res.cookie(
            "token",
            token,
            {
                httpOnly: true,

                secure:
                    process.env.NODE_ENV ===
                    "production",

                sameSite:
                    process.env.NODE_ENV ===
                    "production"
                        ? "none"
                        : "lax",

                maxAge:
                    7 *
                    24 *
                    60 *
                    60 *
                    1000,
            }
        );


        // =================================================
        // EMPLOYEE RESPONSE
        // =================================================

        return res.status(200).json({

            success: true,

            message:
                "Employee login successful",

            user: {

                id:
                    employee._id,

                employeeId:
                    employee.employeeId,

                firstName:
                    employee.firstName,

                lastName:
                    employee.lastName,

                name:
                    `${employee.firstName} ${employee.lastName}`.trim(),

                email:
                    employee.email,

                phone:
                    employee.phone,

                dateOfBirth:
                    employee.dateOfBirth,

                gender:
                    employee.gender,

                address:
                    employee.address,

                department:
                    employee.department,

                designation:
                    employee.designation,

                joiningDate:
                    employee.joiningDate,

                employmentType:
                    employee.employmentType,

                reportingHR:
                    employee.reportingHR,

                profileImage:
                    employee.profileImage,

                role:
                    "EMPLOYEE",

                isActive:
                    employee.isActive,
            },
        });

    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error",

            error:
                error.message,
        });
    }
};


// =====================================================
// LOGOUT
// POST /api/auth/logout
// =====================================================

const logout = async (
    req,
    res
) => {

    try {

        res.clearCookie(
            "token",
            {
                httpOnly: true,

                secure:
                    process.env.NODE_ENV ===
                    "production",

                sameSite:
                    process.env.NODE_ENV ===
                    "production"
                        ? "none"
                        : "lax",
            }
        );


        return res.status(200).json({

            success: true,

            message:
                "Logout successful",
        });

    } catch (error) {

        console.error(
            "LOGOUT ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Logout failed",
        });
    }
};


// =====================================================
// GET CURRENT USER
// GET /api/auth/me
// =====================================================

const getMe = async (
    req,
    res
) => {

    try {

        if (!req.user) {

            return res.status(401).json({

                success: false,

                message:
                    "Not authenticated",
            });
        }


        // =================================================
        // EMPLOYEE
        // =================================================

        if (
            req.userType ===
            "EMPLOYEE"
        ) {

            const employee =
                await Employee.findById(
                    req.user._id
                )
                    .select("-password")
                    .populate(
                        "reportingHR",
                        "name email role"
                    );


            if (!employee) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Employee not found",
                });
            }


            return res.status(200).json({

                success: true,

                user: {

                    id:
                        employee._id,

                    employeeId:
                        employee.employeeId,

                    firstName:
                        employee.firstName,

                    lastName:
                        employee.lastName,

                    name:
                        `${employee.firstName} ${employee.lastName}`.trim(),

                    email:
                        employee.email,

                    phone:
                        employee.phone,

                    dateOfBirth:
                        employee.dateOfBirth,

                    gender:
                        employee.gender,

                    address:
                        employee.address,

                    department:
                        employee.department,

                    designation:
                        employee.designation,

                    joiningDate:
                        employee.joiningDate,

                    employmentType:
                        employee.employmentType,

                    reportingHR:
                        employee.reportingHR,

                    profileImage:
                        employee.profileImage,

                    role:
                        "EMPLOYEE",

                    isActive:
                        employee.isActive,
                },

                userType:
                    "EMPLOYEE",
            });
        }


        // =================================================
        // HR / SUPER ADMIN
        // =================================================

        const user =
            await User.findById(
                req.user._id
            )
                .select("-password");


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found",
            });
        }


        return res.status(200).json({

            success: true,

            user: {

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email,

                role:
                    user.role,

                profileImage:
                    user.profileImage,

                phone:
                    user.phone,

                isActive:
                    user.isActive,

                lastLogin:
                    user.lastLogin,

                createdAt:
                    user.createdAt,

                updatedAt:
                    user.updatedAt,
            },

            userType:
                req.userType,
        });

    } catch (error) {

        console.error(
            "GET ME ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error",

            error:
                error.message,
        });
    }
};


module.exports = {

    login,

    logout,

    getMe,
};