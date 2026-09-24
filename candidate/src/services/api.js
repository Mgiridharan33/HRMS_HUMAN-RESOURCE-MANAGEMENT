import axios from "axios";


// =========================================================
// API BASE URL
// =========================================================
//
// .env should contain:
//
// VITE_API_URL=http://localhost:5000/api
//
// IMPORTANT:
// Do NOT add /api again in individual API files.
//
// Example:
//
// api.get("/jobs")
//
// becomes:
//
// http://localhost:5000/api/jobs
// =========================================================

const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";


// =========================================================
// AXIOS INSTANCE
// =========================================================

const api = axios.create({

    baseURL: API_BASE_URL,

    withCredentials: true,

    headers: {
        "Content-Type": "application/json",
    },

});


// =========================================================
// REQUEST INTERCEPTOR
// =========================================================
//
// Candidate authentication uses the
// HttpOnly `candidateToken` cookie.
//
// Therefore we do NOT manually add a JWT
// Authorization header here.
// =========================================================

api.interceptors.request.use(

    (config) => {

        return config;

    },

    (error) => {

        return Promise.reject(error);

    }

);


// =========================================================
// RESPONSE INTERCEPTOR
// =========================================================

api.interceptors.response.use(

    (response) => {

        return response;

    },

    (error) => {

        // -----------------------------------------------------
        // Authentication errors
        // -----------------------------------------------------

        if (
            error?.response?.status === 401
        ) {

            console.warn(
                "Candidate authentication required."
            );

        }


        return Promise.reject(error);

    }

);


export default api;