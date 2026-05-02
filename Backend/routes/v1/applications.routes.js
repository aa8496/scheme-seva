import express from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { createApplication, getMyApplications } from "../../controllers/application.controller.js";

const router = express.Router();

/** Apply for a scheme — POST /api/v1/applications (body: { schemeId, applicantNote? }) */
router.post("/", verifyJWT, createApplication);
/** Same handler — POST /api/v1/applications/apply */
router.post("/apply", verifyJWT, createApplication);

/** Current user’s applications — GET /api/v1/applications or /api/v1/applications/my */
router.get("/", verifyJWT, getMyApplications);
router.get("/my", verifyJWT, getMyApplications);

export default router;
