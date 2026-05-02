import express from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { requireAdmin } from "../../middlewares/admin.middleware.js";
import {
    listUsers,
    updateUserRole,
    listAllSchemes,
    adminCreateScheme,
    adminUpdateScheme,
    adminDeactivateScheme,
    listAllApplications,
    updateApplicationStatus,
} from "../../controllers/admin.controller.js";

const router = express.Router();

router.use(verifyJWT, requireAdmin);

router.get("/users", listUsers);
router.patch("/users/:id/role", updateUserRole);

router.get("/schemes", listAllSchemes);
router.post("/schemes", adminCreateScheme);
router.put("/schemes/:id", adminUpdateScheme);
router.patch("/schemes/:id/deactivate", adminDeactivateScheme);

router.get("/applications", listAllApplications);
router.patch("/applications/:id", updateApplicationStatus);

export default router;
