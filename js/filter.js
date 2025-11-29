// Enhanced Filter Manager with Multiple Filter Types

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
        // Main filter button
        this.filterBtn?.addEventListener('click', () => {
            this.showFilterModal();
        });

        // Quick filter buttons
        document.getElementById('btn-quick-priority')?.addEventListener('click', () => {
            this.showQuickFilter('priority');
        });
        document.getElementById('btn-quick-category')?.addEventListener('click', () => {
            this.showQuickFilter('category');
        });
        document.getElementById('btn-quick-connections')?.addEventListener('click', () => {
            this.showQuickFilter('connections');
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

        // Filter type selector
        document.getElementById('filter-type-select')?.addEventListener('change', (e) => {
            this.switchFilterType(e.target.value);
        });

        // Apply filter button
        document.getElementById('btn-apply-filter')?.addEventListener('click', () => {
            this.applyFilter();
        });

        // Clear filter button
        document.getElementById('btn-clear-filter')?.addEventListener('click', () => {
            this.clearFilter();
        });
		
		// Select All / Deselect All buttons
		document.addEventListener('click', (e) => {
			if (e.target.classList.contains('filter-select-btn')) {
				const action = e.target.dataset.action;
				const target = e.target.dataset.target;
				this.handleSelectButtons(action, target);
			}
		});
    }

    /**
     * Show quick filter with pre-selected type
     */
    showQuickFilter(filterType) {
        this.showFilterModal();
        document.getElementById('filter-type-select').value = filterType;
        this.switchFilterType(filterType);
        
        // Update quick button states
        document.querySelectorAll('.toolbar-btn-small').forEach(btn => btn.classList.remove('active'));
        if (filterType === 'priority') {
            document.getElementById('btn-quick-priority')?.classList.add('active');
        } else if (filterType === 'category') {
            document.getElementById('btn-quick-category')?.classList.add('active');
        } else if (filterType === 'connections') {
            document.getElementById('btn-quick-connections')?.classList.add('active');
        }
    }

    /**
     * Switch between filter types
     */
    switchFilterType(type) {
        // Hide all filter type contents
        document.querySelectorAll('.filter-type-content').forEach(el => {
            el.classList.add('hidden');
        });

        // Show selected filter type
        const targetContent = document.getElementById(`filter-${type}`);
        if (targetContent) {
            targetContent.classList.remove('hidden');
        }

        // Populate dynamic content based on type
        if (type === 'category') {
            this.populateCategoryCheckboxes();
        } else if (type === 'color') {
            this.populateColorCheckboxes();
        } else if (type === 'connections') {
            this.populateConnectionNodes();
        }
    }

    /**
     * Populate category checkboxes dynamically
     */
    populateCategoryCheckboxes() {
        const container = document.getElementById('category-checkboxes');
        if (!container) return;

        // Get unique categories from graph
        const categories = new Set();
        this.graph.nodes.forEach(node => {
            if (node.category && node.category.trim()) {
                categories.add(node.category.trim());
            }
        });

        if (categories.size === 0) {
            container.innerHTML = '<p style="color: #999; padding: 10px;">No categories found in graph</p>';
            return;
        }

        // Create checkboxes
        container.innerHTML = Array.from(categories).sort().map(cat => `
            <label class="filter-checkbox-label">
                <input type="checkbox" value="${this.escapeHtml(cat)}" checked> ${this.escapeHtml(cat)}
            </label>
        `).join('');
    }

    /**
     * Populate color checkboxes dynamically
     */
    populateColorCheckboxes() {
        const container = document.getElementById('color-checkboxes');
        if (!container) return;

        // Get unique colors from graph
        const colors = new Set();
        this.graph.nodes.forEach(node => {
            if (node.color) {
                colors.add(node.color);
            }
        });

        if (colors.size === 0) {
            container.innerHTML = '<p style="color: #999; padding: 10px;">No colors found in graph</p>';
            return;
        }

        // Create checkboxes with color swatches
        container.innerHTML = Array.from(colors).map(color => `
            <label class="filter-checkbox-label color-checkbox-label">
                <input type="checkbox" value="${this.escapeHtml(color)}" checked>
                <span class="color-checkbox-swatch" style="background-color: ${this.escapeHtml(color)}"></span>
                <span>${this.escapeHtml(color)}</span>
            </label>
        `).join('');
    }

    /**
     * Populate connection node dropdown
     */
    populateConnectionNodes() {
        const select = document.getElementById('filter-connection-node');
        if (!select) return;

        // Clear existing options except first
        select.innerHTML = '<option value="">Select a node...</option>';

        // Add all nodes
        this.graph.nodes.forEach(node => {
            const option = document.createElement('option');
            option.value = node.id;
            option.textContent = node.name || node.id;
            select.appendChild(option);
        });
    }

    /**
     * Show filter modal
     */
    showFilterModal() {
        this.modal?.classList.remove('hidden');
        
        // Initialize with custom filter type
        const filterTypeSelect = document.getElementById('filter-type-select');
        if (filterTypeSelect && !filterTypeSelect.value) {
            filterTypeSelect.value = 'custom';
            this.switchFilterType('custom');
        }
    }

    /**
     * Hide filter modal
     */
    hideFilterModal() {
        this.modal?.classList.add('hidden');
    }

    /**
     * Apply filter based on selected type
     */
    applyFilter() {
        const filterType = document.getElementById('filter-type-select')?.value;
        let filteredNodes = [];

        try {
            switch (filterType) {
                case 'custom':
                    filteredNodes = this.applyCustomFilter();
                    break;
                case 'priority':
                    filteredNodes = this.applyPriorityFilter();
                    break;
                case 'category':
                    filteredNodes = this.applyCategoryFilter();
                    break;
                case 'color':
                    filteredNodes = this.applyColorFilter();
                    break;
                case 'deadline':
                    filteredNodes = this.applyDeadlineFilter();
                    break;
                case 'dateRange':
                    filteredNodes = this.applyDateRangeFilter();
                    break;
                case 'connections':
                    filteredNodes = this.applyConnectionsFilter();
                    break;
                default:
                    alert('Unknown filter type');
                    return;
            }

            if (filteredNodes.length === 0) {
                alert('No nodes match the filter criteria');
                return;
            }

            // Store current filter
            this.currentFilter = {
                type: filterType,
                nodeCount: filteredNodes.length
            };
            this.isFilterActive = true;

            // Highlight filtered nodes
			const nodeIds = filteredNodes.map(n => n.id);
			this.renderer.highlightNodes(nodeIds);

			// Apply dimming to non-filtered nodes and edges
			this.applyFilterDimming(nodeIds);

			// Update button states
			this.updateFilterButtonState();

            this.hideFilterModal();

            if (window.app) {
                window.app.updateStatus(`Filter active: ${filteredNodes.length} nodes matched`);
            }

        } catch (error) {
            console.error('Filter error:', error);
            alert('Error applying filter: ' + error.message);
        }
    }

    /**
     * Apply custom property filter
     */
    applyCustomFilter() {
        const propertyInput = document.getElementById('filter-property');
        const valueInput = document.getElementById('filter-value');
        const matchTypeSelect = document.getElementById('filter-match-type');

        const propertyKey = propertyInput?.value.trim();
        const propertyValue = valueInput?.value.trim();
        const matchType = matchTypeSelect?.value || 'exact';

        if (!propertyKey || !propertyValue) {
            throw new Error('Please enter both property name and value');
        }

        return this.graph.filterNodes(propertyKey, propertyValue, matchType);
    }

    /**
     * Apply priority filter
     */
    applyPriorityFilter() {
        const checkboxes = document.querySelectorAll('#filter-priority input[type="checkbox"]:checked');
        const selectedPriorities = Array.from(checkboxes).map(cb => cb.value);

        if (selectedPriorities.length === 0) {
            throw new Error('Please select at least one priority level');
        }

        return this.graph.nodes.filter(node => {
            return node.priority && selectedPriorities.includes(node.priority);
        });
    }

    /**
     * Apply category filter
     */
    applyCategoryFilter() {
        const checkboxes = document.querySelectorAll('#filter-category input[type="checkbox"]:checked');
        const selectedCategories = Array.from(checkboxes).map(cb => cb.value);

        if (selectedCategories.length === 0) {
            throw new Error('Please select at least one category');
        }

        return this.graph.nodes.filter(node => {
            return node.category && selectedCategories.includes(node.category);
        });
    }

    /**
     * Apply color filter
     */
    applyColorFilter() {
        const checkboxes = document.querySelectorAll('#filter-color input[type="checkbox"]:checked');
        const selectedColors = Array.from(checkboxes).map(cb => cb.value);

        if (selectedColors.length === 0) {
            throw new Error('Please select at least one color');
        }

        return this.graph.nodes.filter(node => {
            return node.color && selectedColors.includes(node.color);
        });
    }

    /**
     * Apply deadline filter
     */
    applyDeadlineFilter() {
        const startInput = document.getElementById('filter-deadline-start');
        const endInput = document.getElementById('filter-deadline-end');
        const includeEmpty = document.getElementById('filter-deadline-include-empty');

        const startDate = startInput?.value ? new Date(startInput.value) : null;
        const endDate = endInput?.value ? new Date(endInput.value) : null;

        if (!startDate && !endDate) {
            throw new Error('Please select at least one date');
        }

        return this.graph.nodes.filter(node => {
            if (!node.deadline || !node.deadline.trim()) {
                return includeEmpty?.checked;
            }

            const nodeDeadline = new Date(node.deadline);
            
            if (startDate && endDate) {
                return nodeDeadline >= startDate && nodeDeadline <= endDate;
            } else if (startDate) {
                return nodeDeadline >= startDate;
            } else if (endDate) {
                return nodeDeadline <= endDate;
            }
            
            return false;
        });
    }

    /**
     * Apply date range filter (created/modified/user dates)
     */
    applyDateRangeFilter() {
        const dateField = document.getElementById('filter-date-field')?.value;
        const startInput = document.getElementById('filter-date-start');
        const endInput = document.getElementById('filter-date-end');

        const startDate = startInput?.value ? new Date(startInput.value) : null;
        const endDate = endInput?.value ? new Date(endInput.value) : null;

        if (!startDate && !endDate) {
            throw new Error('Please select at least one date');
        }

        return this.graph.nodes.filter(node => {
            const nodeDate = node[dateField] ? new Date(node[dateField]) : null;
            
            if (!nodeDate) return false;

            if (startDate && endDate) {
                return nodeDate >= startDate && nodeDate <= endDate;
            } else if (startDate) {
                return nodeDate >= startDate;
            } else if (endDate) {
                return nodeDate <= endDate;
            }
            
            return false;
        });
    }

    /**
     * Apply connections filter
     */
    applyConnectionsFilter() {
        const nodeSelect = document.getElementById('filter-connection-node');
        const outgoingCheck = document.getElementById('filter-conn-outgoing');
        const incomingCheck = document.getElementById('filter-conn-incoming');
        const includeSelectedCheck = document.getElementById('filter-conn-include-selected');

        const selectedNodeId = nodeSelect?.value;

        if (!selectedNodeId) {
            throw new Error('Please select a node');
        }

        if (!outgoingCheck?.checked && !incomingCheck?.checked) {
            throw new Error('Please select at least one connection type');
        }

        const connectedNodeIds = new Set();

        // Check all edges
        this.graph.edges.forEach(edge => {
            const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
            const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;

            if (outgoingCheck?.checked && sourceId === selectedNodeId) {
                connectedNodeIds.add(targetId);
            }
            if (incomingCheck?.checked && targetId === selectedNodeId) {
                connectedNodeIds.add(sourceId);
            }
        });

        // Include the selected node itself if requested
        if (includeSelectedCheck?.checked) {
            connectedNodeIds.add(selectedNodeId);
        }

        return this.graph.nodes.filter(node => connectedNodeIds.has(node.id));
    }

    /**
     * Clear filter
     */
    clearFilter() {
        this.currentFilter = null;
        this.isFilterActive = false;

        // Clear highlights
		this.renderer.clearHighlight();

		// Clear dimming effect
		this.renderer.clearDistanceDimming();

		// Update button states
		this.updateFilterButtonState();
        
        // Clear quick filter button states
        document.querySelectorAll('.toolbar-btn-small').forEach(btn => btn.classList.remove('active'));

        this.hideFilterModal();

        if (window.app) {
            window.app.updateStatus('Filter cleared');
        }

        // Clear input fields
        document.getElementById('filter-property').value = '';
        document.getElementById('filter-value').value = '';
        document.getElementById('filter-type-select').value = 'custom';
        this.switchFilterType('custom');
    }

    /**
     * Update filter button state
     */
    updateFilterButtonState() {
        if (this.isFilterActive) {
            this.filterBtn?.classList.add('active');
            this.filterBtn.title = `Filter active (${this.currentFilter.nodeCount} nodes)`;
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

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
	
	/**
	 * Handle Select All / Deselect All buttons
	 * @param {string} action - 'select-all' or 'deselect-all'
	 * @param {string} target - 'filter-priority', 'filter-category', or 'filter-color'
	 */
	handleSelectButtons(action, target) {
		let checkboxes;
		
		if (target === 'filter-priority') {
			checkboxes = document.querySelectorAll('#priority-checkboxes input[type="checkbox"]');
		} else if (target === 'filter-category') {
			checkboxes = document.querySelectorAll('#category-checkboxes input[type="checkbox"]');
		} else if (target === 'filter-color') {
			checkboxes = document.querySelectorAll('#color-checkboxes input[type="checkbox"]');
		}
		
		if (!checkboxes) return;
		
		const shouldCheck = action === 'select-all';
		checkboxes.forEach(checkbox => {
			checkbox.checked = shouldCheck;
		});
	}
	/**
	 * Apply dimming to nodes/edges that don't match the filter
	 * @param {Array} filteredNodeIds - Array of node IDs that passed the filter
	 */
	applyFilterDimming(filteredNodeIds) {
		const filteredSet = new Set(filteredNodeIds);
		
		// Clear previous dimming
		this.renderer.dimmedNodes.clear();
		this.renderer.dimmedEdges.clear();
		
		// Dim all nodes NOT in the filtered set
		this.graph.nodes.forEach(node => {
			if (!filteredSet.has(node.id)) {
				this.renderer.dimmedNodes.add(node.id);
			}
		});
		
		// Dim edges where BOTH endpoints are NOT in the filtered set
		this.graph.edges.forEach(edge => {
			const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
			const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
			
			// Only dim edge if BOTH nodes are not in filter results
			if (!filteredSet.has(sourceId) && !filteredSet.has(targetId)) {
				this.renderer.dimmedEdges.add(edge.id);
			}
		});
		
		this.renderer.isDimmingActive = true;
		this.renderer.updateDimming();
	}	
}

// Export
window.FilterManager = FilterManager;