const express =
    require("express");

const router =
    express.Router();


// =========================================================
// AUTH
// =========================================================

const auth =
    require("../middleware/auth");


// =========================================================
// CONTROLLER
// =========================================================

const {

    getAllApplications,

    getApplicationById,

    sendApplicationToHR,

    removeApplicationFromHR,

    getHRUsers,

    updateApplicationStatus,

    updateApplicationNotes,

    deleteApplication,

    getApplicationSummary,

} =
    require(
        "../controllers/adminJobApplicationController"
    );


// =========================================================
// SUPER ADMIN GUARD
// =========================================================

const superAdminOnly =
    (req, res, next) => {

        const role =
            String(
                req.userType ||
                req.user?.role ||
                ""
            )
                .trim()
                .toUpperCase();


        if (
            role !== "SUPER_ADMIN" &&
            role !== "SUPERADMIN"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Super Admin access required",

            });

        }


        next();

    };


// =========================================================
// AUTH + SUPER ADMIN
// =========================================================

router.use(
    auth
);

router.use(
    superAdminOnly
);


// =========================================================
// STATIC ROUTES FIRST
// =========================================================


// GET HR USERS

router.get(
    "/hr-users",
    getHRUsers
);


// GET SUMMARY

router.get(
    "/summary",
    getApplicationSummary
);


// =========================================================
// APPLICATION LIST
// =========================================================

router.get(
    "/",
    getAllApplications
);


// =========================================================
// SEND TO ALL HR
//
// PATCH
// /api/admin/job-applications/:id/send-to-hr
// =========================================================

router.patch(
    "/:id/send-to-hr",
    sendApplicationToHR
);


// =========================================================
// REMOVE FROM HR QUEUE
//
// PATCH
// /api/admin/job-applications/:id/remove-from-hr
// =========================================================

router.patch(
    "/:id/remove-from-hr",
    removeApplicationFromHR
);


// =========================================================
// UPDATE STATUS
// =========================================================

router.patch(
    "/:id/status",
    updateApplicationStatus
);


// =========================================================
// UPDATE NOTES
// =========================================================

router.patch(
    "/:id/notes",
    updateApplicationNotes
);


// =========================================================
// DELETE
// =========================================================

router.delete(
    "/:id",
    deleteApplication
);


// =========================================================
// GET SINGLE APPLICATION
//
// KEEP THIS AFTER STATIC ROUTES
// =========================================================

router.get(
    "/:id",
    getApplicationById
);


// =========================================================
// EXPORT
// =========================================================

module.exports =
    router;