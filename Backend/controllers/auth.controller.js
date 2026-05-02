import User from "../models/user.model.js";
import { generateAccessAndRefreshToken } from "../helper/generateAccessAndRefreshToken.js";

const cookieBase = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
});

/**
 * POST /api/v1/auth/register | /api/v1/users/register
 * Body: { name, email, password }
 * Password is hashed with bcrypt (see User model pre-save).
 */
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name?.trim() || !email?.trim() || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        const existing = await User.findOne({ email: email.trim().toLowerCase() });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists",
            });
        }

        const user = await User.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
        });

        const safe = await User.findById(user._id).select("-refreshToken");

        return res.status(201).json({
            success: true,
            message: "Registered successfully",
            status: 201,
            user: safe,
            data: { user: safe },
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered",
            });
        }
        console.error("register:", error);
        return res.status(500).json({
            success: false,
            message: "Registration failed",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

/**
 * POST /api/v1/auth/login | /api/v1/users/login
 * Body: { email, password }
 * Returns JWT access token (JSON + cookie) and refresh token (cookie + stored hashed-side).
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email?.trim() || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase(),
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const valid = await user.isPasswordCorrect(password);
        if (!valid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const { accessToken, newRefreshToken: refreshToken } =
            await generateAccessAndRefreshToken(user._id);

        let userDetails = await User.findById(user._id).select("-refreshToken");
        const payload = {
            ...userDetails.toObject(),
            accessToken,
        };

        const opts = cookieBase();
        res.cookie("accessToken", accessToken, { ...opts, maxAge: 24 * 60 * 60 * 1000 });
        res.cookie("refreshToken", refreshToken, { ...opts, maxAge: 7 * 24 * 60 * 60 * 1000 });

        return res.status(200).json({
            success: true,
            message: "Logged in successfully",
            status: 200,
            user: payload,
            data: {
                user: payload,
                accessToken,
            },
        });
    } catch (error) {
        console.error("login:", error);
        return res.status(500).json({
            success: false,
            message: "Login failed",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};
