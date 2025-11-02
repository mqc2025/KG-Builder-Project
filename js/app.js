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
        // Toolbar buttons
        document.getElementById('btn-new')?.addEventListener('click', () => this.newGraph());
        document.getElementById('btn-open')?.addEventListener('click', () => this.openGraph());
        document.getElementById('btn-save')?.addEventListener('click', () => this.saveGraph());
        document.getElementById('btn-export')?.addEventListener('click', () => this.exportGraph());
        
        // Undo/Redo
        document.getElementById('btn-undo')?.addEventListener('click', () => this.undo());
        document.getElementById('btn-redo')?.addEventListener('click', () => this.redo());
        
        // Tool buttons
        document.getElementById('tool-select')?.addEventListener('click', () => this.setTool('select'));
        document.getElementById('tool-add-node')?.addEventListener('click', () => this.setTool('add-node'));
        document.getElementById('tool-add-edge')?.addEventListener('click', () => this.setTool('add-edge'));
        document.getElementById('tool-pan')?.addEventListener('click', () => this.setTool('pan'));
        
        // Advanced features
        document.getElementById('btn-layout')?.addEventListener('click', () => this.applyLayout());
        document.getElementById('btn-shortest-path')?.addEventListener('click', () => this.showPathModal());
        document.getElementById('btn-cluster')?.addEventListener('click', () => this.clusterNodes());
        
        // Renderer event handlers
        this.renderer.onNodeClick = (node) => this.handleNodeClick(node);
        this.renderer.onEdgeClick = (edge) => this.handleEdgeClick(edge);
        this.renderer.onCanvasClick = () => this.handleCanvasClick();
        this.renderer.onNodeDragEnd = () => this.saveState();
        
        // Canvas tool interactions - only for background clicks
		const canvas = document.getElementById('graph-canvas');
		canvas.addEventListener('click', (e) => {
			// Only handle clicks on the actual canvas/background, not on edges or nodes
			const target = e.target;
			const isCanvasBackground = target.tagName === 'svg' || 
									   target.tagName === 'SVG' || 
									   target.classList.contains('graph-canvas') ||
									   target.tagName === 'g';
			
			if (isCanvasBackground) {
				this.handleCanvasToolClick(e);
			}
		});
        
        // Simulation updates
        this.renderer.simulation.on('tick', () => {
            this.minimap.update(this.graph.nodes, this.graph.edges);
        });
        
        this.renderer.simulation.on('end', () => {
            this.minimap.update(this.graph.nodes, this.graph.edges);
        });
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Check if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            const ctrl = e.ctrlKey || e.metaKey;

            // Ctrl/Cmd + N - New
            if (ctrl && e.key === 'n') {
                e.preventDefault();
                this.newGraph();
            }

            // Ctrl/Cmd + O - Open
            if (ctrl && e.key === 'o') {
                e.preventDefault();
                this.openGraph();
            }

            // Ctrl/Cmd + S - Save
            if (ctrl && e.key === 's') {
                e.preventDefault();
                this.saveGraph();
            }

            // Ctrl/Cmd + Z - Undo
            if (ctrl && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
            }

            // Ctrl/Cmd + Shift + Z - Redo
            if (ctrl && e.key === 'z' && e.shiftKey) {
                e.preventDefault();
                this.redo();
            }

            // Ctrl/Cmd + F - Focus search
            if (ctrl && e.key === 'f') {
                e.preventDefault();
                document.getElementById('search-input')?.focus();
            }

            // Delete - Delete selected
            if (e.key === 'Delete' || e.key === 'Backspace') {
                this.deleteSelected();
            }

            // Escape - Deselect / Cancel tool
            if (e.key === 'Escape') {
                this.setTool('select');
                this.renderer.clearSelection();
                this.propertiesPanel.hide();
                this.edgeSourceNode = null;
                this.updateStatus('Cancelled');
            }

            // Tool shortcuts
            if (e.key === 'v' || e.key === 'V') {
                this.setTool('select');
            }
            if (e.key === 'n' || e.key === 'N') {
                this.setTool('add-node');
            }
            if (e.key === 'e' || e.key === 'E') {
                this.setTool('add-edge');
            }

            // Space - Pan tool (hold)
            if (e.key === ' ') {
                e.preventDefault();
                // Space key panning is handled by D3 zoom behavior
            }
			// U - Unpin all nodes
			if (e.key === 'u' || e.key === 'U') {
				this.renderer.unpinAllNodes();
				this.updateStatus('All nodes unpinned');
			}
        });
    }

    /**
     * Set current tool
     */
    setTool(tool) {
        this.currentTool = tool;
        
        // Update tool button states
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const toolBtn = document.getElementById(`tool-${tool}`);
        if (toolBtn) {
            toolBtn.classList.add('active');
        }
        
        // Update canvas cursor
        const canvas = document.getElementById('graph-canvas');
        canvas.classList.remove('adding-node', 'adding-edge', 'panning');
        
        if (tool === 'add-node') {
            canvas.classList.add('adding-node');
            this.updateStatus('Click on canvas to add a node');
        } else if (tool === 'add-edge') {
            canvas.classList.add('adding-edge');
            this.edgeSourceNode = null;
            this.updateStatus('Click on a node to start creating an edge');
        } else if (tool === 'pan') {
            canvas.classList.add('panning');
            this.updateStatus('Pan mode active');
        } else {
            this.updateStatus('Select mode');
        }
    }

    /**
     * Handle canvas click for tool actions
     */
    handleCanvasToolClick(event) {
        if (this.currentTool === 'add-node') {
            // Get click position relative to graph coordinates
            const svgElement = document.getElementById('graph-canvas');
            const pt = svgElement.createSVGPoint();
            pt.x = event.clientX;
            pt.y = event.clientY;
            
            const transform = this.renderer.currentTransform;
            const x = (pt.x - transform.x) / transform.k;
            const y = (pt.y - transform.y) / transform.k;
            
            this.addNode(x, y);
        }
    }

    /**
     * Handle node click
     */
    handleNodeClick(node) {
		if (this.currentTool === 'select') {
			// Check for double-click to unpin
			const now = Date.now();
			if (this.lastNodeClick === node.id && (now - this.lastNodeClickTime) < 300) {
				// Double-click detected - unpin the node
				this.renderer.unpinNode(node.id);
				this.updateStatus(`Unpinned: ${node.id}`);
				this.lastNodeClick = null;
				return;
			}
			this.lastNodeClick = node.id;
			this.lastNodeClickTime = now;
			
			this.renderer.selectNodes([node.id]);
			this.renderer.selectEdges([]);
			this.propertiesPanel.showNodeProperties(node.id);
			this.updateStatus(`Selected: ${node.id}`);
		} else if (this.currentTool === 'add-edge') {
            if (!this.edgeSourceNode) {
                this.edgeSourceNode = node.id;
                this.renderer.selectNodes([node.id]);
                this.updateStatus(`Source selected. Click on target node to create edge.`);
            } else {
                this.addEdge(this.edgeSourceNode, node.id);
                this.edgeSourceNode = null;
                this.renderer.clearSelection();
            }
        }
    }

    /**
     * Handle edge click
     */
    handleEdgeClick(edge) {
        if (this.currentTool === 'select') {
            this.renderer.selectEdges([edge.id]);
            this.renderer.selectNodes([]);
            this.propertiesPanel.showEdgeProperties(edge.id);
            this.updateStatus(`Selected: ${edge.id}`);
        }
    }

    /**
     * Handle canvas click (empty space)
     */
    handleCanvasClick() {
        if (this.currentTool === 'select') {
            this.renderer.clearSelection();
            this.propertiesPanel.hide();
            this.updateStatus('Deselected');
        }
    }

    /**
     * Add a new node
     */
    addNode(x, y) {
        const nodeId = prompt('Enter node ID:', `node_${this.graph.nodes.length + 1}`);
        if (!nodeId) return;

        // Check for duplicate ID
        if (this.graph.getNode(nodeId)) {
            alert('A node with this ID already exists');
            return;
        }

        const node = this.graph.addNode({
            id: nodeId,
            color: '#3498db',
            size: 10,
            description: ''
        });

        // Set initial position
        node.x = x;
        node.y = y;
        node.fx = x;
        node.fy = y;

        this.renderer.render();
        this.updateStats();
        this.saveState();
        this.updateStatus(`Node ${nodeId} created`);
    }

    /**
     * Add a new edge
     */
    addEdge(sourceId, targetId) {
        if (sourceId === targetId) {
            alert('Cannot create self-loop edges');
            return;
        }

        const edge = this.graph.addEdge(sourceId, targetId, {
            type: 'related',
            color: '#95a5a6',
            weight: 1,
            directed: true,
            description: ''
        });

        if (!edge) {
            alert('Edge already exists or invalid nodes');
            return;
        }

        this.renderer.render();
        this.updateStats();
        this.saveState();
        this.updateStatus(`Edge created: ${sourceId} → ${targetId}`);
    }

    /**
     * Delete selected elements
     */
    deleteSelected() {
        const selectedNodes = Array.from(this.renderer.selectedNodes);
        const selectedEdges = Array.from(this.renderer.selectedEdges);

        if (selectedNodes.length === 0 && selectedEdges.length === 0) {
            return;
        }

        const message = `Delete ${selectedNodes.length} node(s) and ${selectedEdges.length} edge(s)?`;
        if (!Utils.confirm(message)) return;

        selectedNodes.forEach(nodeId => this.graph.removeNode(nodeId));
        selectedEdges.forEach(edgeId => this.graph.removeEdge(edgeId));

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
				selectionText = `Edge: ${edge.properties.type || selectedEdge}`;
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
        this.updateStats();
        this.propertiesPanel.hide();
    }

    /**
     * Apply auto layout
     */
    applyLayout() {
        // Reset node positions and restart simulation
        this.graph.nodes.forEach(node => {
            node.fx = null;
            node.fy = null;
        });

        this.renderer.simulation.alpha(1).restart();
        this.updateStatus('Layout applied');
        
        setTimeout(() => {
            this.saveState();
        }, 2000);
    }

    /**
     * Show shortest path modal
     */
    showPathModal() {
    // Check if user has selected nodes
		const selectedNodes = Array.from(this.renderer.selectedNodes);
		
		if (selectedNodes.length === 2) {
			// User already selected 2 nodes - calculate immediately
			this.pathStartNode = selectedNodes[0];
			this.pathEndNode = selectedNodes[1];
			this.calculateShortestPath();
			return;
		}
		
		// Show modal for manual selection
		const modal = document.getElementById('path-modal');
		modal?.classList.remove('hidden');

		// Reset path state
		this.pathStartNode = null;
		this.pathEndNode = null;
		this.renderer.clearHighlight();

		document.getElementById('path-start').textContent = 'None';
		document.getElementById('path-end').textContent = 'None';

		const calculateBtn = document.getElementById('btn-calculate-path');
		if (calculateBtn) {
			calculateBtn.disabled = true;
		}

		// Setup event handlers
		this.setupPathModal();
	}
