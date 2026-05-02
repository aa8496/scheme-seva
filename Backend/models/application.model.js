import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
            index: true,
        },
        scheme: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Schemesv2",
            required: [true, "Scheme reference is required"],
            index: true,
        },
        status: {
            type: String,
            enum: {
                values: ["Submitted", "under_review", "approved", "rejected"],
                message: "{VALUE} is not a valid application status",
            },
            default: "Submitted",
        },
        applicantNote: {
            type: String,
            default: "",
            maxlength: [2000, "Applicant note is too long"],
            trim: true,
        },
        adminNote: {
            type: String,
            default: "",
            maxlength: [2000, "Admin note is too long"],
            trim: true,
        },
    },
    { timestamps: true }
);

applicationSchema.index({ user: 1, scheme: 1 }, { unique: true });
applicationSchema.index({ status: 1, createdAt: -1 });
applicationSchema.index({ scheme: 1, createdAt: -1 });

const Application = mongoose.model("Application", applicationSchema);

export default Application;
