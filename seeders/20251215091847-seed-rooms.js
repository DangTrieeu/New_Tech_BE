"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1️⃣ Lấy toàn bộ user id
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (users.length < 3) {
      throw new Error("Need at least 3 users to seed rooms");
    }

    const userIds = users.map(u => u.id);

    // Helper random
    const randomInt = (min, max) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());

    // 2️⃣ Tạo 10 rooms
    const rooms = [];
    for (let i = 1; i <= 10; i++) {
      const memberCount = randomInt(3, 6);
      const members = shuffle(userIds).slice(0, memberCount);

      rooms.push({
        name: `Room ${i}`,
        type: "GROUP",
        created_by: members[0], // creator là 1 member
        created_at: new Date(),
        __members: members, // lưu tạm để dùng bước sau
      });
    }

    // Insert rooms
    await queryInterface.bulkInsert(
      "rooms",
      rooms.map(({ __members, ...room }) => room)
    );

    // 3️⃣ Lấy lại room id vừa insert
    const insertedRooms = await queryInterface.sequelize.query(
      `SELECT id FROM rooms ORDER BY id DESC LIMIT 10`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Vì lấy DESC nên đảo lại cho đúng thứ tự
    insertedRooms.reverse();

    // 4️⃣ Tạo user_rooms
    const userRooms = [];

    insertedRooms.forEach((room, index) => {
      const members = rooms[index].__members;

      members.forEach(userId => {
        userRooms.push({
          user_id: userId,
          room_id: room.id,
          create_at: new Date(),
        });
      });
    });

    await queryInterface.bulkInsert("user_rooms", userRooms);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("user_rooms", null, {});
    await queryInterface.bulkDelete("rooms", null, {});
  },
};
