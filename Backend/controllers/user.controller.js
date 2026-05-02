import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { generateAccessAndRefreshToken } from "../helper/generateAccessAndRefreshToken.js";

// Generate a new access token and using the refresh token
const refreshAccessToken = async (req, res) => {
    try {
        const incomingRefreshToken =
            req.cookies?.refreshToken || req.body?.refreshToken;

        if (!incomingRefreshToken) {
            return res.status(403).json({
                message: "Unauthorized request: Refresh token is required",
                status: 403,
                success: false,
            });
        }

        const decoded = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );


        const user = await User.findById(decoded?._id).select("+refreshToken");

        if (!user) {
            return res.status(401).json({
                message: "Unauthorized request: Invalid refresh token",
                status: 401,
                success: false,
            });
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            return res.status(403).json({
                message: "Unauthorized request: Refresh token in invalid or expired",
                status: 403,
                success: false,
            });
        }

        const options = {
            httpOnly: true,  // Cannot be accessed via JavaScript (only sent with HTTP requests)
            secure: process.env.NODE_ENV === 'production', // Set to true only in production (for HTTPS)
            sameSite: 'None', // Allows cross-origin cookie transmission (important for cross-origin requests)
        };

        const { accessToken, newRefreshToken } =
            await generateAccessAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json({
                status: 200,
                data: {
                    accessToken: accessToken,
                },
                message: "Access token was updated successfully",
                success: true,
            });
    } catch (error) {
        console.error("Error refreshing access token:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
            status: 500,
            success: false,
        });
    }
};

// logout a user
const logout = async (req, res) => {
    try {
        const userId = req.user._id;
        await User.findByIdAndUpdate(
            userId,
            {
                // unset is used to remove this field from mongo, it is better than set refrehToken to null or undef
                $unset: {
                    refreshToken: 1,
                },
            },
            {
                new: true,
            }
        );

        const options = {
            httpOnly: true,  // Cannot be accessed via JavaScript (only sent with HTTP requests)
            secure: process.env.NODE_ENV === 'production', // Set to true only in production (for HTTPS)
            sameSite: 'None', // Allows cross-origin cookie transmission (important for cross-origin requests)
        };
        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({
                status: 200,
                message: "User logged out successfully",
                success: true,
            });
    } catch (error) {
        return res.status(403).json({
            message: "Error while logging out a user",
            error: error.message,
            status: 403,
            success: false,
        });
    }
};


const getMe = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select("-refreshToken");
        return res.status(200).json({
            status: 200,
            data: user,
            message: "User details fetched successfully",
            success: true,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
            status: 500,
            success: false,
        });
    }
};

const putData = async (req, res) => {
    try {
        const userId = req.user._id;
        const allowed = [
            "phoneNumber",
            "interests",
            "incomeGroup",
            "state",
            "age",
            "gender",
        ];
        const payload = {};
        for (const key of allowed) {
            if (key in req.body) payload[key] = req.body[key];
        }

        const user = await User.findByIdAndUpdate(userId, payload, {
            new: true,
        }).select("-refreshToken");

        return res.status(200).json({
            status: 200,
            data: user,
            message: "User details updated successfully",
            success: true,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
            status: 500,
            success: false,
        });
    }
};


export { refreshAccessToken, logout, getMe, putData };
