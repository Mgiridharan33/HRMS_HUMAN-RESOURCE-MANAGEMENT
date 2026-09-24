const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Candidate = require("../models/Candidate");


// =========================================================
// GENERATE CANDIDATE JWT
// =========================================================

const generateToken = (candidate) => {

    return jwt.sign(
        {
            id: candidate._id,
            role: "candidate",
            type: "candidate",
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );
};


// =========================================================
// COOKIE OPTIONS
// =========================================================

const getCookieOptions = () => {

    const isProduction =
        process.env.NODE_ENV === "production";

    return {

        httpOnly: true,

        secure: isProduction,

        sameSite:
            isProduction
                ? "none"
                : "lax",

        maxAge:
            7 * 24 * 60 * 60 * 1000,

    };
};


// =========================================================
// REGISTER CANDIDATE
// POST /api/candidates/register
// =========================================================

const registerCandidate = async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            password,
        } = req.body;


        // =====================================================
        // VALIDATION
        // =====================================================

        if (
            !name ||
            !email ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Name, email and password are required",

            });

        }


        const normalizedEmail =
            String(email)
                .trim()
                .toLowerCase();


        // =====================================================
        // CHECK EXISTING CANDIDATE
        // =====================================================

        const existingCandidate =
            await Candidate.findOne({
                email: normalizedEmail,
            });


        if (existingCandidate) {

            return res.status(409).json({

                success: false,

                message:
                    "Candidate with this email already exists",

            });

        }


        // =====================================================
        // HASH PASSWORD
        // =====================================================

        const hashedPassword =
            await bcrypt.hash(
                String(password),
                12
            );


        // =====================================================
        // CREATE CANDIDATE
        // =====================================================

        const candidate =
            await Candidate.create({

                name:
                    String(name).trim(),

                email:
                    normalizedEmail,

                phone:
                    phone
                        ? String(phone).trim()
                        : "",

                password:
                    hashedPassword,

                isActive:
                    true,

            });


        // =====================================================
        // CREATE TOKEN
        // =====================================================

        const token =
            generateToken(candidate);


        // =====================================================
        // SAVE COOKIE
        // =====================================================

        res.cookie(
            "candidateToken",
            token,
            getCookieOptions()
        );


        // =====================================================
        // RESPONSE
        // =====================================================

        return res.status(201).json({

            success: true,

            message:
                "Candidate registered successfully",

            candidate: {

                id:
                    candidate._id,

                name:
                    candidate.name,

                email:
                    candidate.email,

                phone:
                    candidate.phone,

                profileImage:
                    candidate.profileImage,

                resume:
                    candidate.resume,

                skills:
                    candidate.skills,

                education:
                    candidate.education,

                experience:
                    candidate.experience,

                address:
                    candidate.address,

                isActive:
                    candidate.isActive,

            },

        });

    } catch (error) {

        console.error(
            "REGISTER CANDIDATE ERROR:",
            error
        );


        if (
            error.code === 11000
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "Candidate with this email already exists",

            });

        }


        return res.status(500).json({

            success: false,

            message:
                "Failed to register candidate",

            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,

        });

    }

};


// =========================================================
// LOGIN CANDIDATE
// POST /api/candidates/login
// =========================================================

const loginCandidate = async (req, res) => {

    try {

        const {
            email,
            password,
        } = req.body;


        // =====================================================
        // VALIDATION
        // =====================================================

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
            String(email)
                .trim()
                .toLowerCase();


        // =====================================================
        // FIND CANDIDATE
        // =====================================================

        const candidate =
            await Candidate.findOne({
                email: normalizedEmail,
            });


        if (!candidate) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password",

            });

        }


        // =====================================================
        // CHECK ACTIVE STATUS
        //
        // IMPORTANT:
        // Candidate schema uses isActive.
        // It does NOT use status.
        // =====================================================

        if (
            candidate.isActive === false
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Candidate account is inactive",

            });

        }


        // =====================================================
        // CHECK PASSWORD
        // =====================================================

        const isPasswordValid =
            await bcrypt.compare(
                String(password),
                candidate.password
            );


        if (!isPasswordValid) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password",

            });

        }


        // =====================================================
        // GENERATE TOKEN
        // =====================================================

        const token =
            generateToken(candidate);


        // =====================================================
        // SAVE COOKIE
        // =====================================================

        res.cookie(
            "candidateToken",
            token,
            getCookieOptions()
        );


        // =====================================================
        // RESPONSE
        // =====================================================

        return res.status(200).json({

            success: true,

            message:
                "Candidate login successful",

            candidate: {

                id:
                    candidate._id,

                name:
                    candidate.name,

                email:
                    candidate.email,

                phone:
                    candidate.phone,

                profileImage:
                    candidate.profileImage,

                resume:
                    candidate.resume,

                skills:
                    candidate.skills,

                education:
                    candidate.education,

                experience:
                    candidate.experience,

                address:
                    candidate.address,

                isActive:
                    candidate.isActive,

            },

        });

    } catch (error) {

        console.error(
            "LOGIN CANDIDATE ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to login candidate",

            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,

        });

    }

};


// =========================================================
// GET CURRENT CANDIDATE
// GET /api/candidates/me
// =========================================================

