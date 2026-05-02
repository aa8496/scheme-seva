import userAuthenticatedAxiosInstance from "../users/userAuthenticatedAxiosInstance";

const api = userAuthenticatedAxiosInstance("/api/v1/applications");

export const submitApplication = async (schemeId, applicantNote = "") => {
    const { data } = await api.post("/", { schemeId, applicantNote });
    return data;
};

export const getMyApplications = async () => {
    const { data } = await api.get("/my");
    return data;
};
