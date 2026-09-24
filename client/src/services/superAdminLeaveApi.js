import api from "./api";

const superAdminLeaveApi = {

    getSummary: async () => {

        const response = await api.get(
            "/super-admin/leaves"
        );

        return response.data;

    },

};

export default superAdminLeaveApi;
