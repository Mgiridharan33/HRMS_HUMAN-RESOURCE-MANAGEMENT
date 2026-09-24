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

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});


// =====================================================
// GET AUTH HEADERS
// =====================================================

const getAuthConfig = () => {

    const token =
        localStorage.getItem("token");

    if (!token) {
        return {};
    }

    return {
        headers: {
            Authorization:
                `Bearer ${token}`,
        },
    };
};


// =====================================================
// GET ALL HR PAYROLL
// GET /api/hr-payroll
// =====================================================

export const getAllHRPayroll = async (
    params = {}
) => {

    const response =
        await api.get(
            "/hr-payroll",
            {
                ...getAuthConfig(),
                params,
            }
        );

    return response.data;
};


// =====================================================
// GET HR PAYROLL BY ID
// GET /api/hr-payroll/:id
// =====================================================

export const getHRPayrollById = async (
    id
) => {

    const response =
        await api.get(
            `/hr-payroll/${id}`,
            getAuthConfig()
        );

    return response.data;
};


// =====================================================
// CREATE HR PAYROLL
// POST /api/hr-payroll
//
// Super Admin creates payroll for HR
// =====================================================

export const createHRPayroll = async (
    data
) => {

    const response =
        await api.post(
            "/hr-payroll",
            data,
            getAuthConfig()
        );

    return response.data;
};


// =====================================================
// PAY HR PAYROLL DIRECTLY
//
// IMPORTANT:
// HR payroll does NOT require approval.
//
// DRAFT → PAID
//
// PUT /api/hr-payroll/:id/pay
// =====================================================

export const payHRPayroll = async (
    id,
    data
) => {

    const response =
        await api.put(
            `/hr-payroll/${id}/pay`,
            data,
            getAuthConfig()
        );

    return response.data;
};


// =====================================================
// CANCEL HR PAYROLL
// PUT /api/hr-payroll/:id/cancel
// =====================================================

export const cancelHRPayroll = async (
    id
) => {

    const response =
        await api.put(
            `/hr-payroll/${id}/cancel`,
            {},
            getAuthConfig()
        );

    return response.data;
};


// =====================================================
// DELETE HR PAYROLL
// DELETE /api/hr-payroll/:id
//
// Super Admin only
// =====================================================

export const deleteHRPayroll = async (
    id
) => {

    const response =
        await api.delete(
            `/hr-payroll/${id}`,
            getAuthConfig()
        );

    return response.data;
};


// =====================================================
// GET HR SALARY STRUCTURES
// GET /api/hr-salary-structures
// =====================================================

export const getAllHRSalaryStructures = async (
    params = {}
) => {

    const response =
        await api.get(
            "/hr-salary-structures",
            {
                ...getAuthConfig(),
                params,
            }
        );

    return response.data;
};


// =====================================================
// GET HR SALARY STRUCTURE BY HR
// GET /api/hr-salary-structures/hr/:hrId
// =====================================================

export const getHRSalaryStructureByHR = async (
    hrId
) => {

    const response =
        await api.get(
            `/hr-salary-structures/hr/${hrId}`,
            getAuthConfig()
        );

    return response.data;
};


// =====================================================
// CREATE HR SALARY STRUCTURE
// POST /api/hr-salary-structures
// =====================================================

export const createHRSalaryStructure = async (
    data
) => {

    const response =
        await api.post(
            "/hr-salary-structures",
            data,
            getAuthConfig()
        );

    return response.data;
};


// =====================================================
// UPDATE HR SALARY STRUCTURE
// PUT /api/hr-salary-structures/:id
// =====================================================

export const updateHRSalaryStructure = async (
    id,
    data
) => {

    const response =
        await api.put(
            `/hr-salary-structures/${id}`,
            data,
            getAuthConfig()
        );

    return response.data;
};


// =====================================================
// ACTIVATE HR SALARY STRUCTURE
// PUT /api/hr-salary-structures/:id/activate
// =====================================================

export const activateHRSalaryStructure = async (
    id
) => {

    const response =
        await api.put(
            `/hr-salary-structures/${id}/activate`,
            {},
            getAuthConfig()
        );

    return response.data;
};


// =====================================================
// DEACTIVATE HR SALARY STRUCTURE
// PUT /api/hr-salary-structures/:id/deactivate
// =====================================================

export const deactivateHRSalaryStructure = async (
    id
) => {

    const response =
        await api.put(
            `/hr-salary-structures/${id}/deactivate`,
            {},
            getAuthConfig()
        );

    return response.data;
};


// =====================================================
// DELETE HR SALARY STRUCTURE
// DELETE /api/hr-salary-structures/:id
// =====================================================

export const deleteHRSalaryStructure = async (
    id
) => {

    const response =
        await api.delete(
            `/hr-salary-structures/${id}`,
            getAuthConfig()
        );

    return response.data;
};


// =====================================================
// DEFAULT EXPORT
// =====================================================

export default {
    getAllHRPayroll,
    getHRPayrollById,
    createHRPayroll,
    payHRPayroll,
    cancelHRPayroll,
    deleteHRPayroll,

    getAllHRSalaryStructures,
    getHRSalaryStructureByHR,
    createHRSalaryStructure,
    updateHRSalaryStructure,
    activateHRSalaryStructure,
    deactivateHRSalaryStructure,
    deleteHRSalaryStructure,
};