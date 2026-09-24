const Employee = require("../models/Employee");
const User = require("../models/User");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const hasValidEmployeeId = (id) =>
    mongoose.Types.ObjectId.isValid(id);


// =====================================================
// CREATE EMPLOYEE
// POST /api/employees
// =====================================================

const createEmployee = async (req, res) => {

    try {

        const {
            employeeId,
            firstName,
            lastName,
            email,
            phone,
            dateOfBirth,
            gender,
            address,
            department,
            designation,
            joiningDate,
            employmentType,
            reportingHR,
            password,
            profileImage,
        } = req.body;


        // =================================================
        // VALIDATION
        // =================================================

        if (
            !employeeId ||
            !firstName ||
            !lastName ||
            !email ||
            !password
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Employee ID, first name, last name, email and password are required",
            });
        }


        // =================================================
        // NORMALIZE
        // =================================================

        const normalizedEmail =
            String(email)
                .trim()
                .toLowerCase();

        const normalizedEmployeeId =
            String(employeeId)
                .trim();


        const normalizedFirstName =
            String(firstName)
                .trim();

        const normalizedLastName =
            String(lastName)
                .trim();


        // =================================================
        // CHECK EMPLOYEE ID
        // =================================================

        const existingEmployeeId =
            await Employee.findOne({
                employeeId:
                    normalizedEmployeeId,
            });


        if (existingEmployeeId) {

            return res.status(409).json({
                success: false,
                message:
                    "Employee ID already exists",
            });
        }


        // =================================================
        // CHECK EMPLOYEE EMAIL
        // =================================================

        const existingEmployee =
            await Employee.findOne({
                email:
                    normalizedEmail,
            });


        if (existingEmployee) {

            return res.status(409).json({
                success: false,
                message:
                    "Employee email already exists",
            });
        }


        // =================================================
        // CHECK USER EMAIL
        //
        // Employees are stored in Employee collection.
        // HR / SUPER_ADMIN are stored in User collection.
        // =================================================

        const existingUser =
            await User.findOne({
                email:
                    normalizedEmail,
            });


        if (existingUser) {

            return res.status(409).json({
                success: false,
                message:
                    "This email is already registered to another account",
            });
        }


        // =================================================
        // VALIDATE REPORTING HR
        // =================================================

        const requesterRole = String(
            req.userType || req.user?.role || ""
        ).trim().toUpperCase();

        let hrId = null;

        if (requesterRole === "HR") {
            if (!req.user?._id) {
                return res.status(401).json({
                    success: false,
                    message: "HR authentication data not found",
                });
            }

            hrId = req.user._id;
        }


        if (requesterRole !== "HR" && reportingHR) {

            if (!mongoose.Types.ObjectId.isValid(reportingHR)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid reporting HR ID",
                });
            }

            const hr =
                await User.findOne({
                    _id: reportingHR,
                    role: "HR",
                });


            if (!hr) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Selected HR does not exist",
                });
            }


            if (!hr.isActive) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Selected HR account is inactive",
                });
            }


            hrId = hr._id;
        }


        // =================================================
        // HASH PASSWORD
        // =================================================

        const hashedPassword =
            await bcrypt.hash(
                String(password),
                12
            );


        // =================================================
        // CREATE EMPLOYEE
        // =================================================

        const employee =
            await Employee.create({

                employeeId:
                    normalizedEmployeeId,

                firstName:
                    normalizedFirstName,

                lastName:
                    normalizedLastName,

                email:
                    normalizedEmail,

                phone:
                    phone || "",

                dateOfBirth:
                    dateOfBirth || null,

                gender:
                    gender || "Other",

                address:
                    address || "",

                department:
                    department || "",

                designation:
                    designation || "",

                joiningDate:
                    joiningDate || null,

                employmentType:
                    employmentType ||
                    "Full Time",

                reportingHR:
                    hrId,

                profileImage:
                    profileImage || "",

                password:
                    hashedPassword,

                role:
                    "EMPLOYEE",

                isActive:
                    true,
            });


        // =================================================
        // RESPONSE
        // =================================================

        return res.status(201).json({

            success: true,

            message:
                "Employee created successfully",

            employee: {

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
                    employee.role,

                isActive:
                    employee.isActive,
            },
        });

    } catch (error) {

        console.error(
            "CREATE EMPLOYEE ERROR:",
            error
        );


        // =================================================
        // MONGOOSE VALIDATION ERROR
        // =================================================

        if (
            error.name ===
            "ValidationError"
        ) {

            const messages =
                Object.values(
                    error.errors
                ).map(
                    (item) =>
                        item.message
                );


            return res.status(400).json({

                success: false,

                message:
                    messages.join(", "),

                error:
                    error.message,
            });
        }


        // =================================================
        // DUPLICATE KEY
        // =================================================

        if (
            error.code === 11000
        ) {

            const duplicateField =
                Object.keys(
                    error.keyPattern || {}
                )[0];


            return res.status(409).json({

                success: false,

                message:
                    `${duplicateField || "Field"} already exists`,

                error:
                    error.message,
            });
        }


        // =================================================
        // SERVER ERROR
        // =================================================

        return res.status(500).json({

            success: false,

            message:
                "Failed to create employee",

            error:
                error.message,
        });
    }
};


