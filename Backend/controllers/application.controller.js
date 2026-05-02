import Application from "../models/application.model.js";
import Schemev2 from "../models/scheme.model.js";

const isSchemeVisible = (scheme) =>
    scheme && scheme.isActive !== false;

export const createApplication = async (req, res) => {
    try {
        const schemeId = req.body.schemeId || req.body.scheme;
        const { applicantNote = "" } = req.body;
        if (!schemeId) {
            return res.status(400).json({
                success: false,
                message: "schemeId (or scheme) is required",
            });
        }

        const scheme = await Schemev2.findById(schemeId);
        if (!isSchemeVisible(scheme)) {
            return res.status(404).json({
                success: false,
                message: "Scheme not found or not available",
            });
        }

        const application = await Application.create({
            user: req.user._id,
            scheme: schemeId,
            applicantNote: String(applicantNote).slice(0, 2000),
        });

        const populated = await Application.findById(application._id)
            .populate("scheme", "schemeName schemeShortTitle state level")
            .lean();

        return res.status(201).json({
            success: true,
            message: "Application submitted successfully",
            data: populated,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "You have already applied for this scheme",
            });
        }
        console.error("createApplication:", error);
        return res.status(500).json({
            success: false,
            message: "Could not submit application",
            error: error.message,
        });
    }
};

export const getMyApplications = async (req, res) => {
    try {
        const list = await Application.find({ user: req.user._id })
            .populate("scheme")
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            data: list,
        });
    } catch (error) {
        console.error("getMyApplications:", error);
        return res.status(500).json({
            success: false,
            message: "Could not load applications",
        });
    }
};
