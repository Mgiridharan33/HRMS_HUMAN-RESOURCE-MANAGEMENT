const express = require("express");

const router = express.Router();

const {
    createHR,
    getAllHR,
    getHRById,
    updateHR,
    toggleHRStatus,
    deleteHR,
} = require("../controllers/hrController");

const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");


/*
=====================================================
SUPER ADMIN HR MANAGEMENT
=====================================================
*/

router.use(auth);

router.use(
    authorizeRoles("SUPER_ADMIN")
);


/*
CREATE HR
POST /api/hr
*/

router.post("/", createHR);


/*
GET ALL HR
GET /api/hr
*/

router.get("/", getAllHR);


/*
GET SINGLE HR
GET /api/hr/:id
*/

router.get("/:id", getHRById);


/*
UPDATE HR
PUT /api/hr/:id
*/

router.put("/:id", updateHR);


/*
ACTIVATE / DEACTIVATE HR
PATCH /api/hr/:id/status
*/

router.patch(
    "/:id/status",
    toggleHRStatus
);


/*
DELETE HR
DELETE /api/hr/:id
*/

router.delete("/:id", deleteHR);


module.exports = router;