/**
 * Calculate shortest path (extracted method)
 */
calculateShortestPath() {
    if (!this.pathStartNode || !this.pathEndNode) return;
    
    const path = Algorithms.findShortestPath(
        this.graph,
        this.pathStartNode,
        this.pathEndNode
    );

    if (path) {
        this.renderer.highlightNodes(path.nodes);
        this.renderer.highlightEdges(path.edges);
        alert(`Shortest path found!\n` +
              `Path: ${path.nodes.join(' → ')}\n` +
              `Distance: ${path.distance.toFixed(2)}`);
    } else {
        alert('No path found between these nodes');
    }
}
    /**
     * Setup path modal event handlers
     */
    setupPathModal() {
        const modal = document.getElementById('path-modal');
        const calculateBtn = document.getElementById('btn-calculate-path');
        const clearBtn = document.getElementById('btn-clear-path');
        const closeBtn = modal?.querySelector('.modal-close');

        // Override node click for path selection
        const originalNodeClick = this.renderer.onNodeClick;
        this.renderer.onNodeClick = (node) => {
            if (!this.pathStartNode) {
                this.pathStartNode = node.id;
                document.getElementById('path-start').textContent = node.id;
            } else if (!this.pathEndNode) {
                this.pathEndNode = node.id;
                document.getElementById('path-end').textContent = node.id;
                if (calculateBtn) calculateBtn.disabled = false;
            }
        };

        // Calculate path
const handleCalculate = () => {
    this.calculateShortestPath();
};

        // Clear selection
        const handleClear = () => {
            this.pathStartNode = null;
            this.pathEndNode = null;
            document.getElementById('path-start').textContent = 'None';
            document.getElementById('path-end').textContent = 'None';
            this.renderer.clearHighlight();
            if (calculateBtn) calculateBtn.disabled = true;
        };

        // Close modal
        const handleClose = () => {
            modal?.classList.add('hidden');
            this.renderer.onNodeClick = originalNodeClick;
            this.renderer.clearHighlight();
        };

        calculateBtn?.addEventListener('click', handleCalculate, { once: true });
        clearBtn?.addEventListener('click', handleClear);
        closeBtn?.addEventListener('click', handleClose, { once: true });
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) handleClose();
        });
    }

    /**
     * Cluster nodes
     */
    clusterNodes() {
        const property = prompt('Enter property name to cluster by:', 'type');
        if (!property) return;

        const clusters = Algorithms.clusterByProperty(this.graph, property);
        const clusterCount = Object.keys(clusters).length;

        alert(`Found ${clusterCount} clusters based on property "${property}"`);

        // Assign colors to clusters
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
        let colorIndex = 0;

        Object.values(clusters).forEach(nodeIds => {
            const color = colors[colorIndex % colors.length];
            nodeIds.forEach(nodeId => {
                this.graph.updateNode(nodeId, { color });
            });
            colorIndex++;
        });

        this.renderer.render();
        this.saveState();
        this.updateStatus(`Clustered by ${property}`);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new KnowledgeGraphApp();
});
