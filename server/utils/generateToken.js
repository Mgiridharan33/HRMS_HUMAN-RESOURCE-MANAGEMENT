const jwt = require("jsonwebtoken");

const generateToken = (
    id,
    role
) => {

    return jwt.sign(
        {
            id: id.toString(),

            role: role,

            userType: role,
        },

        process.env.JWT_SECRET,

        {
            expiresIn:
                "7d",
        }
    );
};


module.exports =
    generateToken;