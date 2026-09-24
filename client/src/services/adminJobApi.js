import api from "./api";


// =========================================================
// GET ALL JOBS
// GET /api/admin/jobs
// =========================================================

export const getAdminJobs = async () => {

    const response =
        await api.get("/admin/jobs");

    return response.data;

};


// =========================================================
// GET JOB BY ID
// GET /api/admin/jobs/:id
// =========================================================

export const getAdminJobById = async (
    jobId
) => {

    const response =
        await api.get(
            `/admin/jobs/${jobId}`
        );

    return response.data;

};


// =========================================================
// CREATE JOB
// POST /api/admin/jobs
// =========================================================

export const createAdminJob = async (
    jobData
) => {

    const response =
        await api.post(
            "/admin/jobs",
            jobData
        );

    return response.data;

};


// =========================================================
// UPDATE JOB
// PUT /api/admin/jobs/:id
// =========================================================

export const updateAdminJob = async (
    jobId,
    jobData
) => {

    const response =
        await api.put(
            `/admin/jobs/${jobId}`,
            jobData
        );

    return response.data;

};


// =========================================================
// DELETE JOB
// DELETE /api/admin/jobs/:id
// =========================================================

export const deleteAdminJob = async (
    jobId
) => {

    const response =
        await api.delete(
            `/admin/jobs/${jobId}`
        );

    return response.data;

};


// =========================================================
// CLOSE JOB
// PATCH /api/admin/jobs/:id/close
// =========================================================

export const closeAdminJob = async (
    jobId
) => {

    const response =
        await api.patch(
            `/admin/jobs/${jobId}/close`
        );

    return response.data;

};