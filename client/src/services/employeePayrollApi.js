import axios from "axios";


const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";


// =====================================================
// GET MY PAYROLL
// =====================================================

export const getMyPayrolls = async (
    params = {}
) => {

    const response =
        await axios.get(
            `${API_URL}/employee/payroll`,
            {
                params,
                withCredentials: true,
            }
        );

    return response.data;

};


// =====================================================
// GET SINGLE PAYROLL
// =====================================================

export const getMyPayrollById = async (
    id
) => {

    const response =
        await axios.get(
            `${API_URL}/employee/payroll/${id}`,
            {
                withCredentials: true,
            }
        );

    return response.data;

};