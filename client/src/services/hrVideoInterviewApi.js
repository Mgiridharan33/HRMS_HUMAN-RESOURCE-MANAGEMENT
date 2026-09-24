import api from "./api";

/*
===========================================================
HR VIDEO INTERVIEW API
===========================================================

Backend base route is assumed to be:

/api/video-interviews

Axios api.js already contains:

http://localhost:5000/api

Therefore DO NOT add /api here.
===========================================================
*/


const BASE =
    "/video-interviews";



/*
===========================================================
GET HR VIDEO INTERVIEWS
===========================================================

Returns:

{
    success: true,
    interviews: []
}

Backend:

GET /video-interviews/hr/my
===========================================================
*/

export const getHRVideoInterviews =
    async () => {

        const response =
            await api.get(
                `${BASE}/hr/my`
            );

        return response.data;

    };



/*
===========================================================
SEND VIDEO INTERVIEW TO CANDIDATE
===========================================================

Backend:

PATCH /video-interviews/hr/:id/send
===========================================================
*/

export const sendVideoInterviewToCandidate =
    async (
        interviewId
    ) => {

        const response =
            await api.patch(
                `${BASE}/hr/${interviewId}/send`
            );

        return response.data;

    };



/*
===========================================================
MARK INTERVIEW COMPLETED
===========================================================

Backend:

PATCH /video-interviews/hr/:id/complete
===========================================================
*/

export const completeHRVideoInterview =
    async (
        interviewId
    ) => {

        const response =
            await api.patch(
                `${BASE}/hr/${interviewId}/complete`
            );

        return response.data;

    };



/*
===========================================================
CANCEL INTERVIEW
===========================================================

Backend:

PATCH /video-interviews/:id/cancel
===========================================================
*/

export const cancelHRVideoInterview =
    async (
        interviewId,
        reason = ""
    ) => {

        const response =
            await api.patch(
                `${BASE}/${interviewId}/cancel`,
                {
                    reason,
                }
            );

        return response.data;

    };


// ASSOCIATE OR REMOVE A RECORDING
export const associateHRVideoInterviewRecording =
    async (
        interviewId,
        recordingUrl
    ) => {

        const response =
            await api.patch(
                `${BASE}/${interviewId}/recording`,
                {
                    recordingUrl,
                }
            );

        return response.data;

    };