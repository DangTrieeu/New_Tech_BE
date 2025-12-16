const { getQdrantClient } = require("../configs/qdrant");

class QdrantService {
  constructor() {
    this.client = null;
    this.collectionName = "ai_chat_cache";
    this.initialized = false;
    this.vectorSize = 1024; // Cohere embed-multilingual-v3.0 dimension
  }

  async initialize() {
    if (this.initialized) return;

    try {
      this.client = getQdrantClient();

      const collections = await this.client.getCollections();
      const exists = collections.collections.some(
        (col) => col.name === this.collectionName
      );

      if (!exists) {
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: this.vectorSize,
            distance: "Cosine",
          },
        });
      } else {
        // Collection loaded
      }

      this.initialized = true;
    } catch (error) {
      console.error("Qdrant initialization error:", error);
      throw error;
    }
  }

  async addQA(id, question, answer, embedding) {
    await this.initialize();

    try {
      await this.client.upsert(this.collectionName, {
        points: [
          {
            id: id,
            vector: embedding,
            payload: {
              question: question,
              answer: answer,
              created_at: new Date().toISOString(),
              hit_count: 1,
            },
          },
        ],
      });
    } catch (error) {
      console.error("Qdrant add error:", error);
      throw error;
    }
  }

  async searchSimilar(embedding, limit = 1) {
    await this.initialize();

    try {
      const results = await this.client.search(this.collectionName, {
        vector: embedding,
        limit: limit,
        with_payload: true,
      });

      if (!results || results.length === 0) {
        return null;
      }

      const topResult = results[0];
      return {
        id: topResult.id,
        score: topResult.score,
        similarity: topResult.score,
        question: topResult.payload.question,
        answer: topResult.payload.answer,
        hitCount: topResult.payload.hit_count || 1,
        createdAt: topResult.payload.created_at,
      };
    } catch (error) {
      console.error("Qdrant search error:", error);
      return null;
    }
  }

  async updateHitCount(id, newHitCount) {
    await this.initialize();

    try {
      await this.client.setPayload(this.collectionName, {
        points: [id],
        payload: {
          hit_count: newHitCount,
        },
      });
    } catch (error) {
      console.error("Qdrant update hit count error:", error);
    }
  }

  async count() {
    await this.initialize();

    try {
      const info = await this.client.getCollection(this.collectionName);
      return info.points_count || 0;
    } catch (error) {
      console.error("Qdrant count error:", error);
      return 0;
    }
  }

  async clearAll() {
    await this.initialize();

    try {
      await this.client.deleteCollection(this.collectionName);

      await this.client.createCollection(this.collectionName, {
        vectors: {
          size: this.vectorSize,
          distance: "Cosine",
        },
      });

      console.log("Qdrant collection cleared and recreated");
    } catch (error) {
      console.error("Qdrant clear error:", error);
      throw error;
    }
  }

  async getAll(limit = 100) {
    await this.initialize();

    try {
      const results = await this.client.scroll(this.collectionName, {
        limit: limit,
        with_payload: true,
      });

      if (!results || !results.points) {
        return [];
      }

      return results.points.map((point) => ({
        id: point.id,
        question: point.payload.question,
        answer: point.payload.answer,
        hitCount: point.payload.hit_count || 1,
        createdAt: point.payload.created_at,
      }));
    } catch (error) {
      console.error("Qdrant getAll error:", error);
      return [];
    }
  }
}

module.exports = new QdrantService();
