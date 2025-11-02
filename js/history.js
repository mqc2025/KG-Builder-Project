// History Manager for Undo/Redo

class HistoryManager {
    constructor(maxHistory = 50) {
        this.maxHistory = maxHistory;
        this.history = [];
        this.currentIndex = -1;
    }

    /**
     * Add a new state to history
     * @param {Object} state - Graph state to save
     */
    addState(state) {
        // Remove any states after current index (when adding after undo)
        this.history = this.history.slice(0, this.currentIndex + 1);

        // Add new state
        this.history.push(Utils.deepClone(state));

        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.currentIndex++;
        }

        this.updateUI();
    }

    /**
     * Undo to previous state
     * @returns {Object|null} Previous state or null
     */
    undo() {
        if (!this.canUndo()) return null;

        this.currentIndex--;
        this.updateUI();
        return Utils.deepClone(this.history[this.currentIndex]);
    }

    /**
     * Redo to next state
     * @returns {Object|null} Next state or null
     */
    redo() {
        if (!this.canRedo()) return null;

        this.currentIndex++;
        this.updateUI();
        return Utils.deepClone(this.history[this.currentIndex]);
    }

    /**
     * Check if undo is available
     * @returns {boolean}
     */
    canUndo() {
        return this.currentIndex > 0;
    }

    /**
     * Check if redo is available
     * @returns {boolean}
     */
    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }

    /**
     * Clear history
     */
    clear() {
        this.history = [];
        this.currentIndex = -1;
        this.updateUI();
    }

    /**
     * Update undo/redo button states
     */
    updateUI() {
        const undoBtn = document.getElementById('btn-undo');
        const redoBtn = document.getElementById('btn-redo');

        if (undoBtn) {
            undoBtn.disabled = !this.canUndo();
        }
        if (redoBtn) {
            redoBtn.disabled = !this.canRedo();
        }
    }

    /**
     * Get current history info
     * @returns {Object}
     */
    getInfo() {
        return {
            size: this.history.length,
            currentIndex: this.currentIndex,
            canUndo: this.canUndo(),
            canRedo: this.canRedo()
        };
    }
}

// Export
window.HistoryManager = HistoryManager;
