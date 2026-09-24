import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    getCurrentCandidate,
    loginCandidate,
    logoutCandidate,
} from "../services/candidateApi";


const CandidateAuthContext =
    createContext(null);


export const CandidateAuthProvider = ({
    children,
}) => {
    const [candidate, setCandidate] =
        useState(null);

    const [loading, setLoading] =
        useState(true);


    // =====================================================
    // CHECK AUTH
    // =====================================================

    const checkAuth = async () => {
        try {
            const response =
                await getCurrentCandidate();

            if (response?.success) {
                setCandidate(
                    response.candidate
                );
            } else {
                setCandidate(null);
            }
        } catch (error) {
            setCandidate(null);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        checkAuth();
    }, []);


    // =====================================================
    // LOGIN
    // =====================================================

    const login = async (
        email,
        password
    ) => {
        const response =
            await loginCandidate({
                email,
                password,
            });

        if (response?.success) {
            setCandidate(
                response.candidate
            );
        }

        return response;
    };


    // =====================================================
    // LOGOUT
    // =====================================================

    const logout = async () => {
        try {
            await logoutCandidate();
        } catch (error) {
            console.error(
                "Candidate logout error:",
                error
            );
        } finally {
            setCandidate(null);
        }
    };


    const value = {
        candidate,
        loading,
        isAuthenticated:
            Boolean(candidate),
        login,
        logout,
        checkAuth,
    };


    return (
        <CandidateAuthContext.Provider
            value={value}
        >
            {children}
        </CandidateAuthContext.Provider>
    );
};


// =========================================================
// HOOK
// =========================================================

export const useCandidateAuth = () => {
    const context =
        useContext(
            CandidateAuthContext
        );

    if (!context) {
        throw new Error(
            "useCandidateAuth must be used inside CandidateAuthProvider"
        );
    }

    return context;
};