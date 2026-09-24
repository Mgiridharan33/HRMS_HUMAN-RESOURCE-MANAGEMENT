const express = require("express");

const protect = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");

const router = express.Router();

router.get(
    "/dashboard",
    protect,
    authorizeRoles("SUPER_ADMIN"),
    (req, res) => {
        res.json({
            success: true,
            message: "Welcome Super Admin",
            user: req.user,
        });
    }
);

module.exports = router;