const { QdrantClient } = require("@qdrant/js-client-rest");

let client = null;

const getQdrantClient = () => {
    if (!client) {
        let url = process.env.QDRANT_URL;

        if (!url && process.env.QDRANT_HOST && process.env.QDRANT_PORT) {
            url = `http://${process.env.QDRANT_HOST}:${process.env.QDRANT_PORT}`;
        }

        if (!url) {
            throw new Error("QDRANT_URL (or QDRANT_HOST and QDRANT_PORT) is not defined in environment variables");
        }

        const options = { url };

        if (process.env.QDRANT_API_KEY) {
            // Bypass security check for HTTP connections by passing key in headers
            if (url.startsWith("http://")) {
                options.headers = { "api-key": process.env.QDRANT_API_KEY };
            } else {
                options.apiKey = process.env.QDRANT_API_KEY;
            }
        }

        client = new QdrantClient(options);
    }
    return client;
};

module.exports = { getQdrantClient };
