/**
 * Legacy v1 scheme shape (separate collection) — used by /api/v1/schemes legacy routes.
 */
import mongoose from "mongoose";

const schemeLegacySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            minlength: [2, "Title must be at least 2 characters"],
            maxlength: [300, "Title cannot exceed 300 characters"],
        },
        objective: {
            type: String,
            required: [true, "Objective is required"],
            trim: true,
            maxlength: [5000, "Objective is too long"],
        },
        keyFeatures: {
            type: [String],
            required: [true, "At least one key feature is required"],
            validate: {
                validator: (v) => Array.isArray(v) && v.length > 0 && v.length <= 50,
                message: "Provide 1–50 key features",
            },
        },
        howToApply: {
            online: { type: String, trim: true, maxlength: 2000 },
            offline: { type: String, trim: true, maxlength: 2000 },
        },
        documentsRequired: {
            type: [String],
            required: true,
            default: [],
            validate: {
                validator: (v) => Array.isArray(v) && v.length <= 100,
                message: "Too many document entries",
            },
        },
        tags: {
            type: [String],
            required: [true, "At least one tag is required"],
            validate: {
                validator: (v) => Array.isArray(v) && v.length > 0 && v.length <= 40,
                message: "Provide 1–40 tags",
            },
        },
        level: {
            type: String,
            enum: {
                values: ["central", "state"],
                message: "{VALUE} is not a valid level",
            },
            required: true,
        },
        ministry: {
            type: String,
            trim: true,
            required: [true, "Ministry is required"],
            maxlength: 200,
        },
        category: {
            incomeGroup: {
                type: [String],
                enum: {
                    values: ["EWS", "General", "OBC", "SC", "ST"],
                    message: "Invalid income group in category",
                },
                required: [true, "Income group category is required"],
            },
            gender: {
                type: [String],
                enum: {
                    values: ["male", "female", "other"],
                    message: "Invalid gender in category",
                },
                required: [true, "Gender category is required"],
            },
        },
        state: {
            type: [String],
            required: [true, "State list is required"],
            validate: {
                validator: (v) => Array.isArray(v) && v.length > 0,
                message: "At least one state or region entry is required",
            },
        },
    },
    { timestamps: true }
);

const SchemeLegacy = mongoose.model("Scheme", schemeLegacySchema);

export default SchemeLegacy;
