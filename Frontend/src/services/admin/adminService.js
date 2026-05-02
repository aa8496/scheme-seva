import userAuthenticatedAxiosInstance from "../users/userAuthenticatedAxiosInstance";

const api = userAuthenticatedAxiosInstance("/api/v1/admin");

export const adminListUsers = async (page = 1, limit = 20) => {
    const { data } = await api.get("/users", { params: { page, limit } });
    return data;
};

export const adminUpdateUserRole = async (userId, role) => {
    const { data } = await api.patch(`/users/${userId}/role`, { role });
    return data;
};

export const adminListSchemes = async (page = 1, limit = 20) => {
    const { data } = await api.get("/schemes", { params: { page, limit } });
    return data;
};

export const adminCreateScheme = async (body) => {
    const { data } = await api.post("/schemes", body);
    return data;
};

export const adminUpdateScheme = async (id, body) => {
    const { data } = await api.put(`/schemes/${id}`, body);
    return data;
};

export const adminDeactivateScheme = async (id) => {
    const { data } = await api.patch(`/schemes/${id}/deactivate`);
    return data;
};

export const adminListApplications = async (page = 1, limit = 20) => {
    const { data } = await api.get("/applications", { params: { page, limit } });
    return data;
};

export const adminUpdateApplication = async (id, payload) => {
    const { data } = await api.patch(`/applications/${id}`, payload);
    return data;
};
