import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import bcrypt from "bcrypt";

dotenv.config();

const MongoDB_URI = process.env.MONGO_URI;

const seedAdmin = async () => {
    try {
        await mongoose.connect(MongoDB_URI);
        console.log("Connected to MongoDB");
//on va vérifier s'il existe déja un admin sion on va le créer
        const existingAdmin = await User.findOne({ role: "admin" });
        if (existingAdmin) {
            console.log("Admin user already exists.");
            return;
        }
        const passwordHash = await bcrypt.hash('password', 10);
        const admin = new User({
            name: "Admin",
            email: "admin@test.com",
            passwordHash,
            role: "admin",
            mustChangePassword: false,
        });

        await admin.save();
        console.log("Admin user created successfully.");
    } catch (error) {
        console.error("Error seeding admin user:", error);
    } finally {
        mongoose.disconnect();
    }
};

seedAdmin();