require("dotenv").config();
const db = require("./src/models");

async function syncDatabase() {
  try {
    console.log("Connecting to database...");
    
    await db.sequelize.sync({ alter: true });
    
    console.log("Database synced successfully!");
    console.log("Tables created/updated:");
    console.log("- users");
    console.log("- rooms");
    console.log("- messages");
    console.log("- userroom (new)");
    
    process.exit(0);
  } catch (error) {
    console.error("Database sync failed:", error);
    process.exit(1);
  }
}

syncDatabase();
