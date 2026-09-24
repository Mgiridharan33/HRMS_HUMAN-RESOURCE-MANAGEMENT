import axios from "axios";

// =====================================================
// API BASE URL
// =====================================================

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

// =====================================================
// AXIOS INSTANCE
// =====================================================

const hrSalaryStructureApi = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// =====================================================
// GET HR USERS
// GET /api/hr-salary-structures/hr-users
// =====================================================

export const getHRUsers = async () => {
    const response =
        await hrSalaryStructureApi.get(
            "/hr-salary-structures/hr-users"
        );

    return response.data;
};

// =====================================================
// GET ALL HR SALARY STRUCTURES
// GET /api/hr-salary-structures
// =====================================================

export const getHRSalaryStructures = async (
    params = {}
) => {
    const response =
        await hrSalaryStructureApi.get(
            "/hr-salary-structures",
            {
                params,
            }
        );

    return response.data;
};

// =====================================================
// GET SALARY STRUCTURE BY ID
// GET /api/hr-salary-structures/:id
// =====================================================

export const getHRSalaryStructureById =
    async (id) => {

        const response =
            await hrSalaryStructureApi.get(
                `/hr-salary-structures/${id}`
            );

        return response.data;
    };

// =====================================================
// GET ACTIVE STRUCTURE BY HR
// GET /api/hr-salary-structures/hr/:hrId
// =====================================================

export const getHRSalaryStructureByHR =
    async (hrId) => {

        const response =
            await hrSalaryStructureApi.get(
                `/hr-salary-structures/hr/${hrId}`
            );

        return response.data;
    };

// =====================================================
// CREATE
// POST /api/hr-salary-structures
// =====================================================

export const createHRSalaryStructure =
    async (payload) => {

        const response =
            await hrSalaryStructureApi.post(
                "/hr-salary-structures",
                payload
            );

        return response.data;
    };

// =====================================================
// UPDATE
// PUT /api/hr-salary-structures/:id
// =====================================================

export const updateHRSalaryStructure =
    async (
        id,
        payload
    ) => {

        const response =
            await hrSalaryStructureApi.put(
                `/hr-salary-structures/${id}`,
                payload
            );

        return response.data;
    };

// =====================================================
// ACTIVATE
// PUT /api/hr-salary-structures/:id/activate
// =====================================================

export const activateHRSalaryStructure =
    async (id) => {

        const response =
            await hrSalaryStructureApi.put(
                `/hr-salary-structures/${id}/activate`
            );

        return response.data;
    };

// =====================================================
// DEACTIVATE
// PUT /api/hr-salary-structures/:id/deactivate
// =====================================================

export const deactivateHRSalaryStructure =
    async (id) => {

        const response =
            await hrSalaryStructureApi.put(
                `/hr-salary-structures/${id}/deactivate`
            );

        return response.data;
    };

// =====================================================
// DELETE
// DELETE /api/hr-salary-structures/:id
// =====================================================

export const deleteHRSalaryStructure =
    async (id) => {

        const response =
            await hrSalaryStructureApi.delete(
                `/hr-salary-structures/${id}`
            );

        return response.data;
    };

// =====================================================
// DEFAULT EXPORT
// =====================================================

export default hrSalaryStructureApi;