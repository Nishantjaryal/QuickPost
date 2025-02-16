const mongoose = require("mongoose");
const colors = require("colors")

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }

        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`.green.bold);
    } catch (err) {
        console.error(`Error at config.js: ${err.message}`);
        process.exit(1); // Exit with failure
    }
};

// Handle app termination
process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("MongoDB disconnected on app termination");
    process.exit(0);  // Exit with termination
});

module.exports = connectDB;
