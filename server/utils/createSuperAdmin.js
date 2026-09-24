const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const User = require("../models/User");

dotenv.config();

const createSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        const existingAdmin = await User.findOne({
            role: "SUPER_ADMIN",
        });

        if (existingAdmin) {
            console.log("Super Admin already exists");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(
            "Admin@12345",
            12
        );

        const admin = await User.create({
            name: "Super Admin",
            email: "admin@hrms.com",
            password: hashedPassword,
            role: "SUPER_ADMIN",
            isActive: true,
        });

        console.log("Super Admin created successfully");
        console.log("Email:", admin.email);
        console.log("Password: Admin@12345");

        process.exit(0);
    } catch (error) {
        console.error(
            "Error creating Super Admin:",
            error.message
        );

        process.exit(1);
    }
};

createSuperAdmin();