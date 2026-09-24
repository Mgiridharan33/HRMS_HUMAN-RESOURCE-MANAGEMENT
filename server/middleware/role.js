const authorizeRoles =
    (...allowedRoles) => {

        return (
            req,
            res,
            next
        ) => {

            try {

                const userRole =
                    String(
                        req.userType ||
                        req.user?.role ||
                        ""
                    )
                        .trim()
                        .toUpperCase();


                const normalizedRoles =
                    allowedRoles.map(
                        role =>
                            String(role)
                                .trim()
                                .toUpperCase()
                    );


                if (!userRole) {

                    return res.status(403).json({

                        success: false,

                        message:
                            "User role not found.",

                    });
                }


                if (
                    !normalizedRoles.includes(
                        userRole
                    )
                ) {

                    return res.status(403).json({

                        success: false,

                        message:
                            "You are not authorized to perform this action.",

                    });
                }


                next();

            } catch (error) {

                console.error(
                    "ROLE AUTHORIZATION ERROR:",
                    error
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Role authorization failed.",

                });
            }
        };
    };


module.exports =
    authorizeRoles;