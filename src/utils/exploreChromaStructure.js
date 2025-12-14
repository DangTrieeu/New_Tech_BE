const { ChromaClient } = require("chromadb");
const path = require("path");

async function exploreStructure() {
  try {
    console.log("Exploring ChromaDB Structure...\n");
    
    const client = new ChromaClient({
      path: path.join(process.cwd(), "chroma_data"),
    });

    console.log("ChromaDB Location:", path.join(process.cwd(), "chroma_data"));
    console.log("\n" + "=".repeat(80));

    const collections = await client.listCollections();
    console.log(`\nSo luong collections: ${collections.length}\n`);

    for (const collectionInfo of collections) {
      console.log(`\nCollection: "${collectionInfo.name}"`);
      console.log(`   ID: ${collectionInfo.id}`);
      console.log(`   Metadata:`, collectionInfo.metadata);

      const collection = await client.getCollection({
        name: collectionInfo.name,
      });

      const count = await collection.count();
      console.log(`   So entries: ${count}`);

      if (count > 0) {
        const sample = await collection.get({ limit: 1 });
        
        console.log("\n   Cau truc du lieu (1 entry mau):");
        console.log("   |- ID:", sample.ids[0]);
        console.log("   |- Document:", sample.documents[0]?.substring(0, 50) + "...");
        console.log("   |- Metadata:", JSON.stringify(sample.metadatas[0], null, 6));
        console.log("   |- Embedding: Array[", sample.embeddings[0]?.length || 0, "] (vector dimension)");
      }

      console.log("\n" + "-".repeat(80));
    }

    console.log("\nXong!\n");

  } catch (error) {
    console.error("Loi:", error.message);
  }
}

exploreStructure();
