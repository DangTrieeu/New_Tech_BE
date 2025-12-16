const { CohereClient } = require("cohere-ai");

class CohereService {
  constructor() {
    if (!process.env.COHERE_API_KEY) {
      throw new Error("COHERE_API_KEY is not defined in environment variables");
    }

    this.cohere = new CohereClient({
      token: process.env.COHERE_API_KEY,
    });

    // Model embedding của Cohere
    this.embeddingModel = "embed-multilingual-v3.0"; // Hỗ trợ tiếng Việt
  }

  async createEmbedding(text) {
    try {
      const response = await this.cohere.embed({
        texts: [text],
        model: this.embeddingModel,
        inputType: "search_query", // Cho search queries
      });

      return response.embeddings[0];
    } catch (error) {
      console.error("Cohere Embedding Error:", error);
      throw new Error("Lỗi khi tạo embedding: " + error.message);
    }
  }

  async createBatchEmbeddings(texts) {
    try {
      const response = await this.cohere.embed({
        texts,
        model: this.embeddingModel,
        inputType: "search_document", // Cho documents
      });

      return response.embeddings;
    } catch (error) {
      console.error("Cohere Batch Embedding Error:", error);
      throw new Error("Lỗi khi tạo batch embeddings: " + error.message);
    }
  }

  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
      throw new Error("Vectors must have the same length");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

module.exports = new CohereService();
