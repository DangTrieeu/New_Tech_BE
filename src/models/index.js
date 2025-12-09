const Sequelize = require("sequelize");
const sequelize = require("../configs/database");

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require("./User")(sequelize, Sequelize.DataTypes);
db.Room = require("./Room")(sequelize, Sequelize.DataTypes);
db.Message = require("./Message")(sequelize, Sequelize.DataTypes);

// Setup associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
