import mongoose from "mongoose";

/**
 * MongoDB Atlas — set in Backend/.env (never commit real credentials):
 *
 * MONGO_URI=mongodb+srv://<username>:<password>@<cluster-host>/<database>?retryWrites=true&w=majority
 *
 * Atlas: Network Access → allow your IP (or 0.0.0.0/0 for dev only).
 * Database Access → create a DB user with password URL-encoded if it contains special characters.
 */

const atlasOptions = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
};

function registerConnectionEvents() {
    mongoose.connection.on("connected", () => {
        console.log(`Mongoose connected (host: ${mongoose.connection.host})`);
    });

    mongoose.connection.on("error", (err) => {
        console.error("Mongoose connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
        console.warn("Mongoose disconnected from MongoDB");
    });
}

/**
 * Connects to MongoDB Atlas via Mongoose using MONGO_URI.
 */
export async function connectDatabase() {
    const uri = process.env.MONGO_URI;

    if (!uri || !uri.trim()) {
        console.error("MONGO_URI is missing. Add your Atlas connection string to .env");
        process.exit(1);
    }

    if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
        console.error("MONGO_URI must start with mongodb:// or mongodb+srv://");
        process.exit(1);
    }

    registerConnectionEvents();

    try {
        await mongoose.connect(uri, atlasOptions);
        console.log("MongoDB Atlas connection ready");
    } catch (error) {
        console.error("Could not connect to MongoDB Atlas:", error.message);
        process.exit(1);
    }
}

export default connectDatabase;
