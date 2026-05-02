import mongoose from "mongoose";
import User from "../models/user.model.js";
import Schemev2 from "../models/scheme.model.js";
import Application from "../models/application.model.js";

const parsePage = (v, d = 1) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n > 0 ? n : d;
};

export const listUsers = async (req, res) => {
    try {
        const page = parsePage(req.query.page);
        const limit = Math.min(parsePage(req.query.limit, 20), 100);
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            User.find()
                .select("-password -refreshToken")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments(),
        ]);

        return res.status(200).json({
            success: true,
            data: users,
            total,
            page,
            totalPages: Math.ceil(total / limit) || 1,
        });
    } catch (error) {
        console.error("listUsers:", error);
        return res.status(500).json({ success: false, message: "Failed to list users" });
    }
};

export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (!["user", "admin"].includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role" });
        }
        if (String(req.user._id) === String(id)) {
            return res.status(400).json({ success: false, message: "Cannot change your own role here" });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true }
        ).select("-password -refreshToken");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error("updateUserRole:", error);
        return res.status(500).json({ success: false, message: "Failed to update role" });
    }
};

export const listAllSchemes = async (req, res) => {
    try {
        const page = parsePage(req.query.page);
        const limit = Math.min(parsePage(req.query.limit, 20), 100);

        const options = {
            page,
            limit,
            sort: { createdAt: -1 },
        };

        const result = await Schemev2.paginate({}, options);
        return res.status(200).json({
            success: true,
            schemes: result.docs,
            totalPages: result.totalPages,
            currentPage: result.page,
            totalSchemes: result.totalDocs,
        });
    } catch (error) {
        console.error("listAllSchemes:", error);
        return res.status(500).json({ success: false, message: "Failed to list schemes" });
    }
};

export const adminCreateScheme = async (req, res) => {
    try {
        const doc = await Schemev2.create(req.body);
        return res.status(201).json({ success: true, data: doc });
    } catch (error) {
        console.error("adminCreateScheme:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Invalid scheme data",
        });
    }
};

export const adminUpdateScheme = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid id" });
        }

        const doc = await Schemev2.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!doc) {
            return res.status(404).json({ success: false, message: "Scheme not found" });
        }

        return res.status(200).json({ success: true, data: doc });
    } catch (error) {
        console.error("adminUpdateScheme:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Update failed",
        });
    }
};

export const adminDeactivateScheme = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await Schemev2.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );
        if (!doc) {
            return res.status(404).json({ success: false, message: "Scheme not found" });
        }
        return res.status(200).json({ success: true, data: doc, message: "Scheme deactivated" });
    } catch (error) {
        console.error("adminDeactivateScheme:", error);
        return res.status(500).json({ success: false, message: "Failed to deactivate scheme" });
    }
};

export const listAllApplications = async (req, res) => {
    try {
        const page = parsePage(req.query.page);
        const limit = Math.min(parsePage(req.query.limit, 20), 100);
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            Application.find()
                .populate("user", "name email phoneNumber")
                .populate("scheme", "schemeName schemeShortTitle state level")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Application.countDocuments(),
        ]);

        return res.status(200).json({
            success: true,
            data,
            total,
            page,
            totalPages: Math.ceil(total / limit) || 1,
        });
    } catch (error) {
        console.error("listAllApplications:", error);
        return res.status(500).json({ success: false, message: "Failed to list applications" });
    }
};

export const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNote } = req.body;

        const allowed = ["pending", "under_review", "approved", "rejected"];
        if (status && !allowed.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const update = {};
        if (status) update.status = status;
        if (adminNote !== undefined) {
            update.adminNote = String(adminNote).slice(0, 2000);
        }

        const doc = await Application.findByIdAndUpdate(id, update, { new: true })
            .populate("user", "name email")
            .populate("scheme", "schemeName schemeShortTitle");

        if (!doc) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }

        return res.status(200).json({ success: true, data: doc });
    } catch (error) {
        console.error("updateApplicationStatus:", error);
        return res.status(500).json({ success: false, message: "Failed to update application" });
    }
};
