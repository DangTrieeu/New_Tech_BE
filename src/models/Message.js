module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define(
    "Message",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      room_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: "rooms",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        comment: "AI message thì user_id = NULL",
      },
      reply_to_message_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          model: "messages",
          key: "id",
        },
        comment: "ID của tin nhắn được trả lời",
      },
      type: {
        type: DataTypes.ENUM("TEXT", "IMAGE", "FILE", "AI"),
        defaultValue: "TEXT",
        comment: "Phân biệt text, ảnh, file, AI-generated",
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      file_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "Dùng cho ảnh hoặc file upload",
      },
      is_recalled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "Đánh dấu tin nhắn đã bị thu hồi",
      },
      recalled_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Thời gian thu hồi tin nhắn",
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "messages",
      timestamps: false,
    }
  );

  Message.associate = (models) => {
    Message.belongsTo(models.Room, {
      foreignKey: "room_id",
      as: "room",
    });

    Message.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });

    Message.belongsTo(models.Message, {
      foreignKey: "reply_to_message_id",
      as: "replyToMessage",
    });

    Message.hasMany(models.Message, {
      foreignKey: "reply_to_message_id",
      as: "replies",
    });
  };

  return Message;
};
