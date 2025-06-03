const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");

// Load environment variables
dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/booked";

async function migrateDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if we have a backup and restore it if needed
    const backupPath = "./users_backup.json";
    if (fs.existsSync(backupPath)) {
      console.log("Found users backup, attempting to restore...");
      const backupData = JSON.parse(fs.readFileSync(backupPath, "utf8"));

      if (backupData && backupData.length > 0) {
        const userCollection = mongoose.connection.db.collection("users");
        // Only insert if collection is empty
        const count = await userCollection.countDocuments();
        if (count === 0) {
          await userCollection.insertMany(backupData);
          console.log(`Restored ${backupData.length} users from backup`);
        } else {
          console.log("Users collection already has data, skipping restore");
        }
      }
    } else {
      console.log("No backup file found");
    }

    // Update the schema of existing documents
    const userCollection = mongoose.connection.db.collection("users");
    const users = await userCollection.find({}).toArray();

    // Create a backup before making changes
    if (users.length > 0) {
      fs.writeFileSync("./users_backup.json", JSON.stringify(users, null, 2));
      console.log(`Created backup of ${users.length} users`);
    }

    let migratedCount = 0;
    for (const user of users) {
      if (user.name && !user.firstName && !user.lastName) {
        const nameParts = user.name.split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        await userCollection.updateOne(
          { _id: user._id },
          {
            $set: {
              firstName: firstName,
              lastName: lastName,
            },
            $unset: { name: "" },
          }
        );
        migratedCount++;
      }
    }
    console.log(
      `${migratedCount} users migrated from 'name' to 'firstName/lastName'`
    );

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
}

migrateDatabase();
