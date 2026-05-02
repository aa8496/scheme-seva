export { register, login } from "./auth.controller.js";
export { logout, refreshAccessToken, getMe, putData } from "./user.controller.js";
export { createApplication, getMyApplications } from "./application.controller.js";
export {
    getAllSchemes,
    getSchemeById,
    getSchemeByCategory,
    getFilteredSchemes,
    saveFavoriteSchemes,
    removeFavoriteSchemes,
    getFavoriteSchemes,
} from "./schemev2.controller.js";
export {
    createScheme,
    getAllSchemes as getAllLegacySchemes,
    getSchemeFiltered,
    getSchemeById as getLegacySchemeById,
} from "./scheme.controller.js";
