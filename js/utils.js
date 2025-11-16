// Utility Functions

const Utils = {
    /**
     * Generate SHA256 hash from a string
     * @param {string} str - String to hash
     * @returns {Promise<string>} SHA256 hash in hexadecimal
     */
    async generateSHA256(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    },

    /**
     * Generate a unique ID (legacy method, kept for backward compatibility)
     * @param {string} prefix - Optional prefix for the ID
     * @returns {string} Unique ID
     */
    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Format date to ISO string
     * @returns {string} ISO formatted date
     */
    getCurrentDate() {
        return new Date().toISOString().split('T')[0];
    },

    /**
     * Deep clone an object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Debounce function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Download a file
     * @param {string} filename - Name of the file
     * @param {string} content - Content of the file
     * @param {string} mimeType - MIME type of the file
     */
    downloadFile(filename, content, mimeType = 'application/json') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    /**
     * Show loading overlay
     */
    showLoading() {
        document.getElementById('loading-overlay')?.classList.remove('hidden');
    },

    /**
     * Hide loading overlay
     */
    hideLoading() {
        document.getElementById('loading-overlay')?.classList.add('hidden');
    },

    /**
     * Show confirmation dialog
     * @param {string} message - Message to display
     * @returns {boolean} User's confirmation
     */
    confirm(message) {
        return window.confirm(message);
    },

    /**
     * Validate color hex code
     * @param {string} color - Color to validate
     * @returns {boolean} Is valid color
     */
    isValidColor(color) {
        return /^#[0-9A-F]{6}$/i.test(color);
    },

    /**
     * Get contrasting text color for a background color
     * @param {string} bgColor - Background color in hex
     * @returns {string} Black or white text color
     */
    getContrastColor(bgColor) {
        const color = bgColor.substring(1); // Remove #
        const rgb = parseInt(color, 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = (rgb >> 0) & 0xff;
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        return luma > 128 ? '#000000' : '#FFFFFF';
    },

    /**
     * Sanitize HTML to prevent XSS
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized string
     */
    sanitizeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Calculate distance between two points
     * @param {Object} p1 - Point 1 with x, y
     * @param {Object} p2 - Point 2 with x, y
     * @returns {number} Distance
     */
    distance(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Check if point is inside rectangle
     * @param {Object} point - Point with x, y
     * @param {Object} rect - Rectangle with x, y, width, height
     * @returns {boolean} Is inside
     */
    isPointInRect(point, rect) {
        return point.x >= rect.x &&
               point.x <= rect.x + rect.width &&
               point.y >= rect.y &&
               point.y <= rect.y + rect.height;
    }
};

// Export for use in other modules
window.Utils = Utils;