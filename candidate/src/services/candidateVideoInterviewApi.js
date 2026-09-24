import api from "./api";

/*
=========================================================
CANDIDATE VIDEO INTERVIEW API
=========================================================

Backend routes:

GET    /candidate/my
GET    /candidate/:id

The axios "api" instance already contains /api in baseURL,
so DO NOT write /api here.
=========================================================
*/


const BASE =
    "/video-interviews/candidate";


/*
=========================================================
NORMALIZE RESPONSE
=========================================================
*/

const normalizeResponse = (
    response
) => {

    const payload =
        response?.data ||
        {};

    if (
        Array.isArray(payload)
    ) {

        return {
            interviews: payload,
        };

    }

    if (
        Array.isArray(payload.interviews)
    ) {

        return payload;

    }

    if (
        Array.isArray(payload.data)
    ) {

        return {
            ...payload,
            interviews: payload.data,
        };

    }

    if (
        Array.isArray(payload.data?.interviews)
    ) {

        return {
            ...payload,
            interviews: payload.data.interviews,
        };

    }

    return payload;

};


/*
=========================================================
GET MY VIDEO INTERVIEWS
=========================================================

Returns interviews sent to the logged-in candidate.

Backend statuses:

SentToCandidate
Completed
=========================================================
*/

export const getCandidateVideoInterviews =
    async () => {

        const response =
            await api.get(
                `${BASE}/my`
            );

        return normalizeResponse(
            response
        );

    };


/*
=========================================================
GET SINGLE VIDEO INTERVIEW
=========================================================
*/

export const getCandidateVideoInterviewById =
    async (
        interviewId
    ) => {

        if (
            !interviewId
        ) {

            throw new Error(
                "Interview ID is required"
            );

        }

        const response =
            await api.get(
                `${BASE}/${interviewId}`
            );

        return normalizeResponse(
            response
        );

    };


/*
=========================================================
EXPORT DEFAULT API OBJECT
=========================================================
*/

const candidateVideoInterviewApi = {

    getCandidateVideoInterviews,

    getCandidateVideoInterviewById,

};

export default candidateVideoInterviewApi;