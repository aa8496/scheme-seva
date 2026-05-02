import User from "../models/user.model.js";

export const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const accessToken = await user.generateAccessToken();
        const newRefreshToken = await user.generateRefreshToken();

        await User.findByIdAndUpdate(userId, { refreshToken: newRefreshToken });
        return { accessToken, newRefreshToken };
    } catch (error) {
        console.error("Error generating access and refresh tokens:", error);
        throw new Error("Internal server error");
    }
};
