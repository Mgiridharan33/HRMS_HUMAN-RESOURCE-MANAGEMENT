const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Employee = require("../models/Employee");


const auth = async (req, res, next) => {
    try {

        // =====================================================
        // TOKEN
        // =====================================================

        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated",
            });
        }


        // =====================================================
        // VERIFY TOKEN
        // =====================================================

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        if (!decoded?.id) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token",
            });
        }


        // =====================================================
        // USER TYPE FROM TOKEN
        // =====================================================

        const userType = String(
            decoded.userType ||
            decoded.role ||
            "USER"
        )
            .trim()
            .toUpperCase();


        // =====================================================
        // EMPLOYEE
        // =====================================================

        if (userType === "EMPLOYEE") {

            const employee = await Employee.findById(
                decoded.id
            ).select("-password");

            if (!employee) {
                return res.status(401).json({
                    success: false,
                    message: "Employee account not found",
                });
            }


            if (employee.isActive === false) {
                return res.status(403).json({
                    success: false,
                    message: "Employee account is inactive",
                });
            }


            req.user = employee;

            req.userType = "EMPLOYEE";

            return next();
        }


        // =====================================================
        // USER
        // SUPER_ADMIN / HR
        // =====================================================

        const user = await User.findById(
            decoded.id
        ).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User account not found",
            });
        }


        if (user.isActive === false) {
            return res.status(403).json({
                success: false,
                message: "User account is inactive",
            });
        }


        req.user = user;

        /*
         * IMPORTANT
         *
         * User schema:
         *
         * SUPER_ADMIN
         * HR
         * EMPLOYEE
         */

        req.userType = String(
            user.role || userType
        )
            .trim()
            .toUpperCase();


        return next();

    } catch (error) {

        console.error(
            "AUTH MIDDLEWARE ERROR:",
            error
        );

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};


module.exports = auth;