const Groq = require("groq-sdk");

class GroqConfig {
  constructor() {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not defined in environment variables");
    }

    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    // Model configurations
    this.models = {
      default: "llama-3.3-70b-versatile",
      fast: "llama-3.1-8b-instant",
      reasoning: "llama-3.3-70b-versatile"
    };

    // Default parameters
    this.defaultParams = {
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false
    };
  }

  getClient() {
    return this.client;
  }

  getModel(type = "default") {
    return this.models[type] || this.models.default;
  }

  getDefaultParams() {
    return { ...this.defaultParams };
  }
}

module.exports = new GroqConfig();
