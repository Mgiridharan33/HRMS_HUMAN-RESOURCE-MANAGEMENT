import api from "./api";


// =========================================================
// BASE URL
// =========================================================
//
// IMPORTANT:
//
// api.js already contains:
//
// http://localhost:5000/api
//
// Therefore DO NOT write:
//
// /api/admin/...
//
// Correct:
//
// /admin/aptitude-question-assignments
//
// =========================================================

const APTITUDE_ASSIGNMENT_BASE =
    "/admin/aptitude-question-assignments";


// =========================================================
// GET HR-ACCEPTED APPLICATIONS
//
// GET
// /api/admin/aptitude-question-assignments/applications
//
// Returns candidates whose applications:
//
// sentToHR = true
// acceptedByHR != null
//
// =========================================================

export const getAptitudeEligibleApplications = async ({
    search = "",
} = {}) => {

    const response =
        await api.get(
            `${APTITUDE_ASSIGNMENT_BASE}/applications`,
            {
                params: {
                    search:
                        String(search || "").trim(),
                },
            }
        );

    return response.data;
};


// =========================================================
// GET ALL APTITUDE ASSIGNMENTS
//
// GET
// /api/admin/aptitude-question-assignments
//
// Optional:
//
// {
//     status,
//     search
// }
//
// =========================================================

export const getAptitudeAssignments = async ({
    status = "",
    search = "",
} = {}) => {

    const response =
        await api.get(
            APTITUDE_ASSIGNMENT_BASE,
            {
                params: {
                    status:
                        status &&
                        status !== "All"
                            ? status
                            : undefined,

                    search:
                        String(search || "").trim() ||
                        undefined,
                },
            }
        );

    return response.data;
};


// =========================================================
// GET SINGLE ASSIGNMENT
//
// GET
// /api/admin/aptitude-question-assignments/:id
// =========================================================

export const getAptitudeAssignmentById = async (
    assignmentId
) => {

    if (!assignmentId) {

        throw new Error(
            "Assignment ID is required"
        );

    }

    const response =
        await api.get(
            `${APTITUDE_ASSIGNMENT_BASE}/${assignmentId}`
        );

    return response.data;
};


// =========================================================
// GET ACTIVE EMPLOYEES
//
// GET
// /api/admin/aptitude-question-assignments/employees
//
// =========================================================

export const getAptitudeEmployees = async () => {

    const response =
        await api.get(
            `${APTITUDE_ASSIGNMENT_BASE}/employees`
        );

    return response.data;
};


// =========================================================
// ASSIGN EMPLOYEE FOR NEW QUESTIONS
//
// POST
// /api/admin/aptitude-question-assignments
//
// Body:
//
// {
//     jobApplicationId,
//     employeeId,
//     requiredQuestionCount
// }
//
// This means:
//
// CREATE NEW QUESTIONS
//
// =========================================================

export const assignEmployeeForAptitude = async ({
    jobApplicationId,
    employeeId,
    requiredQuestionCount,
}) => {

    if (!jobApplicationId) {

        throw new Error(
            "Job application ID is required"
        );

    }

    if (!employeeId) {

        throw new Error(
            "Employee ID is required"
        );

    }

    const count =
        Number(
            requiredQuestionCount
        );

    if (
        !Number.isInteger(count) ||
        count < 1
    ) {

        throw new Error(
            "Required question count must be a positive whole number"
        );

    }

    const response =
        await api.post(
            APTITUDE_ASSIGNMENT_BASE,
            {
                jobApplicationId,

                employeeId,

                requiredQuestionCount:
                    count,
            }
        );

    return response.data;
};


// =========================================================
// GET QUESTIONS FOR ADMIN
//
// GET
// /api/admin/aptitude-question-assignments/:id/questions
//
// =========================================================

export const getAssignmentQuestionsForAdmin = async (
    assignmentId
) => {

    if (!assignmentId) {

        throw new Error(
            "Assignment ID is required"
        );

    }

    const response =
        await api.get(
            `${APTITUDE_ASSIGNMENT_BASE}/${assignmentId}/questions`
        );

    return response.data;
};


// =========================================================
// APPROVE ASSIGNMENT
//
// PATCH
// /api/admin/aptitude-question-assignments/:id/approve
//
// =========================================================

export const approveAptitudeAssignment = async (
    assignmentId
) => {

    if (!assignmentId) {

        throw new Error(
            "Assignment ID is required"
        );

    }

    const response =
        await api.patch(
            `${APTITUDE_ASSIGNMENT_BASE}/${assignmentId}/approve`
        );

    return response.data;
};


