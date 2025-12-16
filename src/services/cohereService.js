const { getCohereClient } = require("../configs/cohere");

class CohereService {
    constructor() {
        this.model = "embed-multilingual-v3.0";
    }

    async createEmbedding(text) {
        try {
            const client = getCohereClient();
            const response = await client.embed({
                texts: [text],
                model: this.model,
                inputType: "search_query",
            });

            if (response.embeddings && response.embeddings.length > 0) {
                return response.embeddings[0];
            }
            throw new Error("Failed to generate embedding");
        } catch (error) {
            console.error("Cohere embedding error:", error);
            throw error;
        }
    }
}

module.exports = new CohereService();
