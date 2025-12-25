'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Thêm cột reply_to_message_id
        await queryInterface.addColumn('messages', 'reply_to_message_id', {
            type: Sequelize.BIGINT,
            allowNull: true,
            references: {
                model: 'messages',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            comment: 'ID của tin nhắn được trả lời',
        });

        // Thêm cột is_recalled
        await queryInterface.addColumn('messages', 'is_recalled', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
            comment: 'Đánh dấu tin nhắn đã bị thu hồi',
        });

        // Thêm cột recalled_at
        await queryInterface.addColumn('messages', 'recalled_at', {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'Thời gian thu hồi tin nhắn',
        });

        // Thêm index cho reply_to_message_id để tăng performance khi query
        await queryInterface.addIndex('messages', ['reply_to_message_id'], {
            name: 'idx_messages_reply_to_message_id',
        });

        // Thêm index cho is_recalled để filter tin nhắn đã thu hồi
        await queryInterface.addIndex('messages', ['is_recalled'], {
            name: 'idx_messages_is_recalled',
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Xóa indexes trước
        await queryInterface.removeIndex('messages', 'idx_messages_is_recalled');
        await queryInterface.removeIndex('messages', 'idx_messages_reply_to_message_id');

        // Xóa các cột
        await queryInterface.removeColumn('messages', 'recalled_at');
        await queryInterface.removeColumn('messages', 'is_recalled');
        await queryInterface.removeColumn('messages', 'reply_to_message_id');
    }
};
