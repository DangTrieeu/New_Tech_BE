module.exports = (sequelize, DataTypes) => {
    const UserRoom = sequelize.define(
        "UserRoom",
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            user_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            room_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            create_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: "user_rooms",
            timestamps: false,
        }
    );

    return UserRoom;
};
