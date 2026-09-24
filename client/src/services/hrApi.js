import api from "./api";

/*
=====================================================
HR API
=====================================================
*/

const hrApi = {

    // Get all HR
    getAll: async () => {
        const response = await api.get("/hr");
        return response.data;
    },

    // Get single HR
    getById: async (id) => {
        const response = await api.get(`/hr/${id}`);
        return response.data;
    },

    // Create HR
    create: async (data) => {
        const response = await api.post(
            "/hr",
            data
        );

        return response.data;
    },

    // Update HR
    update: async (id, data) => {
        const response = await api.put(
            `/hr/${id}`,
            data
        );

        return response.data;
    },

    // Activate / deactivate HR
    toggleStatus: async (id) => {
        const response = await api.patch(
            `/hr/${id}/status`
        );

        return response.data;
    },

    // Delete HR
    delete: async (id) => {
        const response = await api.delete(
            `/hr/${id}`
        );

        return response.data;
    },
};  

export default hrApi;