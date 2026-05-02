import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const { Schema, model } = mongoose;

const referenceSchema = new Schema(
    {
        title: { type: String, trim: true, maxlength: 500 },
        url: {
            type: String,
            trim: true,
            maxlength: 2048,
            validate: {
                validator(v) {
                    if (!v) return true;
                    try {
                        const u = new URL(v);
                        return ["http:", "https:"].includes(u.protocol);
                    } catch {
                        return false;
                    }
                },
                message: "Reference URL must be a valid http(s) URL",
            },
        },
    },
    { _id: false }
);

const faqSchema = new Schema(
    {
        question: { type: String, required: true, trim: true, maxlength: 500 },
        answer: { type: String, required: true, trim: true, maxlength: 5000 },
    },
    { _id: false }
);

const applicationStepSchema = new Schema(
    {
        mode: {
            type: String,
            required: [true, "Application mode is required"],
            trim: true,
            maxlength: 200,
        },
        process: { type: Schema.Types.Mixed },
    },
    { _id: false }
);

const schemeCatalogSchema = new Schema(
    {
        openDate: { type: Date, default: null },
        closeDate: { type: Date, default: null },
        state: {
            type: String,
            default: null,
            trim: true,
            maxlength: 200,
        },
        nodalMinistryName: {
            type: Schema.Types.Mixed,
            default: null,
            validate: {
                validator(v) {
                    if (v == null) return true;
                    if (typeof v === "string") return v.length <= 300;
                    if (typeof v === "object" && v !== null && "label" in v) {
                        return (
                            v.label == null ||
                            (typeof v.label === "string" && v.label.length <= 300)
                        );
                    }
                    return false;
                },
                message: "nodalMinistryName must be a string or { label: string }",
            },
        },
        schemeName: {
            type: String,
            required: [true, "Scheme name is required"],
            trim: true,
            minlength: [2, "Scheme name is too short"],
            maxlength: [500, "Scheme name is too long"],
        },
        schemeShortTitle: {
            type: String,
            required: [true, "Short title is required"],
            trim: true,
            minlength: [2, "Short title is too short"],
            maxlength: [500, "Short title is too long"],
        },
        tags: {
            type: [String],
            default: [],
            validate: {
                validator(v) {
                    if (!Array.isArray(v) || v.length > 80) return false;
                    return v.every((t) => typeof t === "string" && t.length <= 100);
                },
                message: "Invalid tags (max 80, each ≤100 chars)",
            },
        },
        level: {
            type: String,
            enum: {
                values: ["Central", "State", "State/ UT"],
                message: "{VALUE} is not a valid scheme level",
            },
        },
        schemeCategory: {
            type: [String],
            default: [],
            validate: {
                validator(v) {
                    if (!Array.isArray(v) || v.length > 50) return false;
                    return v.every((c) => typeof c === "string" && c.length <= 120);
                },
                message: "Invalid scheme categories",
            },
        },
        references: { type: [referenceSchema], default: [] },
        detailedDescription_md: {
            type: String,
            default: "",
            maxlength: [200_000, "Description is too long"],
        },
        applicationProcess: {
            type: [applicationStepSchema],
            default: [],
        },
        eligibilityDescription_md: {
            type: String,
            default: "",
            maxlength: [200_000, "Eligibility text is too long"],
        },
        benefits: [{ type: Schema.Types.Mixed }],
        faqs: { type: [faqSchema], default: [] },
        documents_required: [{ type: Schema.Types.Mixed }],
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

schemeCatalogSchema.pre("validate", function (next) {
    if (this.openDate && this.closeDate && this.closeDate < this.openDate) {
        this.invalidate("closeDate", "Close date cannot be before open date");
    }
    next();
});

schemeCatalogSchema.plugin(mongoosePaginate);

schemeCatalogSchema.index({ schemeName: "text", schemeShortTitle: "text" });
schemeCatalogSchema.index({ state: 1, level: 1 });
schemeCatalogSchema.index({ tags: 1 });
schemeCatalogSchema.index({ schemeCategory: 1 });

/**
 * Registered as "Schemesv2" to match existing collections and refs (User.favorites, Application.scheme).
 * Use named export `Scheme` for clearer semantics in new code.
 */
const Schemev2 = mongoose.models.Schemesv2 || model("Schemesv2", schemeCatalogSchema);

export default Schemev2;
export { Schemev2 as Scheme };
