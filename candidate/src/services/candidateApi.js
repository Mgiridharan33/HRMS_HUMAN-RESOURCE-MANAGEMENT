import axios from "axios";


// =========================================================
// API URL
// =========================================================
//
// .env:
//
// VITE_API_URL=http://localhost:5000/api
//
// Therefore:
//
// /candidates
// becomes:
//
// http://localhost:5000/api/candidates
//
// =========================================================

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";


// =========================================================
// CANDIDATE API INSTANCE
// =========================================================

const candidateApi = axios.create({

    baseURL:
        `${API_URL}/candidates`,

    // IMPORTANT
    // Sends the candidate authentication
    // cookie to the HRMS backend.
    withCredentials: true,

    headers: {
        "Content-Type": "application/json",
    },

});


// =========================================================
// REGISTER CANDIDATE
// POST /api/candidates/register
// =========================================================

export const registerCandidate = async (
    data
) => {

    try {

        const response =
            await candidateApi.post(
                "/register",
                data
            );

        return response.data;

    } catch (error) {

        console.error(
            "CANDIDATE REGISTER ERROR:",
            error
        );

        throw error;

    }

};


// =========================================================
// LOGIN CANDIDATE
// POST /api/candidates/login
// =========================================================

export const loginCandidate = async (
    data
) => {

    try {

        const response =
            await candidateApi.post(
                "/login",
                data
            );

        return response.data;

    } catch (error) {

        console.error(
            "CANDIDATE LOGIN ERROR:",
            error
        );

        throw error;

    }

};


// =========================================================
// GET CURRENT CANDIDATE
// GET /api/candidates/me
// =========================================================

export const getCurrentCandidate =
    async () => {

        try {

            const response =
                await candidateApi.get(
                    "/me"
                );

            return response.data;

        } catch (error) {

            console.error(
                "GET CURRENT CANDIDATE ERROR:",
                error
            );

            throw error;

        }

    };


// =========================================================
// UPDATE CANDIDATE PROFILE
// PUT /api/candidates/profile
// =========================================================
//
// Sends:
//
// name
// email
// phone
// address
// profileImage
// resume
// skills
// education
// experience
//
// Cloudinary files are uploaded from the frontend.
// Only their URLs are sent here.
// =========================================================

export const updateCandidateProfile =
    async (
        data
    ) => {

        try {

            const response =
                await candidateApi.put(
                    "/profile",
                    data
                );

            return response.data;

        } catch (error) {

            console.error(
                "UPDATE CANDIDATE PROFILE ERROR:",
                error
            );

            throw error;

        }

    };


// =========================================================
// LOGOUT CANDIDATE
// POST /api/candidates/logout
// =========================================================

export const logoutCandidate =
    async () => {

        try {

            const response =
                await candidateApi.post(
                    "/logout"
                );

            return response.data;

        } catch (error) {

            console.error(
                "CANDIDATE LOGOUT ERROR:",
                error
            );

            throw error;

        }

    };


// =========================================================
// DEFAULT EXPORT
// =========================================================

export default candidateApi;