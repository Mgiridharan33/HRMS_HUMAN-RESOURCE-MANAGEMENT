const mongoose = require("mongoose");
const Employee = require("../models/Employee");

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI);

        console.log(
            `MongoDB Connected: ${connection.connection.host}`
        );

        await Employee.syncIndexes();

        console.log(
            "Employee indexes synchronized"
        );
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;