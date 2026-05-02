import express from "express";
import authRoutes from "./auth.routes.js";
import usersRoutes from "./users.routes.js";
import schemesRoutes from "./schemes.routes.js";
import recommendRoutes from "./recommendations.routes.js";
import chatbotRoutes from "./chatbot.routes.js";
import applicationsRoutes from "./applications.routes.js";
import adminRoutes from "./admin.routes.js";
import { getAllSchemes } from "../../controllers/schemev2.controller.js";

const router = express.Router();

/**
 * Core welfare APIs (catalogue):
 * GET /api/v1/schemes — paginated active schemes (query: page, limit)
 * Must be registered before /schemes legacy sub-router so this handles exact GET /schemes.
 */
router.get("/schemes", getAllSchemes);

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/schemes", schemesRoutes);
router.use("/recommendations", recommendRoutes);
router.use("/chatbot", chatbotRoutes);
router.use("/applications", applicationsRoutes);
router.use("/admin", adminRoutes);
router.use("/", (req, res) => {
    res.send("API V1 Running");
});

export default router;
