import { storage } from "../server/storage";
import mongoose from 'mongoose';
import { configDotenv } from 'dotenv'

configDotenv();

async function seed() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pine-bridge');
        console.log("Connected to MongoDB");

        // Check if admin user exists
        const existingAdmin = await storage.getUserByEmail("admin@pinebridge.com");

        if (!existingAdmin) {
            // Create admin user
            const hashedPassword = await storage.hashPassword("admin123");
            await storage.createUser({
                email: "admin@pinebridge.com",
                password: hashedPassword,
                firstName: "Admin",
                lastName: "User",
                country: "US",
                role: "admin"
            });
            console.log("Admin user created(admin@pinebridge.com/admin123)");
        }

        console.log("Seed completed successfully");
        await mongoose.disconnect();
    } catch (error) {
        console.error("Seed failed:", error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

seed();