const getCurrentCandidate = async (
    req,
    res
) => {

    try {

        if (!req.candidate?.id) {

            return res.status(401).json({

                success: false,

                message:
                    "Candidate authentication required",

            });

        }


        const candidate =
            await Candidate.findById(
                req.candidate.id
            )
                .select("-password");


        if (!candidate) {

            return res.status(404).json({

                success: false,

                message:
                    "Candidate not found",

            });

        }


        if (
            candidate.isActive === false
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Candidate account is inactive",

            });

        }


        return res.status(200).json({

            success: true,

            candidate,

        });

    } catch (error) {

        console.error(
            "GET CURRENT CANDIDATE ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to get current candidate",

            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,

        });

    }

};


// =========================================================
// UPDATE CANDIDATE PROFILE
// PUT /api/candidates/profile
// =========================================================

const updateCandidateProfile = async (
    req,
    res
) => {

    try {

        const candidateId =
            req.candidate?.id;


        if (!candidateId) {

            return res.status(401).json({

                success: false,

                message:
                    "Candidate authentication required",

            });

        }


        const candidate =
            await Candidate.findById(
                candidateId
            );


        if (!candidate) {

            return res.status(404).json({

                success: false,

                message:
                    "Candidate not found",

            });

        }


        // =====================================================
        // NAME
        // =====================================================

        if (
            req.body.name !== undefined
        ) {

            const name =
                String(req.body.name)
                    .trim();


            if (!name) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Name cannot be empty",

                });

            }


            candidate.name =
                name;

        }


        // =====================================================
        // EMAIL
        // =====================================================

        if (
            req.body.email !== undefined
        ) {

            const normalizedEmail =
                String(req.body.email)
                    .trim()
                    .toLowerCase();


            if (!normalizedEmail) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email cannot be empty",

                });

            }


            const existingCandidate =
                await Candidate.findOne({

                    email:
                        normalizedEmail,

                    _id: {
                        $ne:
                            candidate._id,
                    },

                });


            if (existingCandidate) {

                return res.status(409).json({

                    success: false,

                    message:
                        "Another candidate already uses this email",

                });

            }


            candidate.email =
                normalizedEmail;

        }


        // =====================================================
        // PHONE
        // =====================================================

        if (
            req.body.phone !== undefined
        ) {

            candidate.phone =
                String(req.body.phone)
                    .trim();

        }


        // =====================================================
        // ADDRESS
        // =====================================================

        if (
            req.body.address !== undefined
        ) {

            candidate.address =
                String(req.body.address)
                    .trim();

        }


        // =====================================================
        // PROFILE IMAGE
        // =====================================================

        if (
            req.body.profileImage !== undefined
        ) {

            candidate.profileImage =
                String(
                    req.body.profileImage || ""
                );

        }


        // =====================================================
        // RESUME
        // =====================================================

        if (
            req.body.resume !== undefined
        ) {

            candidate.resume =
                String(
                    req.body.resume || ""
                );

        }


        // =====================================================
        // SKILLS
        // =====================================================

        if (
            req.body.skills !== undefined
        ) {

            candidate.skills =
                Array.isArray(
                    req.body.skills
                )
                    ? req.body.skills
                        .map(
                            item =>
                                String(item).trim()
                        )
                        .filter(Boolean)

                    : [];

        }


        // =====================================================
        // EDUCATION
        // =====================================================

        if (
            req.body.education !== undefined
        ) {

            candidate.education =
                String(
                    req.body.education || ""
                ).trim();

        }


        // =====================================================
        // EXPERIENCE
        // =====================================================

        if (
            req.body.experience !== undefined
        ) {

            candidate.experience =
                String(
                    req.body.experience || ""
                ).trim();

        }


        // =====================================================
        // SAVE
        // =====================================================

        await candidate.save();


        // =====================================================
        // RESPONSE
        // =====================================================

        return res.status(200).json({

            success: true,

            message:
                "Candidate profile updated successfully",

            candidate: {

                id:
                    candidate._id,

                name:
                    candidate.name,

                email:
                    candidate.email,

                phone:
                    candidate.phone,

                address:
                    candidate.address,

                profileImage:
                    candidate.profileImage,

                resume:
                    candidate.resume,

                skills:
                    candidate.skills,

                education:
                    candidate.education,

                experience:
                    candidate.experience,

                isActive:
                    candidate.isActive,

            },

        });

    } catch (error) {

        console.error(
            "UPDATE CANDIDATE PROFILE ERROR:",
            error
        );


        if (
            error.code === 11000
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "Candidate email already exists",

            });

        }


        return res.status(500).json({

            success: false,

            message:
                "Failed to update candidate profile",

            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,

        });

    }

};


// =========================================================
// LOGOUT CANDIDATE
// POST /api/candidates/logout
// =========================================================

const logoutCandidate = async (
    req,
    res
) => {

    try {

        const options =
            getCookieOptions();


        delete options.maxAge;


        res.clearCookie(
            "candidateToken",
            options
        );


        return res.status(200).json({

            success: true,

            message:
                "Candidate logged out successfully",

        });

    } catch (error) {

        console.error(
            "LOGOUT CANDIDATE ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to logout candidate",

        });

    }

};


// =========================================================
// EXPORTS
// =========================================================

module.exports = {

    registerCandidate,

    loginCandidate,

    getCurrentCandidate,

    updateCandidateProfile,

    logoutCandidate,

};