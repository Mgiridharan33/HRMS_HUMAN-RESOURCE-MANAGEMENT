import api from "./api";


// =====================================================
// CREATE PAYROLL
// SUPER_ADMIN / HR
// =====================================================

export const createPayroll = async (data) => {

    const response = await api.post(
        "/payroll",
        data
    );

    return response.data;
};


// =====================================================
// GET ALL PAYROLLS
// SUPER_ADMIN / HR
// =====================================================

export const getAllPayrolls = async (params = {}) => {

    const response = await api.get(
        "/payroll",
        {
            params,
        }
    );

    return response.data;
};


// =====================================================
// GET PAYROLL SUMMARY
// SUPER_ADMIN / HR
// =====================================================

export const getPayrollSummary = async (
    params = {}
) => {

    const response = await api.get(
        "/payroll/summary",
        {
            params,
        }
    );

    return response.data;
};


// =====================================================
// GET MY PAYROLLS
// EMPLOYEE
// =====================================================

export const getMyPayrolls = async (
    params = {}
) => {

    const response = await api.get(
        "/payroll/my",
        {
            params,
        }
    );

    return response.data;
};


// =====================================================
// GET SINGLE PAYROLL
// SUPER_ADMIN / HR / EMPLOYEE
// =====================================================

export const getPayrollById = async (
    payrollId
) => {

    const response = await api.get(
        `/payroll/${payrollId}`
    );

    return response.data;
};


// =====================================================
// APPROVE PAYROLL
// SUPER_ADMIN / HR
// =====================================================

export const approvePayroll = async (
    payrollId
) => {

    const response = await api.put(
        `/payroll/${payrollId}/approve`
    );

    return response.data;
};


// =====================================================
// MARK PAYROLL AS PAID
// SUPER_ADMIN
// =====================================================

export const markPayrollPaid = async (
    payrollId,
    data = {}
) => {

    const response = await api.put(
        `/payroll/${payrollId}/pay`,
        data
    );

    return response.data;
};


// =====================================================
// CANCEL PAYROLL
// SUPER_ADMIN
// =====================================================

export const cancelPayroll = async (
    payrollId,
    data = {}
) => {

    const response = await api.put(
        `/payroll/${payrollId}/cancel`,
        data
    );

    return response.data;
};


// =====================================================
// DELETE PAYROLL
// SUPER_ADMIN
// =====================================================

export const deletePayroll = async (
    payrollId
) => {

    const response = await api.delete(
        `/payroll/${payrollId}`
    );

    return response.data;
};


// =====================================================
// DEFAULT EXPORT
// =====================================================

const payrollApi = {

    createPayroll,
    getAllPayrolls,
    getPayrollSummary,
    getMyPayrolls,
    getPayrollById,
    approvePayroll,
    markPayrollPaid,
    cancelPayroll,
    deletePayroll,

};

export default payrollApi;