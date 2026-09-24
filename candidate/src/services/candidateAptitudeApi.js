import api from "./api";

const BASE = "/candidate/aptitude-tests";

export const getCandidateAptitudeTests = async () => {
    const response = await api.get(BASE);
    return response.data;
};

export const startCandidateAptitudeTest = async (id) => {
    const response = await api.post(
        `${BASE}/${id}/start`
    );
    return response.data;
};

export const submitCandidateAptitudeTest = async (
    attemptId,
    answers
) => {
    const response = await api.post(
        `${BASE}/${attemptId}/submit`,
        {
            answers,
        }
    );

    return response.data;
};

export const getCandidateAptitudeTestResult =
    async (attemptId) => {

        const response = await api.get(
            `${BASE}/attempt/${attemptId}`
        );

        return response.data;
    };
    