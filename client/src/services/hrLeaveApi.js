import api from "./api";


// =====================================================
// HR LEAVE API
// =====================================================

const hrLeaveApi = {

    // =================================================
    // GET ALL LEAVES
    // =================================================

    getAllLeaves: async (
        params = {}
    ) => {

        try {

            const response =
                await api.get(
                    "/hr-leaves",
                    {
                        params,
                    }
                );

            return response.data;

        } catch (error) {

            console.error(
                "HR LEAVE GET ERROR:",
                error
            );

            throw error;
        }
    },


    // =================================================
    // APPROVE
    // =================================================

    approveLeave: async (
        leaveId
    ) => {

        try {

            if (!leaveId) {

                throw new Error(
                    "Leave ID is missing."
                );
            }


            const response =
                await api.put(
                    `/hr-leaves/${leaveId}/approve`
                );


            return response.data;

        } catch (error) {

            console.error(
                "HR LEAVE APPROVE ERROR:",
                error
            );

            throw error;
        }
    },


    // =================================================
    // CANCEL
    // =================================================

    cancelLeave: async (
        leaveId,
        cancellationReason
    ) => {

        try {

            if (!leaveId) {

                throw new Error(
                    "Leave ID is missing."
                );
            }


            const reason =
                String(
                    cancellationReason || ""
                ).trim();


            if (!reason) {

                throw new Error(
                    "Cancellation reason is required."
                );
            }


            const response =
                await api.put(

                    `/hr-leaves/${leaveId}/cancel`,

                    {
                        cancellationReason:
                            reason,
                    }

                );


            return response.data;

        } catch (error) {

            console.error(
                "HR LEAVE CANCEL ERROR:",
                error
            );

            throw error;
        }
    },

};


export default hrLeaveApi;