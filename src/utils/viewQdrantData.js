const qdrantService = require("../services/qdrantService");

async function viewQdrantData() {
  try {
    console.log("Dang khoi tao Qdrant...\n");
    await qdrantService.initialize();

    const count = await qdrantService.count();
    console.log(`Tong so entries: ${count}\n`);

    if (count === 0) {
      console.log("Database trong, chua co du lieu.\n");
      return;
    }

    console.log("Danh sach Q&A trong cache:\n");
    console.log("=".repeat(80));

    const allEntries = await qdrantService.getAll(1000);

    allEntries.forEach((entry, index) => {
      console.log(`\n[${index + 1}] ID: ${entry.id}`);
      console.log(`   Created: ${new Date(entry.createdAt).toLocaleString('vi-VN')}`);
      console.log(`   Hit Count: ${entry.hitCount}`);
      console.log(`   Question: ${entry.question}`);
      console.log(`   Answer: ${entry.answer.substring(0, 100)}${entry.answer.length > 100 ? '...' : ''}`);
      console.log("-".repeat(80));
    });

    console.log("\n\nThong ke:");
    const topHits = allEntries
      .sort((a, b) => b.hitCount - a.hitCount)
      .slice(0, 5);

    console.log("\nTop 5 cau hoi duoc cache hit nhieu nhat:");
    topHits.forEach((entry, index) => {
      console.log(`   ${index + 1}. [${entry.hitCount} hits] ${entry.question}`);
    });

    const totalHits = allEntries.reduce((sum, entry) => sum + entry.hitCount, 0);
    console.log(`\nTong cache hits: ${totalHits}`);
    console.log(`Trung binh hits/entry: ${(totalHits / count).toFixed(2)}\n`);

  } catch (error) {
    console.error("Loi:", error.message);
  }
}

viewQdrantData();
