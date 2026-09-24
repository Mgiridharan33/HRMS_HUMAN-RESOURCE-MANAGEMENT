import api from "./api";

const ADMIN_APPLICATION_BASE =
    "/admin/job-applications";


// =========================================================
// GET ALL APPLICATIONS
// =========================================================

export const getAdminApplications = async (
    params = {}
) => {

    const response = await api.get(
        ADMIN_APPLICATION_BASE,
        {
            params,
        }
    );

    return response.data;
};


// =========================================================
// GET SUMMARY
// =========================================================

export const getAdminApplicationSummary =
    async () => {

        const response = await api.get(
            `${ADMIN_APPLICATION_BASE}/summary`
        );

        return response.data;
    };


// =========================================================
// SEND APPLICATION TO HR
// =========================================================

export const sendAdminApplicationToHR =
    async (
        applicationId
    ) => {

        if (!applicationId) {

            throw new Error(
                "Application ID is required"
            );

        }

        const response = await api.patch(
            `${ADMIN_APPLICATION_BASE}/${applicationId}/send-to-hr`
        );

        return response.data;
    };


// =========================================================
// REMOVE APPLICATION FROM HR QUEUE
// =========================================================

export const removeAdminApplicationFromHR =
    async (
        applicationId
    ) => {

        if (!applicationId) {

            throw new Error(
                "Application ID is required"
            );

        }

        const response = await api.patch(
            `${ADMIN_APPLICATION_BASE}/${applicationId}/remove-from-hr`
        );

        return response.data;
    };


// =========================================================
// UPDATE STATUS
// =========================================================

export const updateAdminApplicationStatus =
    async (
        applicationId,
        status,
        adminNotes = ""
    ) => {

        if (!applicationId) {

            throw new Error(
                "Application ID is required"
            );

        }

        const response = await api.patch(
            `${ADMIN_APPLICATION_BASE}/${applicationId}/status`,
            {
                status,
                adminNotes,
            }
        );

        return response.data;
    };


// =========================================================
// UPDATE NOTES
// =========================================================

export const updateAdminApplicationNotes =
    async (
        applicationId,
        adminNotes = ""
    ) => {

        if (!applicationId) {

            throw new Error(
                "Application ID is required"
            );

        }

        const response = await api.patch(
            `${ADMIN_APPLICATION_BASE}/${applicationId}/notes`,
            {
                adminNotes,
            }
        );

        return response.data;
    };


// =========================================================
// DELETE
// =========================================================

export const deleteAdminApplication =
    async (
        applicationId
    ) => {

        if (!applicationId) {

            throw new Error(
                "Application ID is required"
            );

        }

        const response = await api.delete(
            `${ADMIN_APPLICATION_BASE}/${applicationId}`
        );

        return response.data;
    };


// =========================================================
// DEFAULT EXPORT
// =========================================================

export default {

    getAdminApplications,

    getAdminApplicationSummary,

    sendAdminApplicationToHR,

    removeAdminApplicationFromHR,

    updateAdminApplicationStatus,

    updateAdminApplicationNotes,

    deleteAdminApplication,

};