import api from "./api";

/*
=========================================================
HR APTITUDE / INTERVIEW API
=========================================================

Axios baseURL already contains:

http://localhost:5000/api

Therefore DO NOT add /api here.

Correct:

/hr/aptitude-tests

NOT:

/api/hr/aptitude-tests
=========================================================
*/

const HR_APTITUDE_BASE = "/hr/aptitude-tests";


/*
=========================================================
GET TESTS RECEIVED BY HR
=========================================================
*/

export const getHRAptitudeTests = async ({
    search = "",
} = {}) => {

    const response = await api.get(
        HR_APTITUDE_BASE,
        {
            params: {
                search,
            },
        }
    );

    return response?.data;
};


/*
=========================================================
GET SINGLE APTITUDE ASSIGNMENT
=========================================================
*/

export const getHRAptitudeTestById = async (
    assignmentId
) => {

    if (!assignmentId) {
        throw new Error(
            "Aptitude assignment ID is required"
        );
    }

    const response = await api.get(
        `${HR_APTITUDE_BASE}/${assignmentId}`
    );

    return response?.data;
};


/*
=========================================================
SEND APTITUDE TEST TO CANDIDATE
=========================================================
*/

export const sendAptitudeTestToCandidate = async (
    assignmentId
) => {

    if (!assignmentId) {
        throw new Error(
            "Aptitude assignment ID is required"
        );
    }

    const response = await api.patch(
        `${HR_APTITUDE_BASE}/${assignmentId}/send`
    );

    return response?.data;
};


/*
=========================================================
GET COMPLETED TESTS / RESULTS
=========================================================
*/

export const getHRSubmittedAptitudeTests = async ({
    search = "",
} = {}) => {

    const response = await api.get(
        `${HR_APTITUDE_BASE}/results`,
        {
            params: {
                search,
            },
        }
    );

    return response?.data;
};


/*
=========================================================
GET SINGLE CANDIDATE RESULT
=========================================================
*/

export const getHRSubmittedAptitudeTestById = async (
    attemptId
) => {

    if (!attemptId) {
        throw new Error(
            "Aptitude attempt ID is required"
        );
    }

    const response = await api.get(
        `${HR_APTITUDE_BASE}/results/${attemptId}`
    );

    return response?.data;
};