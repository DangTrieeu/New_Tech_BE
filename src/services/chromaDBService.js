const { ChromaClient } = require("chromadb");
const path = require("path");

class ChromaDBService {
  constructor() {
    this.client = null;
    this.collection = null;
    this.collectionName = "ai_chat_cache";
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Tạo client với file-based storage
      this.client = new ChromaClient({
        path: path.join(process.cwd(), "chroma_data"), // Lưu local
      });

      // Tạo hoặc lấy collection
      try {
        this.collection = await this.client.getCollection({
          name: this.collectionName,
        });
        console.log(`✅ ChromaDB collection "${this.collectionName}" loaded`);
      } catch (error) {
        // Collection chưa tồn tại, tạo mới
        this.collection = await this.client.createCollection({
          name: this.collectionName,
          metadata: { description: "AI chat question-answer cache" },
        });
        console.log(`✅ ChromaDB collection "${this.collectionName}" created`);
      }

      this.initialized = true;
    } catch (error) {
      console.error("❌ ChromaDB initialization error:", error);
      throw error;
    }
  }

  async addQA(id, question, answer, embedding) {
    await this.initialize();

    try {
      await this.collection.add({
        ids: [id],
        embeddings: [embedding],
        documents: [question], // Lưu câu hỏi để tìm kiếm
        metadatas: [
          {
            answer: answer,
            question: question,
            created_at: new Date().toISOString(),
            hit_count: 1,
          },
        ],
      });

      console.log(`✅ Added to ChromaDB: "${question.substring(0, 50)}..."`);
    } catch (error) {
      console.error("ChromaDB add error:", error);
      throw error;
    }
  }

  async searchSimilar(embedding, nResults = 1) {
    await this.initialize();

    try {
      const results = await this.collection.query({
        queryEmbeddings: [embedding],
        nResults: nResults,
      });

      // Kiểm tra có kết quả không
      if (
        !results ||
        !results.ids ||
        !results.ids[0] ||
        results.ids[0].length === 0
      ) {
        return null;
      }

      // Lấy kết quả đầu tiên
      const topResult = {
        id: results.ids[0][0],
        distance: results.distances[0][0],
        similarity: 1 - results.distances[0][0], // ChromaDB trả về distance, convert sang similarity
        question: results.metadatas[0][0].question,
        answer: results.metadatas[0][0].answer,
        hitCount: results.metadatas[0][0].hit_count || 1,
        createdAt: results.metadatas[0][0].created_at,
      };

      return topResult;
    } catch (error) {
      console.error("ChromaDB search error:", error);
      return null;
    }
  }

  async updateHitCount(id, newHitCount) {
    await this.initialize();

    try {
      // ChromaDB không hỗ trợ update metadata trực tiếp
      // Phải get -> delete -> add lại
      const result = await this.collection.get({
        ids: [id],
      });

      if (result && result.ids && result.ids.length > 0) {
        const metadata = result.metadatas[0];
        metadata.hit_count = newHitCount;

        // Delete old entry
        await this.collection.delete({
          ids: [id],
        });

        // Add updated entry
        await this.collection.add({
          ids: [id],
          embeddings: result.embeddings[0],
          documents: result.documents[0],
          metadatas: [metadata],
        });
      }
    } catch (error) {
      console.error("ChromaDB update hit count error:", error);
      // Không throw để không ảnh hưởng main flow
    }
  }

  async count() {
    await this.initialize();

    try {
      const result = await this.collection.count();
      return result;
    } catch (error) {
      console.error("ChromaDB count error:", error);
      return 0;
    }
  }

  async clearAll() {
    await this.initialize();

    try {
      await this.client.deleteCollection({
        name: this.collectionName,
      });

      // Tạo lại collection mới
      this.collection = await this.client.createCollection({
        name: this.collectionName,
        metadata: { description: "AI chat question-answer cache" },
      });

      console.log("🗑️ ChromaDB collection cleared and recreated");
    } catch (error) {
      console.error("ChromaDB clear error:", error);
      throw error;
    }
  }

  async getAll(limit = 100) {
    await this.initialize();

    try {
      const result = await this.collection.get({
        limit: limit,
      });

      if (!result || !result.ids || result.ids.length === 0) {
        return [];
      }

      return result.metadatas.map((metadata, index) => ({
        id: result.ids[index],
        question: metadata.question,
        answer: metadata.answer,
        hitCount: metadata.hit_count || 1,
        createdAt: metadata.created_at,
      }));
    } catch (error) {
      console.error("ChromaDB getAll error:", error);
      return [];
    }
  }
}

module.exports = new ChromaDBService();
