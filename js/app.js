// Main Application Controller

class KnowledgeGraphApp {
    constructor() {
        // Initialize core components
        this.graph = new Graph();
        this.history = new HistoryManager();
        
        // Initialize renderer
        const canvas = document.getElementById('graph-canvas');
        this.renderer = new Renderer(canvas, this.graph);
        
        // Initialize other managers
        this.propertiesPanel = new PropertiesPanel(this.graph, this.renderer);
        this.minimap = new Minimap(document.getElementById('minimap'), this.renderer);
        this.searchManager = new SearchManager(this.graph, this.renderer);
        this.fileManager = new FileManager(this.graph, this.renderer);
        this.tabManager = new TabManager();
        this.filterManager = new FilterManager(this.graph, this.renderer);
        this.contextMenuManager = new ContextMenuManager(this);
        this.excelConverter = new ExcelConverter(this.graph, this.renderer); // NEW: Excel Converter
        
        // Current tool
        this.currentTool = 'select';
        
        // Temporary state for adding edges
        this.edgeSourceNode = null;
        
        // Shortest path state
        this.pathStartNode = null;
        this.pathEndNode = null;
        this.lastNodeClick = null;
        this.lastNodeClickTime = 0;
        
           
        // Setup
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.updateStats();
        
        // Initial state
        this.saveState();
        
        // Make app globally accessible
        window.app = this;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
		// Sidebar tab switching - ADD THIS SECTION
        const sidebarTabs = document.querySelectorAll('.sidebar-tab');
        sidebarTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs and panels
                document.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Show corresponding panel
                const tabName = tab.getAttribute('data-tab');
                document.getElementById(`${tabName}-tab`)?.classList.add('active');
            });
        });
        // Toolbar buttons
        document.getElementById('btn-new')?.addEventListener('click', () => this.newGraph());
        document.getElementById('btn-open')?.addEventListener('click', () => this.openGraph());
		document.getElementById('btn-save')?.addEventListener('click', () => this.saveGraph());
		document.getElementById('btn-save-as')?.addEventListener('click', () => this.saveGraphAs());
        document.getElementById('btn-export')?.addEventListener('click', () => this.exportGraph());
        document.getElementById('btn-undo')?.addEventListener('click', () => this.undo());
        document.getElementById('btn-redo')?.addEventListener('click', () => this.redo());
        document.getElementById('btn-filter')?.addEventListener('click', () => this.filterManager.showFilterModal());
        
        // Tool buttons
        document.getElementById('btn-freeze')?.addEventListener('click', () => this.toggleFreeze());
        document.getElementById('btn-layout')?.addEventListener('click', () => this.resimulate());
        document.getElementById('btn-shortest-path')?.addEventListener('click', () => this.startShortestPath());
        
        // Search
        document.getElementById('search-input')?.addEventListener('input', (e) => {
            this.searchManager.search(e.target.value);
        });
        document.getElementById('btn-clear-search')?.addEventListener('click', () => {
            this.searchManager.clearSearch();
        });
        
        // Properties panel close
        document.getElementById('btn-close-properties')?.addEventListener('click', () => {
            this.propertiesPanel.hide();
        });
        
        // Canvas events
        this.renderer.onNodeClick = (node) => this.handleNodeClick(node);
        this.renderer.onEdgeClick = (edge) => this.handleEdgeClick(edge);
        this.renderer.onCanvasClick = () => this.handleCanvasClick();
        this.renderer.onNodeDragEnd = (node) => this.saveState();
        this.renderer.onNodeContextMenu = (node, event) => this.contextMenuManager.showNodeMenu(node, event);
        this.renderer.onEdgeContextMenu = (edge, event) => this.contextMenuManager.showEdgeMenu(edge, event);
        this.renderer.onCanvasContextMenu = (event) => this.contextMenuManager.showCanvasMenu(event);
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+N: New Graph
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.newGraph();
            }
            
            // Ctrl+O: Open Graph
            if (e.ctrlKey && e.key === 'o') {
                e.preventDefault();
                this.openGraph();
            }
            
            // Ctrl+S: Save Graph
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveGraph();
            }
            
            // Ctrl+Z: Undo
            if (e.ctrlKey && !e.shiftKey && e.key === 'z') {
                e.preventDefault();
                this.undo();
            }
            
            // Ctrl+Shift+Z or Ctrl+Y: Redo
            if ((e.ctrlKey && e.shiftKey && e.key === 'z') || (e.ctrlKey && e.key === 'y')) {
                e.preventDefault();
                this.redo();
            }
            
            // Ctrl+F: Focus search
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                document.getElementById('search-input')?.focus();
            }
            
            // F: Toggle freeze
            if (e.key === 'f' && !e.ctrlKey && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                this.toggleFreeze();
            }
            
            // Delete: Delete selection
            if (e.key === 'Delete') {
                e.preventDefault();
                this.deleteSelection();
            }
            
            // Escape: Clear selection
            if (e.key === 'Escape') {
                e.preventDefault();
                this.renderer.clearSelection();
                this.propertiesPanel.hide();
                this.updateStatus('Selection cleared');
            }
        });
    }

    /**
     * Handle node click
     */
    handleNodeClick(node) {
        // Check if in shortest path mode
        if (this.currentTool === 'shortest-path') {
            this.selectPathNode(node);
            return;
        }
        
        this.propertiesPanel.show(node, 'node');
        this.updateStatus();
    }

    /**
     * Handle edge click
     */
    handleEdgeClick(edge) {
        this.propertiesPanel.show(edge, 'edge');
        this.updateStatus();
    }

    /**
     * Handle canvas click
     */
    handleCanvasClick() {
        this.renderer.clearSelection();
        this.propertiesPanel.hide();
        this.updateStatus('Selection cleared');
    }

    /**
     * Toggle freeze simulation
     */
    toggleFreeze() {
        this.renderer.toggleFreeze();
        const btn = document.getElementById('btn-freeze');
        if (btn) {
            const icon = btn.querySelector('span:first-child');
            const label = btn.querySelector('.tool-label');
            if (this.renderer.isFrozen) {
                icon.textContent = '▶️';
                label.textContent = 'Unfreeze';
            } else {
                icon.textContent = '❄️';
                label.textContent = 'Freeze';
            }
        }
        this.updateSimulationStatus();
    }

    /**
     * Resimulate graph
     */
    resimulate() {
        // Unpin all nodes
        this.graph.nodes.forEach(node => {
            delete node.fx;
            delete node.fy;
        });
        
        this.renderer.restartSimulation();
        this.updateStatus('Simulation restarted');
    }

    /**
     * Start shortest path selection
     */
    startShortestPath() {
        this.currentTool = 'shortest-path';
        this.pathStartNode = null;
        this.pathEndNode = null;
        
        // Show path modal
        const modal = document.getElementById('path-modal');
        if (modal) {
            modal.classList.remove('hidden');
            this.populatePathSelects();
        }
        
        // Setup modal event listeners
        this.setupPathModal();
        
        this.updateStatus('Select start and end nodes for shortest path');
    }

    /**
     * Setup path modal
     */
    setupPathModal() {
        const modal = document.getElementById('path-modal');
        const closeBtn = modal?.querySelector('.modal-close');
        const calculateBtn = document.getElementById('btn-calculate-path');
        const clearBtn = document.getElementById('btn-clear-path');
        const startSelect = document.getElementById('path-start-select');
        const endSelect = document.getElementById('path-end-select');
        
        // Close modal
        closeBtn?.addEventListener('click', () => {
            modal.classList.add('hidden');
            this.currentTool = 'select';
        });
        
        // Enable calculate button when both nodes selected
        const checkSelections = () => {
            if (calculateBtn) {
                calculateBtn.disabled = !(startSelect?.value && endSelect?.value);
            }
        };
        
        startSelect?.addEventListener('change', checkSelections);
        endSelect?.addEventListener('change', checkSelections);
        
        // Calculate path
        calculateBtn?.addEventListener('click', () => {
            const startId = startSelect?.value;
            const endId = endSelect?.value;
            
            if (startId && endId) {
                this.calculateShortestPath(startId, endId);
            }
        });
        
        // Clear path
        clearBtn?.addEventListener('click', () => {
            this.renderer.clearPathHighlight();
            this.updateStatus('Path cleared');
        });
    }

    /**
     * Populate path selection dropdowns
     */
    populatePathSelects() {
        const startSelect = document.getElementById('path-start-select');
        const endSelect = document.getElementById('path-end-select');
        
        if (!startSelect || !endSelect) return;
        
        const options = this.graph.nodes.map(node => 
            `<option value="${node.id}">${node.name}</option>`
        ).join('');
        
        startSelect.innerHTML = '<option value="">-- Select Start Node --</option>' + options;
        endSelect.innerHTML = '<option value="">-- Select End Node --</option>' + options;
    }

    /**
     * Select node for path
     */
    selectPathNode(node) {
        if (!this.pathStartNode) {
            this.pathStartNode = node;
            this.updateStatus(`Start node: ${node.name}. Select end node.`);
        } else if (!this.pathEndNode && node.id !== this.pathStartNode.id) {
            this.pathEndNode = node;
            this.calculateShortestPath(this.pathStartNode.id, this.pathEndNode.id);
            this.currentTool = 'select';
        }
    }

    /**
     * Calculate shortest path
     */
    calculateShortestPath(startId, endId) {
        const result = Algorithms.findShortestPath(this.graph, startId, endId);
        
        if (result.path) {
            this.renderer.highlightPath(result.path);
            this.updateStatus(`Shortest path found: ${result.path.length} nodes, distance: ${result.distance.toFixed(2)}`);
        } else {
            alert('No path found between selected nodes');
        }
    }

    /**
     * Update simulation status
     */
    updateSimulationStatus() {
        const statusSpan = document.getElementById('status-simulation');
        if (statusSpan) {
            statusSpan.textContent = this.renderer.isFrozen ? 
                'Simulation: Frozen' : 'Simulation: Active';
        }
    }

    /**
     * Delete selected nodes/edges
     */
    deleteSelection() {
        const selectedNodes = Array.from(this.renderer.selectedNodes);
        const selectedEdges = Array.from(this.renderer.selectedEdges);

        if (selectedNodes.length === 0 && selectedEdges.length === 0) {
            return;
        }

        if (!Utils.confirm(`Delete ${selectedNodes.length} node(s) and ${selectedEdges.length} edge(s)?`)) {
            return;
        }

        // Delete nodes
        selectedNodes.forEach(nodeId => {
            this.graph.removeNode(nodeId);
        });

        // Delete edges
        selectedEdges.forEach(edgeId => {
            this.graph.removeEdge(edgeId);
        });

        this.renderer.clearSelection();
        this.propertiesPanel.hide();
        this.renderer.render();
        this.updateStats();
        this.saveState();
        this.updateStatus('Deleted selection');
    }

    
    /**
     * Update statistics in status bar
     */
    updateStats() {
        const stats = this.graph.getStats();
        document.getElementById('status-nodes').textContent = `Nodes: ${stats.nodeCount}`;
        document.getElementById('status-edges').textContent = `Edges: ${stats.edgeCount}`;
    }

    /**
     * Update status message
     */
    updateStatus(message) {
        const selectedNode = Array.from(this.renderer.selectedNodes)[0];
        const selectedEdge = Array.from(this.renderer.selectedEdges)[0];
        
        let selectionText = 'None';
        if (selectedNode) {
            selectionText = `Node: ${selectedNode}`;
        } else if (selectedEdge) {
            const edge = this.graph.getEdge(selectedEdge);
            if (edge) {
                selectionText = `Edge: ${edge.type || selectedEdge}`;
            } else {
                selectionText = `Edge: ${selectedEdge}`;
            }
        }
        
        document.getElementById('status-selection').textContent = `Selected: ${selectionText}`;
    }

    /**
     * Save current state to history
     */
    saveState() {
        this.history.addState(this.graph.toJSON());
    }

    /**
     * Undo
     */
    undo() {
        const state = this.history.undo();
        if (state) {
            this.loadGraph(state);
            this.updateStatus('Undo');
        }
    }

    /**
     * Redo
     */
    redo() {
        const state = this.history.redo();
        if (state) {
            this.loadGraph(state);
            this.updateStatus('Redo');
        }
    }

    /**
     * New graph
     */
    newGraph() {
        if (this.graph.nodes.length > 0) {
            if (!Utils.confirm('Create new graph? Unsaved changes will be lost.')) {
                return;
            }
        }

        this.graph.clear();
        this.graph.metadata = {
            name: 'Untitled Graph',
            title: '',
            description: '',
            created: Utils.getCurrentDate(),
            modified: Utils.getCurrentDate()
        };

        this.renderer.clearSelection();
        this.renderer.render();
        this.propertiesPanel.hide();
        this.updateStats();
        this.history.clear();
        this.saveState();
        this.updateStatus('New graph created');
    }

    /**
     * Open graph
     */
    openGraph() {
        this.fileManager.openFile();
    }

    /**
	 * Save graph
	 */
	saveGraph() {
		this.fileManager.save();
	}

	/**
	 * Save graph as
	 */
	saveGraphAs() {
		this.fileManager.saveAs();
	}

    /**
     * Export graph
     */
    exportGraph() {
        this.fileManager.showExportModal();
    }

    /**
     * Load graph from JSON
     */
    loadGraph(json) {
        this.graph.fromJSON(json);
        this.renderer.render();
        
        setTimeout(() => {
            this.renderer.fitToView();
        }, 150);
        
        this.updateStats();
        this.history.clear();
        this.saveState();
    }
	
	/**
     * Add node at specific position (called from context menu)
     */
    async addNode(x, y) {
        const name = prompt('Enter node name:');
        if (!name) return;

        const node = await this.graph.addNode({
            name: name,
            x: x,
            y: y,
            fx: x,
            fy: y
        });

        this.renderer.render();
        this.updateStats();
        this.saveState();
        this.updateStatus(`Added node: ${name}`);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new KnowledgeGraphApp();
});