const updateEmployeeProfile = async (req, res) => {
    try {
        if (String(req.userType || "").toUpperCase() !== "EMPLOYEE") {
            return res.status(403).json({
                success: false,
                message: "Only employees can update their profile",
            });
        }

        const employee = await Employee.findById(req.user?._id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee profile not found",
            });
        }

        const {
            firstName,
            lastName,
            email,
            phone,
            address,
            profileImage,
        } = req.body || {};

        const normalizedEmail = String(email || "").trim().toLowerCase();

        if (!firstName?.trim() || !lastName?.trim() || !normalizedEmail) {
            return res.status(400).json({
                success: false,
                message: "First name, last name and email are required",
            });
        }

        const duplicateEmployee = await Employee.findOne({
            email: normalizedEmail,
            _id: { $ne: employee._id },
        });

        const duplicateUser = await User.findOne({
            email: normalizedEmail,
        });

        if (duplicateEmployee || duplicateUser) {
            return res.status(409).json({
                success: false,
                message: "This email is already registered to another account",
            });
        }

        employee.firstName = firstName.trim();
        employee.lastName = lastName.trim();
        employee.email = normalizedEmail;
        employee.phone = String(phone || "").trim();
        employee.address = String(address || "").trim();

        if (profileImage !== undefined) {
            employee.profileImage = String(profileImage || "").trim();
        }

        await employee.save();

        const employeeResponse = employee.toObject();
        delete employeeResponse.password;

        return res.json({
            success: true,
            message: "Profile updated successfully",
            employee: employeeResponse,
        });
    } catch (error) {
        console.error("UPDATE EMPLOYEE PROFILE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update employee profile",
        });
    }
};


// =====================================================
// GET ALL EMPLOYEES
// GET /api/employees
// =====================================================

const getAllEmployees = async (
    req,
    res
) => {

    try {

        const employees =
            await Employee.find()
                .select("-password")
                .populate(
                    "reportingHR",
                    "name email role"
                )
                .sort({
                    createdAt: -1,
                });


        return res.status(200).json({

            success: true,

            count:
                employees.length,

            employees,
        });

    } catch (error) {

        console.error(
            "GET EMPLOYEES ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch employees",

            error:
                error.message,
        });
    }
};


// =====================================================
// GET SINGLE EMPLOYEE
// GET /api/employees/:id
// =====================================================

const getEmployeeById = async (
    req,
    res
) => {

    try {

        if (!hasValidEmployeeId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid employee ID",
            });
        }

        const employee =
            await Employee.findById(
                req.params.id
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

            employee,
        });

    } catch (error) {

        console.error(
            "GET EMPLOYEE ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch employee",

            error:
                error.message,
        });
    }
};


// =====================================================
// UPDATE EMPLOYEE
// PUT /api/employees/:id
// =====================================================

