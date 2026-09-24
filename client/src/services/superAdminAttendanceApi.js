import api from "./api";

const getAttendance = async (params = {}) => {

    const response =
        await api.get(
            "/superadmin-attendance",
            {
                params,
            }
        );

    return response.data;
};


const getSummary = async () => {

    const response =
        await api.get(
            "/superadmin-attendance/summary"
        );

    return response.data;
};



const getEmployeeAttendance = async (
    employeeId,
    params = {}
) => {

    const response =
        await api.get(
            `/superadmin-attendance/employees/${employeeId}`,
            {
                params,
            }
        );

    return response.data;
};



const getHRAttendance = async (
    hrId,
    params = {}
) => {

    const response =
        await api.get(
            `/superadmin-attendance/hr/${hrId}`,
            {
                params,
            }
        );

    return response.data;
};



const getEmployees = async () => {

    const response =
        await api.get(
            "/superadmin-attendance/employees"
        );

    return response.data;
};


const getHRList = async () => {

    const response =
        await api.get(
            "/superadmin-attendance/hr"
        );

    return response.data;
};


// =====================================================
// EXPORT
// =====================================================

export const superAdminAttendanceApi = {

    getAttendance,

    getSummary,

    getEmployeeAttendance,

    getHRAttendance,

    getEmployees,

    getHRList,

};

export default superAdminAttendanceApi;