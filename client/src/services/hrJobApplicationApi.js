import api from "./api";

/*
=========================================================
HR JOB APPLICATION API
=========================================================

Axios baseURL already contains:

http://localhost:5000/api

Therefore DO NOT write /api here.

Correct:

/hr/job-applications

NOT:

/api/hr/job-applications
=========================================================
*/


const HR_APPLICATION_BASE =
    "/hr/job-applications";


// =========================================================
// NORMALIZE RESPONSE
// =========================================================

const normalizeResponse = (response) => {

    return response?.data || {};

};


// =========================================================
// GET HR APPLICATIONS
//
// IMPORTANT:
// HR sees:
//
// 1. Applications sent to HR
// 2. Unaccepted applications from all HR
// 3. Applications accepted by THIS HR
//
// Backend should determine ownership.
// =========================================================

export const getHRApplications = async (
    params = {}
) => {

    const response =
        await api.get(
            HR_APPLICATION_BASE,
            {
                params: {
                    status:
                        params.status || "",

                    search:
                        params.search || "",
                },
            }
        );

    return normalizeResponse(
        response
    );

};


// =========================================================
// GET SUMMARY
// =========================================================

export const getHRApplicationSummary =
    async () => {

        const response =
            await api.get(
                `${HR_APPLICATION_BASE}/summary`
            );

        return normalizeResponse(
            response
        );

    };


// =========================================================
// GET SINGLE APPLICATION
// =========================================================

export const getHRApplicationById =
    async (
        applicationId
    ) => {

        if (!applicationId) {

            throw new Error(
                "Application ID is required"
            );

        }

        const response =
            await api.get(
                `${HR_APPLICATION_BASE}/${applicationId}`
            );

        return normalizeResponse(
            response
        );

    };


// =========================================================
// ACCEPT APPLICATION
//
// PATCH
// /hr/job-applications/:id/accept
//
// IMPORTANT:
//
// This is the moment when:
//
// acceptedByHR = logged-in HR
//
// assignedHR   = logged-in HR
// =========================================================

export const acceptHRApplication =
    async (
        applicationId
    ) => {

        if (!applicationId) {

            throw new Error(
                "Application ID is required"
            );

        }

        const response =
            await api.patch(
                `${HR_APPLICATION_BASE}/${applicationId}/accept`
            );

        return normalizeResponse(
            response
        );

    };


// =========================================================
// UPDATE STATUS
// =========================================================

export const updateHRApplicationStatus =
    async (
        applicationId,
        status
    ) => {

        if (!applicationId) {

            throw new Error(
                "Application ID is required"
            );

        }

        if (!status) {

            throw new Error(
                "Application status is required"
            );

        }

        const response =
            await api.patch(
                `${HR_APPLICATION_BASE}/${applicationId}/status`,
                {
                    status,
                }
            );

        return normalizeResponse(
            response
        );

    };


// =========================================================
// UPDATE HR NOTES
// =========================================================

export const updateHRApplicationNotes =
    async (
        applicationId,
        hrNotes
    ) => {

        if (!applicationId) {

            throw new Error(
                "Application ID is required"
            );

        }

        const response =
            await api.patch(
                `${HR_APPLICATION_BASE}/${applicationId}/notes`,
                {
                    hrNotes:
                        hrNotes || "",
                }
            );

        return normalizeResponse(
            response
        );

    };


export const sendJobConfirmation = async (
    applicationId,
    options = {}
) => {

    const response = await api.post(
        `${HR_APPLICATION_BASE}/${applicationId}/confirmation-email`,
        {
            joiningDate: options.joiningDate || "",
            message: options.message || "",
        }
    );

    return normalizeResponse(response);
};


// =========================================================
// DEFAULT EXPORT
// =========================================================

const hrJobApplicationApi = {

    getHRApplications,

    getHRApplicationSummary,

    getHRApplicationById,

    acceptHRApplication,

    updateHRApplicationStatus,

    updateHRApplicationNotes,

    sendJobConfirmation,

};

export default hrJobApplicationApi;