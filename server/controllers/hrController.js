const User = require("../models/User");
const bcrypt = require("bcryptjs");

/*
=====================================================
CREATE HR
POST /api/hr
=====================================================
*/

const createHR = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            password,
            department,
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, email and password are required",
            });
        }

        const existingUser = await User.findOne({
            email: email.trim().toLowerCase(),
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            12
        );

        const hr = await User.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone || "",
            password: hashedPassword,
            role: "HR",
            department: department || "",
            isActive: true,
        });

        return res.status(201).json({
            success: true,
            message: "HR created successfully",
            hr: {
                id: hr._id,
                name: hr.name,
                email: hr.email,
                phone: hr.phone,
                department: hr.department,
                role: hr.role,
                isActive: hr.isActive,
            },
        });

    } catch (error) {
        console.error("CREATE HR ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create HR",
            error: error.message,
        });
    }
};


/*
=====================================================
GET ALL HR
GET /api/hr
=====================================================
*/

const getAllHR = async (req, res) => {
    try {
        const hrList = await User.find({
            role: "HR",
        })
            .select("-password")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: hrList.length,
            hr: hrList,
        });

    } catch (error) {
        console.error("GET HR ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch HR",
            error: error.message,
        });
    }
};


/*
=====================================================
GET SINGLE HR
GET /api/hr/:id
=====================================================
*/

const getHRById = async (req, res) => {
    try {
        const hr = await User.findOne({
            _id: req.params.id,
            role: "HR",
        }).select("-password");

        if (!hr) {
            return res.status(404).json({
                success: false,
                message: "HR not found",
            });
        }

        return res.status(200).json({
            success: true,
            hr,
        });

    } catch (error) {
        console.error("GET HR BY ID ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch HR",
            error: error.message,
        });
    }
};


/*
=====================================================
UPDATE HR
PUT /api/hr/:id
=====================================================
*/

const updateHR = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            password,
            department,
        } = req.body;

        const hr = await User.findOne({
            _id: req.params.id,
            role: "HR",
        });

        if (!hr) {
            return res.status(404).json({
                success: false,
                message: "HR not found",
            });
        }

        if (email) {
            const existingUser = await User.findOne({
                email: email.trim().toLowerCase(),
                _id: {
                    $ne: req.params.id,
                },
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "Email already exists",
                });
            }

            hr.email = email.trim().toLowerCase();
        }

        if (name !== undefined) {
            hr.name = name.trim();
        }

        if (phone !== undefined) {
            hr.phone = phone;
        }

        if (department !== undefined) {
            hr.department = department;
        }

        if (password) {
            hr.password = await bcrypt.hash(
                password,
                12
            );
        }

        await hr.save();

        return res.status(200).json({
            success: true,
            message: "HR updated successfully",
            hr: {
                id: hr._id,
                name: hr.name,
                email: hr.email,
                phone: hr.phone,
                department: hr.department,
                role: hr.role,
                isActive: hr.isActive,
            },
        });

    } catch (error) {
        console.error("UPDATE HR ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update HR",
            error: error.message,
        });
    }
};


/*
=====================================================
TOGGLE HR STATUS
PATCH /api/hr/:id/status
=====================================================
*/

const toggleHRStatus = async (req, res) => {
    try {
        const hr = await User.findOne({
            _id: req.params.id,
            role: "HR",
        });

        if (!hr) {
            return res.status(404).json({
                success: false,
                message: "HR not found",
            });
        }

        hr.isActive = !hr.isActive;

        await hr.save();

        return res.status(200).json({
            success: true,
            message: hr.isActive
                ? "HR activated successfully"
                : "HR deactivated successfully",
            isActive: hr.isActive,
        });

    } catch (error) {
        console.error(
            "TOGGLE HR STATUS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update HR status",
            error: error.message,
        });
    }
};


/*
=====================================================
DELETE HR
DELETE /api/hr/:id
=====================================================
*/

const deleteHR = async (req, res) => {
    try {
        const hr = await User.findOneAndDelete({
            _id: req.params.id,
            role: "HR",
        });

        if (!hr) {
            return res.status(404).json({
                success: false,
                message: "HR not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "HR deleted successfully",
        });

    } catch (error) {
        console.error("DELETE HR ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete HR",
            error: error.message,
        });
    }
};


module.exports = {
    createHR,
    getAllHR,
    getHRById,
    updateHR,
    toggleHRStatus,
    deleteHR,
};