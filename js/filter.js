// Filter Manager for Property-Based Filtering (Feature 1)

class FilterManager {
    constructor(graph, renderer) {
        this.graph = graph;
        this.renderer = renderer;
        this.modal = document.getElementById('filter-modal');
        this.filterBtn = document.getElementById('btn-filter');
        
        this.currentFilter = null;
        this.isFilterActive = false;
        
        this.setupEventListeners();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Filter button
        this.filterBtn?.addEventListener('click', () => {
            this.showFilterModal();
        });

        // Modal close
        const closeBtn = this.modal?.querySelector('.modal-close');
        closeBtn?.addEventListener('click', () => {
            this.hideFilterModal();
        });

        // Click outside modal to close
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideFilterModal();
            }
        });

        // Apply filter button
        document.getElementById('btn-apply-filter')?.addEventListener('click', () => {
            this.applyFilter();
        });

        // Clear filter button
        document.getElementById('btn-clear-filter')?.addEventListener('click', () => {
            this.clearFilter();
        });
    }

    /**
     * Show filter modal
     */
    showFilterModal() {
        this.modal?.classList.remove('hidden');
        
        // Focus on property input
        document.getElementById('filter-property')?.focus();
    }

    /**
     * Hide filter modal
     */
    hideFilterModal() {
        this.modal?.classList.add('hidden');
    }

    /**
     * Apply filter
     */
    applyFilter() {
        const propertyInput = document.getElementById('filter-property');
        const valueInput = document.getElementById('filter-value');
        const matchTypeSelect = document.getElementById('filter-match-type');

        const propertyKey = propertyInput?.value.trim();
        const propertyValue = valueInput?.value.trim();
        const matchType = matchTypeSelect?.value || 'exact';

        if (!propertyKey || !propertyValue) {
            alert('Please enter both property name and value');
            return;
        }

        // Filter nodes
        const filteredNodes = this.graph.filterNodes(propertyKey, propertyValue, matchType);

        if (filteredNodes.length === 0) {
            alert('No nodes match the filter criteria');
            return;
        }

        // Store current filter
        this.currentFilter = {
            propertyKey,
            propertyValue,
            matchType
        };
        this.isFilterActive = true;

        // Highlight filtered nodes
        const nodeIds = filteredNodes.map(n => n.id);
        this.renderer.highlightNodes(nodeIds);

        // Update filter button to show active state
        this.updateFilterButtonState();

        this.hideFilterModal();

        if (window.app) {
            window.app.updateStatus(`Filter active: ${filteredNodes.length} nodes matched`);
        }
    }

    /**
     * Clear filter
     */
    clearFilter() {
        this.currentFilter = null;
        this.isFilterActive = false;

        // Clear highlights
        this.renderer.clearHighlight();

        // Update filter button state
        this.updateFilterButtonState();

        this.hideFilterModal();

        if (window.app) {
            window.app.updateStatus('Filter cleared');
        }

        // Clear input fields
        const propertyInput = document.getElementById('filter-property');
        const valueInput = document.getElementById('filter-value');
        if (propertyInput) propertyInput.value = '';
        if (valueInput) valueInput.value = '';
    }

    /**
     * Update filter button state
     */
    updateFilterButtonState() {
        if (this.isFilterActive) {
            this.filterBtn?.classList.add('active');
            this.filterBtn.title = `Filter active (${this.currentFilter.propertyKey}: ${this.currentFilter.propertyValue})`;
        } else {
            this.filterBtn?.classList.remove('active');
            this.filterBtn.title = 'Filter Graph';
        }
    }

    /**
     * Get current filter
     */
    getCurrentFilter() {
        return this.currentFilter;
    }

    /**
     * Check if filter is active
     */
    isActive() {
        return this.isFilterActive;
    }
}

// Export
window.FilterManager = FilterManager;