const updateEmployee = async (
    req,
    res
) => {

    try {

        if (!hasValidEmployeeId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid employee ID",
            });
        }

        const {
            employeeId,
            firstName,
            lastName,
            email,
            phone,
            dateOfBirth,
            gender,
            address,
            department,
            designation,
            joiningDate,
            employmentType,
            reportingHR,
            password,
            profileImage,
        } = req.body;


        const employee =
            await Employee.findById(
                req.params.id
            );


        if (!employee) {

            return res.status(404).json({

                success: false,

                message:
                    "Employee not found",
            });
        }


        // =================================================
        // EMPLOYEE ID
        // =================================================

        if (
            employeeId !== undefined &&
            employeeId.trim() !==
                employee.employeeId
        ) {

            const existingId =
                await Employee.findOne({

                    employeeId:
                        employeeId.trim(),

                    _id: {
                        $ne:
                            req.params.id,
                    },
                });


            if (existingId) {

                return res.status(409).json({

                    success: false,

                    message:
                        "Employee ID already exists",
                });
            }


            employee.employeeId =
                employeeId.trim();
        }


        // =================================================
        // EMAIL
        // =================================================

        if (email !== undefined) {

            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();


            const existingEmail =
                await Employee.findOne({

                    email:
                        normalizedEmail,

                    _id: {
                        $ne:
                            req.params.id,
                    },
                });


            if (existingEmail) {

                return res.status(409).json({

                    success: false,

                    message:
                        "Employee email already exists",
                });
            }


            const existingUser =
                await User.findOne({

                    email:
                        normalizedEmail,

                });


            if (
                existingUser &&
                String(existingUser._id) !==
                    String(employee.user)
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "This email is already registered",
                });
            }


            employee.email =
                normalizedEmail;
        }


        // =================================================
        // BASIC INFORMATION
        // =================================================

        if (
            firstName !== undefined
        ) {

            employee.firstName =
                firstName.trim();
        }


        if (
            lastName !== undefined
        ) {

            employee.lastName =
                lastName.trim();
        }


        if (
            phone !== undefined
        ) {

            employee.phone =
                phone;
        }


        if (
            dateOfBirth !== undefined
        ) {

            employee.dateOfBirth =
                dateOfBirth || null;
        }


        if (
            gender !== undefined
        ) {

            employee.gender =
                gender;
        }


        if (
            address !== undefined
        ) {

            employee.address =
                address;
        }


        // =================================================
        // JOB
        // =================================================

        if (
            department !== undefined
        ) {

            employee.department =
                department;
        }


        if (
            designation !== undefined
        ) {

            employee.designation =
                designation;
        }


        if (
            joiningDate !== undefined
        ) {

            employee.joiningDate =
                joiningDate || null;
        }


        if (
            employmentType !== undefined
        ) {

            employee.employmentType =
                employmentType;
        }


        // =================================================
        // REPORTING HR
        // =================================================

        const requesterRole = String(
            req.userType || req.user?.role || ""
        ).trim().toUpperCase();

        if (
            reportingHR !== undefined &&
            requesterRole === "SUPER_ADMIN"
        ) {

            if (!reportingHR) {

                employee.reportingHR =
                    null;

            } else {

                if (!mongoose.Types.ObjectId.isValid(reportingHR)) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid reporting HR ID",
                    });
                }

                const hr =
                    await User.findOne({

                        _id:
                            reportingHR,

                        role:
                            "HR",
                    });


                if (!hr) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Selected HR does not exist",
                    });
                }


                if (!hr.isActive) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Selected HR account is inactive",
                    });
                }


                employee.reportingHR =
                    hr._id;
            }
        }


        // =================================================
        // PROFILE IMAGE
        // =================================================

        if (
            profileImage !== undefined
        ) {

            employee.profileImage =
                profileImage;
        }


        // =================================================
        // PASSWORD
        // =================================================

        if (
            password &&
            password.trim()
        ) {

            employee.password =
                await bcrypt.hash(
                    password.trim(),
                    12
                );
        }


        await employee.save();


        // =================================================
        // RESPONSE
        // =================================================

        const updatedEmployee =
            await Employee.findById(
                employee._id
            )
                .select("-password")
                .populate(
                    "reportingHR",
                    "name email role"
                );


        return res.status(200).json({

            success: true,

            message:
                "Employee updated successfully",

            employee:
                updatedEmployee,
        });

    } catch (error) {

        console.error(
            "UPDATE EMPLOYEE ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to update employee",

            error:
                error.message,
        });
    }
};


// =====================================================
// TOGGLE STATUS
// PATCH /api/employees/:id/status
// =====================================================

const toggleEmployeeStatus = async (
    req,
    res
) => {

    try {

        if (!hasValidEmployeeId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid employee ID",
            });
        }

        const employee =
            await Employee.findById(
                req.params.id
            );


        if (!employee) {

            return res.status(404).json({

                success: false,

                message:
                    "Employee not found",
            });
        }


        employee.isActive =
            !employee.isActive;


        await employee.save();


        return res.status(200).json({

            success: true,

            message:
                employee.isActive
                    ? "Employee activated successfully"
                    : "Employee deactivated successfully",

            isActive:
                employee.isActive,
        });

    } catch (error) {

        console.error(
            "TOGGLE EMPLOYEE STATUS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to update employee status",

            error:
                error.message,
        });
    }
};


// =====================================================
// DELETE EMPLOYEE
// DELETE /api/employees/:id
// =====================================================

const deleteEmployee = async (
    req,
    res
) => {

    try {

        if (!hasValidEmployeeId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid employee ID",
            });
        }

        const employee =
            await Employee.findByIdAndDelete(
                req.params.id
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

            message:
                "Employee deleted successfully",
        });

    } catch (error) {

        console.error(
            "DELETE EMPLOYEE ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to delete employee",

            error:
                error.message,
        });
    }
};


module.exports = {

    createEmployee,

    getAllEmployees,

    getEmployeeById,

    updateEmployee,

    toggleEmployeeStatus,

    deleteEmployee,

    updateEmployeeProfile,
};