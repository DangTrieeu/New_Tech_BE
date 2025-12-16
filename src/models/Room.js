module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define(
    "Room",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM("PRIVATE", "GROUP", "AI_PRIVATE"),
        allowNull: false,
        comment: "PRIVATE: chat 1-1, GROUP: nhóm 3 người trở lên, AI_PRIVATE: chat riêng với AI",
      },
      created_by: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "rooms",
      timestamps: false,
    }
  );

  Room.associate = (models) => {
    Room.belongsToMany(models.User, {
      through: models.UserRoom,
      foreignKey: "room_id",
      otherKey: "user_id",
      as: "participants",
    });


    Room.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "creator",
    });

    Room.hasMany(models.Message, {
      foreignKey: "room_id",
      as: "messages",
      onDelete: "CASCADE",
    });

  };

  return Room;
};
