/**
 * Utility để format markdown text
 * Có thể dùng để convert markdown sang HTML hoặc format text
 */

class MarkdownFormatter {
    /**
     * Format markdown text với các rule cơ bản
     * @param {string} text - Text markdown cần format
     * @returns {string} - Formatted text
     */
    static formatMarkdown(text) {
        if (!text) return '';

        let formatted = text;

        // Format bold **text** -> <strong>text</strong>
        formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

        // Format italic *text* -> <em>text</em>
        formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');

        // Format inline code `code` -> <code>code</code>
        formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Format code blocks ```code``` -> <pre><code>code</code></pre>
        formatted = formatted.replace(/```([\s\S]+?)```/g, '<pre><code>$1</code></pre>');

        // Format headings
        formatted = formatted.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        formatted = formatted.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        formatted = formatted.replace(/^# (.+)$/gm, '<h1>$1</h1>');

        // Format links [text](url) -> <a href="url">text</a>
        formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

        // Format line breaks
        formatted = formatted.replace(/\n/g, '<br>');

        return formatted;
    }

    /**
     * Clean markdown để lấy plain text
     * @param {string} text - Text markdown
     * @returns {string} - Plain text
     */
    static toPlainText(text) {
        if (!text) return '';

        let plain = text;

        // Remove bold
        plain = plain.replace(/\*\*(.+?)\*\*/g, '$1');

        // Remove italic
        plain = plain.replace(/\*(.+?)\*/g, '$1');

        // Remove inline code
        plain = plain.replace(/`([^`]+)`/g, '$1');

        // Remove code blocks
        plain = plain.replace(/```([\s\S]+?)```/g, '$1');

        // Remove headings
        plain = plain.replace(/^#{1,6} (.+)$/gm, '$1');

        // Remove links, keep text
        plain = plain.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');

        return plain;
    }

    /**
     * Validate và sanitize markdown text
     * @param {string} text - Text markdown
     * @returns {string} - Sanitized text
     */
    static sanitize(text) {
        if (!text) return '';

        let sanitized = text;

        // Remove potentially dangerous HTML
        sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
        sanitized = sanitized.replace(/on\w+="[^"]*"/g, '');

        return sanitized;
    }

    /**
     * Format danh sách từ markdown
     * @param {string} text - Text có danh sách
     * @returns {string} - Formatted list
     */
    static formatLists(text) {
        if (!text) return '';

        let formatted = text;

        // Format unordered lists
        formatted = formatted.replace(/^\s*[-*+]\s+(.+)$/gm, '<li>$1</li>');
        formatted = formatted.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

        // Format ordered lists
        formatted = formatted.replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>');
        formatted = formatted.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
            if (!match.includes('<ul>')) {
                return '<ol>' + match + '</ol>';
            }
            return match;
        });

        return formatted;
    }

    /**
     * Format complete markdown với tất cả rules
     * @param {string} text - Text markdown
     * @returns {string} - Fully formatted HTML
     */
    static formatComplete(text) {
        if (!text) return '';

        let formatted = this.sanitize(text);
        formatted = this.formatMarkdown(formatted);
        formatted = this.formatLists(formatted);

        return formatted;
    }

    /**
     * Check if text contains markdown
     * @param {string} text - Text to check
     * @returns {boolean} - True if contains markdown
     */
    static containsMarkdown(text) {
        if (!text) return false;

        const markdownPatterns = [
            /\*\*.*\*\*/,  // bold
            /\*.*\*/,      // italic
            /`.*`/,        // inline code
            /```[\s\S]*```/, // code blocks
            /^#{1,6} /m,   // headings
            /\[.*\]\(.*\)/, // links
            /^\s*[-*+]\s+/m, // unordered lists
            /^\s*\d+\.\s+/m  // ordered lists
        ];

        return markdownPatterns.some(pattern => pattern.test(text));
    }
}

module.exports = MarkdownFormatter;
