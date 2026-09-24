import {
    Navigate,
    useLocation,
} from "react-router-dom";

import {
    useAuth,
} from "../context/AuthContext";


const RoleRoute = ({
    allowedRoles = [],
    children,
}) => {

    const {
        user,
        loading,
    } = useAuth();


    const location =
        useLocation();


    /*
    =================================================
    WAIT FOR AUTH CHECK
    =================================================
    */

    if (loading) {

        return (

            <div className="route-loading-state">

                Loading...

            </div>

        );

    }


    /*
    =================================================
    NOT AUTHENTICATED
    =================================================
    */

    if (!user) {

        return (

            <Navigate
                to="/login"
                replace
                state={{
                    from: location,
                }}
            />

        );

    }


    /*
    =================================================
    USER ROLE
    =================================================
    */

    const userRole =
        String(
            user?.role ||
            user?.userType ||
            ""
        )
        .trim()
        .toUpperCase();


    /*
    =================================================
    ALLOWED ROLES
    =================================================
    */

    const normalizedAllowedRoles =
        allowedRoles.map(
            (role) =>
                String(role)
                    .trim()
                    .toUpperCase()
        );


    /*
    =================================================
    CHECK ROLE
    =================================================
    */

    if (
        !normalizedAllowedRoles.includes(
            userRole
        )
    ) {

        return (

            <Navigate
                to="/unauthorized"
                replace
            />

        );

    }


    /*
    =================================================
    AUTHORIZED
    =================================================
    */

    return children;

};


export default RoleRoute;