import api from "./api";


// ============================================================
// HR - APPLY PERSONAL LEAVE
// ============================================================

export const applyHRPersonalLeave = async (data) => {

    const response = await api.post(
        "/hr-personal-leaves",
        data
    );

    return response.data;
};


// ============================================================
// HR - GET MY PERSONAL LEAVES
// ============================================================

export const getMyHRPersonalLeaves = async () => {

    const response = await api.get(
        "/hr-personal-leaves/my"
    );

    return response.data;
};


// ============================================================
// SUPER ADMIN - GET ALL HR PERSONAL LEAVES
// ============================================================

export const getAllHRPersonalLeaves = async () => {

    const response = await api.get(
        "/hr-personal-leaves"
    );

    return response.data;
};


// ============================================================
// SUPER ADMIN - APPROVE HR PERSONAL LEAVE
// ============================================================

export const approveHRPersonalLeave = async (
    id,
    adminRemark = ""
) => {

    const response = await api.patch(
        `/hr-personal-leaves/${id}/approve`,
        {
            adminRemark,
        }
    );

    return response.data;
};


// ============================================================
// SUPER ADMIN - CANCEL HR PERSONAL LEAVE
// ============================================================

export const cancelHRPersonalLeave = async (
    id,
    adminRemark = ""
) => {

    const response = await api.patch(
        `/hr-personal-leaves/${id}/cancel`,
        {
            adminRemark,
        }
    );

    return response.data;
};