import api from "./api";


// =========================================================
// APPLY FOR JOB
// POST /api/job-applications
// =========================================================

export const applyForJob = async (
    payload
) => {

    const response =
        await api.post(
            "/job-applications",
            payload
        );

    return response.data;

};


// =========================================================
// GET MY APPLICATIONS
// GET /api/job-applications/my
// =========================================================

export const getMyApplications = async () => {

    const response =
        await api.get(
            "/job-applications/my"
        );

    return response.data;

};


// =========================================================
// GET SINGLE APPLICATION
// GET /api/job-applications/:id
// =========================================================

export const getMyApplicationById = async (
    applicationId
) => {

    const response =
        await api.get(
            `/job-applications/${applicationId}`
        );

    return response.data;

};