const { getQdrantClient } = require("../configs/qdrant");
require("dotenv").config();

async function exploreQdrantStructure() {
  try {
    console.log("Exploring Qdrant Structure...\n");

    const client = getQdrantClient();

    console.log(
      `Qdrant Server: ${process.env.QDRANT_HOST}:${process.env.QDRANT_PORT}`
    );
    console.log("\n" + "=".repeat(80));

    const { collections } = await client.getCollections();
    console.log(`\nSo luong collections: ${collections.length}\n`);

    for (const collectionInfo of collections) {
      console.log(`\nCollection: "${collectionInfo.name}"`);

      const info = await client.getCollection(collectionInfo.name);
      console.log(`   Vector size: ${info.config.params.vectors.size}`);
      console.log(
        `   Distance metric: ${info.config.params.vectors.distance}`
      );
      console.log(`   Points count: ${info.points_count}`);

      if (info.points_count > 0) {
        const points = await client.scroll(collectionInfo.name, {
          limit: 1,
          with_payload: true,
          with_vector: false,
        });

        if (points.points.length > 0) {
          const sample = points.points[0];
          console.log("\n   Cau truc du lieu (1 entry mau):");
          console.log("   |- ID:", sample.id);
          console.log("   |- Payload:", JSON.stringify(sample.payload, null, 6));
        }
      }

      console.log("\n" + "-".repeat(80));
    }

    console.log("\nXong!\n");
  } catch (error) {
    console.error("Loi:", error.message);
  }
}

exploreQdrantStructure();
