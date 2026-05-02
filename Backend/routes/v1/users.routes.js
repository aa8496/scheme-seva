import { register, login } from "../../controllers/auth.controller.js";
import { logout, refreshAccessToken, getMe, putData } from "../../controllers/user.controller.js";
import express from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/signup", register);
router.post("/login", login);
router.post("/logout", verifyJWT, logout);
router.get("/refresh-access-token", refreshAccessToken);
router.get("/getme", verifyJWT, getMe);
router.post("/putdata", verifyJWT, putData);


export default router;