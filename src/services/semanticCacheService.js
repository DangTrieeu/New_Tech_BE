const chromaDBService = require("./chromaDBService");
const cohereService = require("./cohereService");

class SemanticCacheService {
  constructor() {
    this.SIMILARITY_THRESHOLD = 0.85; // Ngưỡng để coi là câu hỏi tương tự
  }

  async findSimilarQuestion(question) {
    try {
      // 1. Tạo embedding cho câu hỏi
      const questionEmbedding = await cohereService.createEmbedding(question);

      // 2. Search trong ChromaDB
      const result = await chromaDBService.searchSimilar(questionEmbedding, 1);

      if (!result) {
        return null;
      }

      // 3. Kiểm tra threshold
      if (result.similarity >= this.SIMILARITY_THRESHOLD) {
        // Cache hit! Tăng hit_count
        const newHitCount = result.hitCount + 1;
        await chromaDBService.updateHitCount(result.id, newHitCount);

        return {
          question: result.question,
          answer: result.answer,
          similarity: result.similarity,
          hitCount: newHitCount,
          isCached: true,
        };
      }

      return null;
    } catch (error) {
      console.error("Semantic Cache Search Error:", error);
      return null; // Fallback: không dùng cache nếu có lỗi
    }
  }

  async saveToCache(question, answer) {
    try {
      // 1. Tạo embedding cho câu hỏi
      const embedding = await cohereService.createEmbedding(question);

      // 2. Tạo unique ID
      const id = `qa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 3. Lưu vào ChromaDB
      await chromaDBService.addQA(id, question, answer, embedding);

      console.log(`✅ Cached new Q&A: "${question.substring(0, 50)}..."`);
    } catch (error) {
      console.error("Save to Cache Error:", error);
      // Không throw error để không ảnh hưởng main flow
    }
  }

  async clearCache() {
    await chromaDBService.clearAll();
    console.log("🗑️ Cache cleared");
  }

  async getCacheStats() {
    try {
      const totalEntries = await chromaDBService.count();
      const allEntries = await chromaDBService.getAll(1000);

      // Tính tổng hits
      const totalHits = allEntries.reduce((sum, entry) => sum + entry.hitCount, 0);

      // Sắp xếp theo hit count
      const topQuestions = allEntries
        .sort((a, b) => b.hitCount - a.hitCount)
        .slice(0, 10)
        .map((entry) => ({
          question: entry.question,
          hit_count: entry.hitCount,
          created_at: entry.createdAt,
        }));

      return {
        totalEntries,
        totalHits,
        avgHitPerEntry: totalEntries > 0 ? (totalHits / totalEntries).toFixed(2) : 0,
        topQuestions,
        storageType: "ChromaDB (Vector Database)",
      };
    } catch (error) {
      console.error("Get Cache Stats Error:", error);
      return {
        totalEntries: 0,
        totalHits: 0,
        avgHitPerEntry: 0,
        topQuestions: [],
        error: error.message,
      };
    }
  }
}

module.exports = new SemanticCacheService();
