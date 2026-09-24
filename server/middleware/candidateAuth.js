const jwt = require("jsonwebtoken");

const candidateAuth = (req, res, next) => {
    try {
        const token =
            req.cookies?.candidateToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message:
                    "Candidate authentication required",
            });
        }

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        if (
            decoded.role !== "candidate" ||
            decoded.type !== "candidate"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Candidate access only",
            });
        }

        req.candidate = decoded;

        next();
    } catch (error) {
        console.error(
            "CANDIDATE AUTH ERROR:",
            error.message
        );

        return res.status(401).json({
            success: false,
            message:
                "Invalid or expired candidate token",
        });
    }
};

module.exports = candidateAuth;