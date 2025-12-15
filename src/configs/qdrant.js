const { QdrantClient } = require("@qdrant/js-client-rest");

let qdrantClient = null;

const getQdrantClient = () => {
  if (!qdrantClient) {
    qdrantClient = new QdrantClient({
      url: `http://${process.env.QDRANT_HOST}:${process.env.QDRANT_PORT}`,
      apiKey: process.env.QDRANT_API_KEY,
    });
  }
  return qdrantClient;
};

module.exports = { getQdrantClient };
