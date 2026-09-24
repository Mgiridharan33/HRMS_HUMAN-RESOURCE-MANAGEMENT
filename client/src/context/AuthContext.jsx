import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import api from "../services/api";


/*
=====================================================
AUTH CONTEXT
=====================================================
*/

const AuthContext = createContext(null);


/*
=====================================================
AUTH PROVIDER
=====================================================
*/

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);


    /*
    =================================================
    NORMALIZE USER
    =================================================
    */

    const normalizeUser = (userData) => {

        if (!userData) {
            return null;
        }


        return {

            ...userData,

            firstName:
                userData.firstName || "",

            lastName:
                userData.lastName || "",

            email:
                userData.email || "",

            phone:
                userData.phone || "",

            address:
                userData.address || "",

            profileImage:
                userData.profileImage || "",

            role:
                userData.role ||
                userData.userType ||
                "",

        };

    };


    /*
    =================================================
    GET CURRENT USER
    =================================================
    */

    const getCurrentUser = async () => {

        try {

            /*
            =========================================
            CALL BACKEND
            =========================================
            */

            const response =
                await api.get(
                    "/auth/me"
                );


            /*
            =========================================
            GET USER
            =========================================
            */

            const currentUser =
                response?.data?.user ||
                response?.data?.employee;


            /*
            =========================================
            IF NO USER
            =========================================
            */

            if (!currentUser) {

                setUser(null);

                return null;

            }


            /*
            =========================================
            NORMALIZE USER
            =========================================
            */

            const normalizedUser =
                normalizeUser(
                    currentUser
                );


            /*
            =========================================
            SET USER
            =========================================
            */

            setUser(
                normalizedUser
            );


            return normalizedUser;

        } catch (error) {

            console.error(
                "GET CURRENT USER ERROR:",
                error
            );


            /*
            =========================================
            AUTHENTICATION FAILED
            =========================================
            */

            if (
                error?.response?.status === 401 ||
                error?.response?.status === 403
            ) {

                setUser(null);

            }


            return null;

        } finally {

            /*
            =========================================
            AUTH CHECK FINISHED
            =========================================
            */

            setLoading(false);

        }

    };


    /*
    =================================================
    INITIAL AUTH CHECK
    =================================================
    */

    useEffect(() => {

        let mounted = true;


        const initializeAuth = async () => {

            try {

                const response =
                    await api.get(
                        "/auth/me"
                    );


                if (!mounted) {
                    return;
                }


                const currentUser =
                    response?.data?.user ||
                    response?.data?.employee;


                if (currentUser) {

                    const normalizedUser =
                        normalizeUser(
                            currentUser
                        );


                    setUser(
                        normalizedUser
                    );

                } else {

                    setUser(null);

                }

            } catch (error) {

                if (mounted) {

                    console.error(
                        "AUTH INITIALIZATION ERROR:",
                        error
                    );

                    setUser(null);

                }

            } finally {

                if (mounted) {

                    setLoading(false);

                }

            }

        };


        initializeAuth();


        return () => {

            mounted = false;

        };

    }, []);


    /*
    =================================================
    LOGIN
    =================================================
    */

    const login = async (
        email,
        password
    ) => {

        try {

            const response =
                await api.post(
                    "/auth/login",
                    {
                        email,
                        password,
                    }
                );


            /*
            =========================================
            GET USER
            =========================================
            */

            const loggedInUser =
                response?.data?.user ||
                response?.data?.employee;


            /*
            =========================================
            SAVE USER IN CONTEXT
            =========================================
            */

            if (loggedInUser) {

                const normalizedUser =
                    normalizeUser(
                        loggedInUser
                    );


                setUser(
                    normalizedUser
                );

            }


            return response.data;

        } catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );

            throw error;

        }

    };


    /*
    =================================================
    LOGOUT
    =================================================
    */

    const logout = async () => {

        try {

            await api.post(
                "/auth/logout"
            );

        } catch (error) {

            console.error(
                "LOGOUT ERROR:",
                error
            );

        } finally {

            setUser(null);

        }

    };


    /*
    =================================================
    UPDATE USER
    =================================================
    */

    const updateUser = (updatedUser) => {

        if (!updatedUser) {
            return;
        }


        const normalizedUser =
            normalizeUser(
                updatedUser
            );


        setUser(
            normalizedUser
        );

    };


    /*
    =================================================
    CONTEXT VALUE
    =================================================
    */

    const contextValue = {

        user,

        setUser,

        updateUser,

        login,

        logout,

        loading,

        getCurrentUser,

        isAuthenticated:
            Boolean(user),

    };


    /*
    =================================================
    PROVIDER
    =================================================
    */

    return (

        <AuthContext.Provider
            value={contextValue}
        >

            {children}

        </AuthContext.Provider>

    );

};


/*
=====================================================
USE AUTH
=====================================================
*/

export const useAuth = () => {

    const context =
        useContext(
            AuthContext
        );


    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        );

    }


    return context;

};