import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Schemev2 from "../models/scheme.model.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/scheme-seva";

async function seed() {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@scheme-seva.gov.in";
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin@123";

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
        admin = await User.create({
            name: "Portal Admin",
            email: adminEmail,
            password: adminPassword,
            role: "admin",
        });
        console.log("Created admin:", adminEmail);
    } else {
        console.log("Admin already exists:", adminEmail);
    }

    const count = await Schemev2.countDocuments();
    if (count === 0) {
        await Schemev2.insertMany([
            {
                schemeName: "PM-KISAN Samman Nidhi",
                schemeShortTitle: "PM-KISAN",
                state: "All India",
                level: "Central",
                nodalMinistryName: { label: "Ministry of Agriculture" },
                tags: ["farmer", "income support"],
                schemeCategory: ["Agriculture", "Income"],
                detailedDescription_md:
                    "Direct income support of ₹6000 per year in three equal installments to eligible farmer families.",
                eligibilityDescription_md:
                    "Small and marginal farmer families owning cultivable land as per land records.",
                applicationProcess: [
                    {
                        mode: "Online",
                        process: [
                            "Visit the official PM-KISAN portal",
                            "Register with Aadhaar and land details",
                        ],
                    },
                ],
                benefits: [
                    { title: "Financial support", detail: "₹2000 per installment, 3 times a year" },
                ],
                faqs: [
                    {
                        question: "Who can apply?",
                        answer: "Land-owning farmers as per state land records.",
                    },
                ],
                documents_required: [{ name: "Aadhaar", detail: "Linked bank account" }],
                references: [],
                isActive: true,
            },
            {
                schemeName: "Ayushman Bharat PM-JAY",
                schemeShortTitle: "PM-JAY",
                state: "All India",
                level: "Central",
                nodalMinistryName: { label: "MoHFW" },
                tags: ["health", "insurance"],
                schemeCategory: ["Health", "Social welfare"],
                detailedDescription_md:
                    "Health cover up to ₹5 lakh per family per year for secondary and tertiary care.",
                eligibilityDescription_md:
                    "Families identified as per SECC database for rural and urban criteria.",
                applicationProcess: [
                    {
                        mode: "Empanelled hospital",
                        process: [
                            "Carry PM-JAY e-card or eligibility letter",
                            "Get cashless treatment at empaneled hospitals",
                        ],
                    },
                ],
                benefits: [{ title: "Coverage", detail: "₹5 lakh family floater per year" }],
                faqs: [],
                documents_required: [{ name: "ID proof", detail: "Ration card / Aadhaar" }],
                references: [],
                isActive: true,
            },
        ]);
        console.log("Inserted sample schemes");
    } else {
        console.log("Schemes already present, skipping scheme seed");
    }

    await mongoose.disconnect();
    console.log("Done");
}

seed().catch((e) => {
    console.error(e);
    process.exit(1);
});
