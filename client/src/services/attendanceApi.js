import api from "./api";

const attendanceApi = {

    /*
    =====================================================
    GET TODAY'S EMPLOYEE ATTENDANCE
    =====================================================
    */

    getToday: async () => {

        const response =
            await api.get(
                "/attendance/today"
            );

        return response.data;

    },

};

export default attendanceApi;