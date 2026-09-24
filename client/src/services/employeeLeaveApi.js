import api from "./api";


// =====================================================
// EMPLOYEE LEAVE API
// =====================================================

const employeeLeaveApi = {

    // =================================================
    // APPLY LEAVE
    // POST /api/leave/apply
    // =================================================

    applyLeave: async (data) => {

        try {

            const response =
                await api.post(
                    "/leave/apply",
                    data
                );

            return response.data;

        } catch (error) {

            console.error(
                "EMPLOYEE LEAVE - APPLY ERROR:",
                error
            );

            throw error;
        }
    },


    // =================================================
    // GET MY LEAVES
    // GET /api/leave/my-leaves
    // =================================================

    getMyLeaves: async () => {

        try {

            const response =
                await api.get(
                    "/leave/my-leaves"
                );

            return response.data;

        } catch (error) {

            console.error(
                "EMPLOYEE LEAVE - GET ERROR:",
                error
            );

            throw error;
        }
    },

};


export default employeeLeaveApi;