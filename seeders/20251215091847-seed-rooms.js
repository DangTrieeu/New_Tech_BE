"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Lấy danh sách user
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (users.length === 0) {
      console.log("No users found to seed rooms.");
      return;
    }

    const userIds = users.map(u => u.id);

    // 2. Kiểm tra đã có room nào chưa
    const existingRooms = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM rooms`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingRooms[0].count > 0) {
      console.log("Rooms already exist. Skipping seeding.");
      return;
    }

    // 3. Chuẩn bị dữ liệu phòng AI_PRIVATE cho TẤT CẢ user
    const aiRooms = userIds.map(userId => ({
      name: "AI Assistant",
      type: "AI_PRIVATE",
      created_by: userId,
      created_at: new Date()
    }));

    // 4. Chuẩn bị dữ liệu phòng GROUP (Random)
    const groupRooms = [];
    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());

    for (let i = 1; i <= 10; i++) {
      const memberCount = randomInt(3, 6);
      const members = shuffle(userIds).slice(0, memberCount);

      groupRooms.push({
        name: `Group Room ${i}`,
        type: "GROUP",
        created_by: members[0],
        created_at: new Date()
      });
    }

    // 5. Insert Rooms
    // Insert AI Rooms
    await queryInterface.bulkInsert('rooms', aiRooms);
    // Insert Group Rooms
    await queryInterface.bulkInsert('rooms', groupRooms);

    // 6. Tạo liên kết User - Room (user_rooms)

    // 6a. Lấy lại ID các phòng vừa tạo
    const allAiRooms = await queryInterface.sequelize.query(
      `SELECT id, created_by FROM rooms WHERE type = 'AI_PRIVATE'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const allGroupRooms = await queryInterface.sequelize.query(
      `SELECT id FROM rooms WHERE type = 'GROUP'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const userRoomsData = [];

    // 6b. Link AI Rooms: Chỉ có creator tham gia
    allAiRooms.forEach(room => {
      userRoomsData.push({
        user_id: room.created_by,
        room_id: room.id,
        create_at: new Date()
      });
    });

    // 6c. Link Group Rooms: Random thành viên
    allGroupRooms.forEach(room => {
      const memberCount = randomInt(3, 6);
      const members = shuffle(userIds).slice(0, memberCount);

      members.forEach(userId => {
        userRoomsData.push({
          user_id: userId,
          room_id: room.id,
          create_at: new Date()
        });
      });
    });

    // 7. Insert user_rooms
    if (userRoomsData.length > 0) {
      await queryInterface.bulkInsert('user_rooms', userRoomsData);
    }

    console.log(`Seeded rooms: ${allAiRooms.length} AI Private, ${allGroupRooms.length} Groups.`);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("user_rooms", null, {});
    await queryInterface.bulkDelete("rooms", null, {});
  }
};
