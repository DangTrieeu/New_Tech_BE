const { CohereClient } = require("cohere-ai");

let client = null;

const getCohereClient = () => {
    if (!client) {
        if (!process.env.COHERE_API_KEY) {
            throw new Error("COHERE_API_KEY is not defined in environment variables");
        }

        client = new CohereClient({
            token: process.env.COHERE_API_KEY,
        });
    }
    return client;
};

module.exports = { getCohereClient };
