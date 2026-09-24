import api from "./api";

// ============================================================
// BASE
// ============================================================

const BASE = "/video-interviews";

// ============================================================
// GET EMPLOYEE ASSIGNED VIDEO INTERVIEWS
//
// GET
// /api/employee/video-interviews
// ============================================================

export const getEmployeeVideoInterviews = async () => {
    const response = await api.get(`${BASE}/employee`);

    return response.data;
};

// ============================================================
// SCHEDULE VIDEO INTERVIEW
//
// POST
// /api/employee/video-interviews/:id/schedule
// ============================================================

export const scheduleVideoInterview = async ({
    interviewId,
    scheduledDate,
    startTime,
    endTime,
    meetingLink,
    meetingPlatform,
    meetingNotes,
}) => {
    const response = await api.post(
        `${BASE}/${interviewId}/schedule`,
        {
            scheduledDate,
            startTime,
            endTime,
            meetingLink,
            meetingPlatform,
            meetingNotes,
        }
    );

    return response.data;
};

// ============================================================
// UPDATE VIDEO INTERVIEW SCHEDULE
//
// PATCH
// /api/employee/video-interviews/:id/schedule
// ============================================================

export const updateVideoInterviewSchedule = async ({
    interviewId,
    scheduledDate,
    startTime,
    endTime,
    meetingLink,
    meetingPlatform,
    meetingNotes,
}) => {
    const response = await api.put(
        `${BASE}/${interviewId}/schedule`,
        {
            scheduledDate,
            startTime,
            endTime,
            meetingLink,
            meetingPlatform,
            meetingNotes,
        }
    );

    return response.data;
};


// COMPLETE INTERVIEW WITH EMPLOYEE REVIEW
export const completeVideoInterview = async ({
    interviewId,
    employeeReview,
    performanceRating,
    employeeRecommendation,
}) => {
    const response = await api.patch(
        `${BASE}/employee/${interviewId}/complete`,
        {
            employeeReview,
            performanceRating,
            employeeRecommendation,
        }
    );

    return response.data;
};