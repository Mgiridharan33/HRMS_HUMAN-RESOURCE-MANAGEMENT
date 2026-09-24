import api from "./api";

// =========================================================
// VIDEO INTERVIEW API
// =========================================================

// GET employees available for video interview assignment
export const getVideoInterviewEmployees = async () => {
    const response = await api.get(
        "/video-interviews/admin/employees"
    );

    return response.data;
};


// GET candidates who completed aptitude test
export const getVideoInterviewEligibleApplications =
    async () => {

        const response = await api.get(
            "/video-interviews/admin/eligible-applications"
        );

        return response.data;
    };


// ADMIN ASSIGN EMPLOYEE
export const assignVideoInterviewEmployee =
    async ({
        jobApplicationId,
        employeeId,
    }) => {

        const response = await api.post(
            "/video-interviews/admin/assign",
            {
                jobApplicationId,
                employeeId,
            }
        );

        return response.data;
    };


// APPROVE EMPLOYEE SCHEDULE
export const approveVideoInterview = async (
    interviewId
) => {
    const response = await api.patch(
        `/video-interviews/admin/${interviewId}/approve`
    );

    return response.data;
};


// REJECT EMPLOYEE SCHEDULE
export const rejectVideoInterview = async ({
    interviewId,
    rejectionReason,
}) => {
    const response = await api.patch(
        `/video-interviews/admin/${interviewId}/reject`,
        {
            rejectionReason,
        }
    );

    return response.data;
};


// ASSOCIATE OR REMOVE A RECORDING
export const associateVideoInterviewRecording = async ({
    interviewId,
    recordingUrl,
}) => {
    const response = await api.patch(
        `/video-interviews/${interviewId}/recording`,
        {
            recordingUrl,
        }
    );

    return response.data;
};