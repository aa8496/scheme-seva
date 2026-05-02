import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 10;

/** RFC-style local part; allows common TLD lengths */
const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [120, "Name is too long"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: [254, "Email is too long"],
            match: [emailRegex, "Please enter a valid email address"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            maxlength: [128, "Password is too long"],
            select: false,
            validate: {
                validator(v) {
                    if (typeof v !== "string") return false;
                    if (v.length < 6) return false;
                    return v.trim().length === v.length;
                },
                message: "Password cannot be only whitespace or shorter than 6 characters",
            },
        },
        role: {
            type: String,
            enum: {
                values: ["user", "admin"],
                message: "{VALUE} is not a valid role (use user or admin)",
            },
            default: "user",
            required: [true, "Role is required"],
        },
        refreshToken: {
            type: String,
            default: null,
            select: false,
        },
        phoneNumber: {
            type: String,
            trim: true,
            maxlength: 20,
            validate: {
                validator(v) {
                    if (!v) return true;
                    return /^[+0-9()\-\s]{7,20}$/.test(v);
                },
                message: "Invalid phone number format",
            },
        },
        interests: {
            type: [String],
            default: [],
            validate: {
                validator(v) {
                    if (!Array.isArray(v) || v.length > 50) return false;
                    return v.every((s) => typeof s === "string" && s.length <= 100);
                },
                message: "Too many interests or an entry is too long",
            },
        },
        incomeGroup: {
            type: String,
            enum: {
                values: ["EWS", "General", "OBC", "SC", "ST"],
                message: "{VALUE} is not a valid income group",
            },
        },
        state: {
            type: String,
            trim: true,
            maxlength: 120,
        },
        age: {
            type: Number,
            min: [0, "Age cannot be negative"],
            max: [120, "Age is out of range"],
            validate: {
                validator(v) {
                    if (v == null) return true;
                    return Number.isInteger(v);
                },
                message: "Age must be a whole number",
            },
        },
        favorites: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Schemesv2" }],
            default: [],
            validate: {
                validator(v) {
                    return Array.isArray(v) && v.length <= 500;
                },
                message: "Too many favorite schemes",
            },
        },
        gender: {
            type: String,
            enum: {
                values: ["male", "female", "other"],
                message: "{VALUE} is not a valid gender",
            },
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    try {
        if (this.isModified("password")) {
            this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
        }
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.isPasswordCorrect = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name,
            role: this.role,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

const User = mongoose.model("User", userSchema);

export default User;
