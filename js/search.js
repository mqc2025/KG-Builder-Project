// Search and Filter

class SearchManager {
    constructor(graph, renderer) {
        this.graph = graph;
        this.renderer = renderer;
        this.searchInput = document.getElementById('search-input');
        this.clearBtn = document.getElementById('btn-clear-search');
        
        this.currentResults = [];
        
        this.setupEventListeners();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Search input with debouncing
        this.searchInput?.addEventListener('input', 
            Utils.debounce(() => this.performSearch(), 300)
        );

        // Clear search button
        this.clearBtn?.addEventListener('click', () => {
            this.clearSearch();
        });

        // Enter key to focus on first result
        this.searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.currentResults.length > 0) {
                this.focusOnResults();
            }
        });
    }

    /**
     * Perform search
     */
    performSearch() {
        const query = this.searchInput?.value.trim();

        if (!query) {
            this.clearSearch();
            return;
        }

        // Search nodes
        this.currentResults = this.graph.searchNodes(query);

        // Highlight AND select results
        const nodeIds = this.currentResults.map(node => node.id);
        this.renderer.highlightNodes(nodeIds);
        this.renderer.selectNodes(nodeIds);

        // ADD THIS: Attach one-time click handlers to highlighted nodes
        this.attachDimmingClickHandlers(nodeIds);

        // Update UI
        this.updateSearchStatus();
    }
	/**
     * Attach click handlers for distance dimming effect
     * @param {Array} nodeIds - Array of highlighted node IDs
     */
    attachDimmingClickHandlers(nodeIds) {
        // Remove any existing handlers first
        this.removeDimmingClickHandlers();
        
        // Create a one-time click handler for each highlighted node
        this.dimmingClickHandler = (event, d) => {
            // Only trigger if dimming is not already active
            if (!this.renderer.isDimmingActive) {
                event.stopPropagation();
                
                // Apply distance-based dimming
                this.renderer.applyDistanceDimming(d.id, 2);
                
                // Set up one-time clear handler on next click anywhere
                this.setupDimmingClearHandler();
                
                if (window.app) {
                    window.app.updateStatus(`Showing connections within distance 4 from: ${d.name || d.id} (click anywhere to clear)`);
                }
            }
        };
        
        // Attach handler to highlighted nodes
        this.renderer.nodeGroup.selectAll('.node')
            .filter(d => nodeIds.includes(d.id))
            .on('click.dimming', this.dimmingClickHandler);
    }
    
    /**
     * Setup one-time click handler to clear dimming on next click
     */
    setupDimmingClearHandler() {
        const clearDimming = () => {
            this.renderer.clearDistanceDimming();
            
            // Remove this handler after first use
            document.removeEventListener('click', clearDimming);
            this.renderer.svg.on('click.dimming-clear', null);
            
            if (window.app) {
                window.app.updateStatus('Distance filter cleared');
            }
        };
        
        // Use a slight delay to prevent immediate clearing
        setTimeout(() => {
            // Listen for any click on the document
            document.addEventListener('click', clearDimming, { once: true });
            
            // Also listen on SVG canvas
            this.renderer.svg.on('click.dimming-clear', clearDimming);
        }, 100);
    }
    
    /**
     * Remove dimming click handlers
     */
    removeDimmingClickHandlers() {
        this.renderer.nodeGroup.selectAll('.node')
            .on('click.dimming', null);
    }

    /**
     * Clear search
     */
    clearSearch() {
        if (this.searchInput) {
            this.searchInput.value = '';
        }

        this.currentResults = [];
        this.renderer.clearHighlight();
        this.renderer.clearSelection();
        
        // ADD THIS: Clear dimming handlers and state
        this.removeDimmingClickHandlers();
        if (this.renderer.isDimmingActive) {
            this.renderer.clearDistanceDimming();
        }
        
        this.updateSearchStatus();
    }

    /**
     * Focus on search results
     */
    focusOnResults() {
        if (this.currentResults.length === 0) return;

        // Calculate bounds of search results
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        this.currentResults.forEach(node => {
            if (node.x < minX) minX = node.x;
            if (node.x > maxX) maxX = node.x;
            if (node.y < minY) minY = node.y;
            if (node.y > maxY) maxY = node.y;
        });

        // Calculate center
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        // Calculate scale to fit results
        const width = maxX - minX;
        const height = maxY - minY;
        const svgWidth = this.renderer.svg.node().clientWidth;
        const svgHeight = this.renderer.svg.node().clientHeight;

        let scale = 1;
        if (width > 0 && height > 0) {
            scale = Math.min(
                svgWidth / (width * 1.5),
                svgHeight / (height * 1.5),
                2
            );
        }

        // Apply transform
        const tx = svgWidth / 2 - centerX * scale;
        const ty = svgHeight / 2 - centerY * scale;

        this.renderer.svg.transition()
            .duration(750)
            .call(
                this.renderer.zoom.transform,
                d3.zoomIdentity.translate(tx, ty).scale(scale)
            );
    }

    /**
     * Update search status
     */
    updateSearchStatus() {
        const count = this.currentResults.length;
        
        if (count > 0) {
            this.clearBtn?.classList.remove('hidden');
        } else {
            this.clearBtn?.classList.add('hidden');
        }
    }

    /**
     * Filter graph view to show only matching nodes
     * @param {string} query - Search query
     */
    filterView(query) {
        if (!query) {
            this.renderer.render();
            return;
        }

        const results = this.graph.searchNodes(query);
        const nodeIds = new Set(results.map(n => n.id));

        // Filter edges to only show those connecting matching nodes
        const filteredEdges = this.graph.edges.filter(e =>
            nodeIds.has(e.source) && nodeIds.has(e.target)
        );

        // Temporarily modify graph for rendering
        const originalNodes = this.graph.nodes;
        const originalEdges = this.graph.edges;

        this.graph.nodes = results;
        this.graph.edges = filteredEdges;

        this.renderer.render();

        // Restore original graph
        this.graph.nodes = originalNodes;
        this.graph.edges = originalEdges;
    }

    /**
     * Get current search results
     */
    getResults() {
        return this.currentResults;
    }
}

// Export
window.SearchManager = SearchManager;
