import api from "./api";


// =========================================================
// GET PUBLISHED JOBS
// GET /api/jobs
//
// PUBLIC
// Candidate can browse published jobs.
// =========================================================

export const getPublishedJobs = async () => {

    const response =
        await api.get(
            "/jobs"
        );

    return response.data;

};


// =========================================================
// GET SINGLE PUBLISHED JOB
// GET /api/jobs/:id
//
// PUBLIC
// Candidate can view one published job.
// =========================================================

export const getPublishedJobById = async (
    jobId
) => {

    if (!jobId) {

        throw new Error(
            "Job ID is required"
        );

    }


    const response =
        await api.get(
            `/jobs/${jobId}`
        );


    return response.data;

};