// =========================================================
// REJECT ASSIGNMENT
//
// PATCH
// /api/admin/aptitude-question-assignments/:id/reject
//
// Body:
//
// {
//     rejectionReason
// }
//
// =========================================================

export const rejectAptitudeAssignment = async (
    assignmentId,
    rejectionReason
) => {

    if (!assignmentId) {

        throw new Error(
            "Assignment ID is required"
        );

    }

    const reason =
        String(
            rejectionReason || ""
        ).trim();

    if (!reason) {

        throw new Error(
            "Rejection reason is required"
        );

    }

    const response =
        await api.patch(
            `${APTITUDE_ASSIGNMENT_BASE}/${assignmentId}/reject`,
            {
                rejectionReason:
                    reason,
            }
        );

    return response.data;
};


// =========================================================
// GET REUSABLE QUESTION SETS
//
// IMPORTANT BUSINESS RULE:
//
// Existing questions can ONLY be reused when:
//
// 1. The job already has an eligible/candidate application.
// 2. A previous aptitude question assignment exists
//    for that SAME JOB.
// 3. The source assignment has completed/approved questions.
// 4. The current application is different from the
//    source application.
//
// For a brand-new job with no previous candidate/application,
// this endpoint should return:
//
// []
//
// =========================================================
//
// GET
//
// /api/admin/aptitude-question-assignments/
// reusable-question-sets
//
// Query:
//
// {
//     jobId,
//     excludeApplicationId
// }
//
// =========================================================

export const getReusableAptitudeQuestionSets = async ({
    jobId,
    excludeApplicationId,
} = {}) => {

    if (!jobId) {

        throw new Error(
            "Job ID is required to load reusable question sets"
        );

    }

    const params = {
        jobId,
    };


    if (excludeApplicationId) {

        params.excludeApplicationId =
            excludeApplicationId;

    }


    const response =
        await api.get(
            `${APTITUDE_ASSIGNMENT_BASE}/reusable-question-sets`,
            {
                params,
            }
        );

    return response.data;
};


// =========================================================
// REUSE EXISTING QUESTIONS
//
// IMPORTANT:
//
// This does NOT create new questions.
//
// It creates a new assignment for the selected
// candidate/application using questions from an existing
// approved assignment.
//
// POST
//
// /api/admin/aptitude-question-assignments/
// reuse-questions
//
// Body:
//
// {
//     jobApplicationId,
//     sourceAssignmentId,
//     employeeId
// }
//
// =========================================================

export const reuseAptitudeQuestions = async ({
    jobApplicationId,
    sourceAssignmentId,
    employeeId,
}) => {

    if (!jobApplicationId) {

        throw new Error(
            "Job application ID is required"
        );

    }

    if (!sourceAssignmentId) {

        throw new Error(
            "Source assignment ID is required"
        );

    }

    if (!employeeId) {

        throw new Error(
            "Employee ID is required"
        );

    }


    const response =
        await api.post(
            `${APTITUDE_ASSIGNMENT_BASE}/reuse-questions`,
            {
                jobApplicationId,

                sourceAssignmentId,

                employeeId,
            }
        );

    return response.data;
};


// =========================================================
// OPTIONAL HELPER
//
// GET REUSABLE QUESTION SETS FOR AN APPLICATION
//
// This is useful directly from your JSX:
//
// const response = await
// getReusableQuestionSetsForApplication(application);
//
// =========================================================

export const getReusableQuestionSetsForApplication = async (
    application
) => {

    if (!application) {

        throw new Error(
            "Application is required"
        );

    }


    const jobId =
        typeof application.job === "object"
            ? application.job?._id
            : application.job;


    if (!jobId) {

        throw new Error(
            "Job ID not found in application"
        );

    }


    return getReusableAptitudeQuestionSets({

        jobId,

        excludeApplicationId:
            application._id,

    });

};


// =========================================================
// DEFAULT EXPORT
// =========================================================
//
// Useful if you prefer:
//
// import aptitudeQuestionAssignmentApi
//     from "...";
//
// =========================================================

const aptitudeQuestionAssignmentApi = {

    getAptitudeEligibleApplications,

    getAptitudeAssignments,

    getAptitudeAssignmentById,

    getAptitudeEmployees,

    assignEmployeeForAptitude,

    getAssignmentQuestionsForAdmin,

    approveAptitudeAssignment,

    rejectAptitudeAssignment,

    getReusableAptitudeQuestionSets,

    getReusableQuestionSetsForApplication,

    reuseAptitudeQuestions,

};


export default aptitudeQuestionAssignmentApi;