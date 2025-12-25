class SecurityValidator {
  static SENSITIVE_KEYWORDS = [
    // Database
    'password', 'passwd', 'pwd', 'database', 'db_password', 'mysql', 'connection string',

    // API Keys
    'api key', 'api_key', 'apikey', 'secret', 'token', 'access_token', 'jwt_secret',

    // Environment
    '.env', 'environment variable', 'env variable', 'dotenv',

    // Infrastructure
    'ip address', 'port', 'server', 'host', 'credential',

    // Security
    'private key', 'public key', 'encryption key', 'hash'
  ];

  static SENSITIVE_PATTERNS = [
    /(?:password|passwd|pwd)\s*[:=]/i,
    /(?:api[_\s]?key|secret|token)\s*[:=]/i,
    /\.env/i,
    /db[_\s]?(?:user|password|host|name)/i,
    /jdbc|mysql|postgresql|mongodb/i,
    /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,  // IP address pattern
  ];

  static isSensitiveQuery(question) {
    const lowerQuestion = question.toLowerCase();

    // Kiểm tra keywords
    const hasKeyword = this.SENSITIVE_KEYWORDS.some(keyword =>
      lowerQuestion.includes(keyword.toLowerCase())
    );

    // Kiểm tra patterns
    const hasPattern = this.SENSITIVE_PATTERNS.some(pattern =>
      pattern.test(question)
    );

    // Kiểm tra các câu hỏi trực tiếp về thông tin nhạy cảm
    const directQuestions = [
      /cho\s+(?:tôi|mình|t)\s+(?:biết|xem|password|key)/i,
      /(?:password|key|token|secret)\s+(?:là\s+gì|of|for)/i,
      /file\s+\.env\s+(?:có\s+gì|content|nội\s+dung)/i,
      /kết\s+nối\s+database/i,
      /thông\s+tin\s+(?:database|db|server)/i
    ];

    const isDirect = directQuestions.some(pattern => pattern.test(lowerQuestion));

    return hasKeyword || hasPattern || isDirect;
  }

  static getSafetyResponse() {
    return "Xin lỗi, tôi không thể cung cấp thông tin nhạy cảm về hệ thống như database credentials, API keys, biến môi trường, hoặc cấu hình bảo mật. Vui lòng liên hệ quản trị viên nếu bạn cần thông tin này.";
  }
}

module.exports = SecurityValidator;
