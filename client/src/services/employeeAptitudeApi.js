import api from "./api";

/*
=========================================================
EMPLOYEE APTITUDE QUESTION API
=========================================================

Axios `api` already contains:

    http://localhost:5000/api

Therefore DO NOT add /api here.

Backend endpoints:

GET
/employee/aptitude-question-assignments

GET
/employee/aptitude-question-assignments/:id

POST
/employee/aptitude-question-assignments/:id/questions

PATCH
/employee/aptitude-question-assignments/:id/questions/:questionId

DELETE
/employee/aptitude-question-assignments/:id/questions/:questionId

POST
/employee/aptitude-question-assignments/:id/submit
=========================================================
*/

const BASE_URL =
    "/employee/aptitude-question-assignments";


/*
=========================================================
NORMALIZE API ERROR
=========================================================
*/

const getApiErrorMessage = (
    error,
    fallback = "Something went wrong"
) => {

    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallback
    );

};


/*
=========================================================
GET MY ASSIGNMENTS
=========================================================
*/

export const getMyAptitudeAssignments =
    async () => {

        try {

            const response =
                await api.get(
                    BASE_URL
                );

            return response.data;

        } catch (error) {

            throw new Error(
                getApiErrorMessage(
                    error,
                    "Failed to load aptitude assignments"
                )
            );

        }

    };


/*
=========================================================
GET SINGLE ASSIGNMENT
=========================================================
*/

export const getMyAptitudeAssignment =
    async (
        assignmentId
    ) => {

        if (!assignmentId) {

            throw new Error(
                "Assignment ID is required"
            );

        }


        try {

            const response =
                await api.get(
                    `${BASE_URL}/${assignmentId}`
                );

            return response.data;

        } catch (error) {

            throw new Error(
                getApiErrorMessage(
                    error,
                    "Failed to load aptitude assessment"
                )
            );

        }

    };


/*
=========================================================
CREATE QUESTION
=========================================================
*/

export const createAptitudeQuestion =
    async (
        assignmentId,
        questionData
    ) => {

        if (!assignmentId) {

            throw new Error(
                "Assignment ID is required"
            );

        }


        try {

            const response =
                await api.post(
                    `${BASE_URL}/${assignmentId}/questions`,
                    questionData
                );

            return response.data;

        } catch (error) {

            throw new Error(
                getApiErrorMessage(
                    error,
                    "Failed to create aptitude question"
                )
            );

        }

    };


/*
=========================================================
UPDATE QUESTION
=========================================================
*/

export const updateAptitudeQuestion =
    async (
        assignmentId,
        questionId,
        questionData
    ) => {

        if (
            !assignmentId ||
            !questionId
        ) {

            throw new Error(
                "Assignment ID and question ID are required"
            );

        }


        try {

            const response =
                await api.patch(
                    `${BASE_URL}/${assignmentId}/questions/${questionId}`,
                    questionData
                );

            return response.data;

        } catch (error) {

            throw new Error(
                getApiErrorMessage(
                    error,
                    "Failed to update aptitude question"
                )
            );

        }

    };


/*
=========================================================
DELETE QUESTION
=========================================================
*/

export const deleteAptitudeQuestion =
    async (
        assignmentId,
        questionId
    ) => {

        if (
            !assignmentId ||
            !questionId
        ) {

            throw new Error(
                "Assignment ID and question ID are required"
            );

        }


        try {

            const response =
                await api.delete(
                    `${BASE_URL}/${assignmentId}/questions/${questionId}`
                );

            return response.data;

        } catch (error) {

            throw new Error(
                getApiErrorMessage(
                    error,
                    "Failed to delete aptitude question"
                )
            );

        }

    };


/*
=========================================================
SUBMIT QUESTIONS
=========================================================
*/

export const submitAptitudeQuestions =
    async (
        assignmentId
    ) => {

        if (!assignmentId) {

            throw new Error(
                "Assignment ID is required"
            );

        }


        try {

            const response =
                await api.post(
                    `${BASE_URL}/${assignmentId}/submit`
                );

            return response.data;

        } catch (error) {

            throw new Error(
                getApiErrorMessage(
                    error,
                    "Failed to submit aptitude questions"
                )
            );

        }

    };


/*
=========================================================
DEFAULT EXPORT
=========================================================
*/

const employeeAptitudeApi = {

    getMyAptitudeAssignments,

    getMyAptitudeAssignment,

    createAptitudeQuestion,

    updateAptitudeQuestion,

    deleteAptitudeQuestion,

    submitAptitudeQuestions,

};

export default employeeAptitudeApi;