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
        this.filterManager = new FilterManager(this.graph, this.renderer);
        this.contextMenuManager = new ContextMenuManager(this);
        this.excelConverter = new ExcelConverter(this.graph, this.renderer);
        
        // Current tool
        this.currentTool = 'select';
		
		this.lastNodeColor = '#3498db';
		this.lastNodeIcon = '';
        
        // Temporary state for adding edges
        this.edgeSourceNode = null;
        
        // Shortest path state
        this.pathStartNode = null;
        this.pathEndNode = null;
        this.lastNodeClick = null;
        this.lastNodeClickTime = 0;
        
        // Connect by click state
        this.connectByClickSourceNode = null;
        this.connectByClickActive = false;
		
		// Force strength
		this.currentForceStrength = 200;
           
        // Setup
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
		this.setupPrivacyNotice();

        this.updateStats();
        
        // Initial state
        this.saveState();
		
		// Check if we should load data for new tab
		this.checkForNewTabData();

		// Prompt for welcome graph if empty (after a short delay to let everything initialize)
		setTimeout(() => this.promptForWelcomeGraphIfEmpty(), 100);

		// Make app globally accessible
		window.app = this;
    }
	
	/**
     * Setup privacy banner and modal
     */
    setupPrivacyNotice() {
        const banner = document.getElementById('privacy-banner');
        const dismissBtn = document.getElementById('privacy-banner-dismiss');
        const privacyStatus = document.getElementById('status-privacy');
        const privacyModal = document.getElementById('privacy-modal');
        
        // Check if user has dismissed the banner before
        const bannerDismissed = localStorage.getItem('nodebook-privacy-banner-dismissed');
        
        if (!bannerDismissed) {
            // Show banner on first visit
            banner?.classList.remove('hidden');
            document.body.classList.add('privacy-banner-visible');
        }
        
        // Dismiss banner
        dismissBtn?.addEventListener('click', () => {
            banner?.classList.add('hidden');
            document.body.classList.remove('privacy-banner-visible');
            localStorage.setItem('nodebook-privacy-banner-dismissed', 'true');
        });
        
        // Show privacy modal when clicking status bar privacy link
        privacyStatus?.addEventListener('click', () => {
            privacyModal?.classList.remove('hidden');
        });
        
        // Close privacy modal
        const closeModalBtn = privacyModal?.querySelector('.modal-close');
        closeModalBtn?.addEventListener('click', () => {
            privacyModal?.classList.add('hidden');
        });
        
        // Close modal when clicking outside
        privacyModal?.addEventListener('click', (e) => {
            if (e.target === privacyModal) {
                privacyModal.classList.add('hidden');
            }
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Sidebar tab switching
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
		document.getElementById('btn-open-in-new-tab')?.addEventListener('click', () => this.openInNewTab());
        document.getElementById('btn-export')?.addEventListener('click', () => this.exportGraph());
		// Explode Graph button
		document.getElementById('btn-explode-graph')?.addEventListener('click', () => {
			ExplodeGraph.showExplodeDialog(this);
		});
		document.getElementById('btn-github')?.addEventListener('click', () => {
            window.open('https://github.com/mqc2025/KG-Builder-Project', '_blank');
        });
        document.getElementById('btn-help')?.addEventListener('click', () => {
            window.open('help.html', '_blank');
        });
        document.getElementById('btn-undo')?.addEventListener('click', () => this.undo());
        document.getElementById('btn-redo')?.addEventListener('click', () => this.redo());
        document.getElementById('btn-filter')?.addEventListener('click', () => this.filterManager.showFilterModal());
        
        // Tool buttons
        document.getElementById('btn-freeze')?.addEventListener('click', () => this.toggleFreeze());
        document.getElementById('btn-layout')?.addEventListener('click', () => this.resimulate());
        document.getElementById('btn-shortest-path')?.addEventListener('click', () => this.startShortestPath());
		document.getElementById('btn-add-graph')?.addEventListener('click', () => this.addGraphFromFile());

		// Add graph file input handler
		const addGraphInput = document.getElementById('add-graph-input');
		addGraphInput?.addEventListener('change', (e) => this.handleAddGraphFile(e));
		
		// Force strength slider
		document.getElementById('force-slider')?.addEventListener('input', (e) => {
			this.updateForceStrength(parseInt(e.target.value));
		});
		
        
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
		
		// Mobile sidebar toggle
		const mobileSidebarToggle = document.getElementById('mobile-sidebar-toggle');
		const leftSidebar = document.querySelector('.left-sidebar');

		if (mobileSidebarToggle && leftSidebar) {
			mobileSidebarToggle.addEventListener('click', () => {
				leftSidebar.classList.toggle('mobile-open');
				mobileSidebarToggle.classList.toggle('open');

			});
			
			// Close sidebar when a tool is selected on mobile
			document.querySelectorAll('.tool-btn').forEach(btn => {
				btn.addEventListener('click', () => {
					if (window.innerWidth <= 768) {
						setTimeout(() => {
							leftSidebar.classList.remove('mobile-open');
							mobileSidebarToggle.classList.remove('open');
						}, 300);
					}
				});
			});
		}
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
            
            // Delete: Delete selection (but not when typing in inputs)
			if (e.key === 'Delete') {
				// Check if user is currently typing in an input or textarea
				const activeElement = document.activeElement;
				const isTyping = activeElement && 
								 (activeElement.tagName === 'INPUT' || 
								  activeElement.tagName === 'TEXTAREA' ||
								  activeElement.isContentEditable);
				
				// Only delete selection if NOT typing
				if (!isTyping) {
					e.preventDefault();
					this.deleteSelection();
				}
			}
            
            // Escape: Clear selection OR cancel connect-by-click mode
            if (e.key === 'Escape') {
                e.preventDefault();
                
                // Cancel connect by click if active
                if (this.connectByClickActive) {
                    this.cancelConnectByClick();
                } else {
                    this.renderer.clearSelection();
                    this.propertiesPanel.hide();
                    this.updateStatus('Selection cleared');
                }
            }
        });
    }

    /**
	 * Handle node click
	 */
	handleNodeClick(node) {
		// Check if in connect by click mode
		if (this.connectByClickActive) {
			this.completeConnectByClick(node);
			return;
		}
		
		// Check if in shortest path mode
		if (this.currentTool === 'shortest-path') {
			this.selectPathNode(node);
			return;
		}
		
		// Clear filter if active
		if (this.filterManager && this.filterManager.isActive()) {
			this.filterManager.clearFilter();
		}
		
		// Clear edge selection and select the node
		this.renderer.selectedEdges.clear();
		this.renderer.selectNodes([node.id]);
		
		// Show properties panel
		this.propertiesPanel.showNodeProperties(node.id);
		
		this.updateStatus(`Selected node: ${node.name || node.id}`);
	}

    /**
	 * Handle edge click
	 */
	handleEdgeClick(edge) {
		// Clear filter if active
		if (this.filterManager && this.filterManager.isActive()) {
			this.filterManager.clearFilter();
		}
		
		// Clear node selection and select the edge
		this.renderer.selectedNodes.clear();
		this.renderer.selectEdges([edge.id]);
		
		// Show properties panel
		this.propertiesPanel.showEdgeProperties(edge.id);
		
		this.updateStatus(`Selected edge: ${edge.name || edge.id}`);
	}

    /**
     * Handle canvas click
     */
    handleCanvasClick() {
        // Cancel connect by click if active
        if (this.connectByClickActive) {
            this.cancelConnectByClick();
            return;
        }
        
        this.renderer.clearSelection();
        this.propertiesPanel.hide();
        this.updateStatus('Selection cleared');
    }

    /**
     * Start connect by click mode
     */
    startConnectByClick(sourceNode) {
        this.connectByClickSourceNode = sourceNode;
        this.connectByClickActive = true;
        
        // Update cursor
        const canvas = document.getElementById('graph-canvas');
        canvas.classList.add('connecting');
        
        // Highlight source node
        this.renderer.selectNodes([sourceNode.id]);
        
        this.updateStatus(`Connect by Click: Click target node (ESC to cancel)`);
    }

    /**
	 * Complete connect by click
	 */
	async completeConnectByClick(targetNode) {
		// Check if same node
		if (targetNode.id === this.connectByClickSourceNode.id) {
			this.updateStatus('Cannot connect node to itself');
			return;
		}
		
		const initialSourceId = this.connectByClickSourceNode.id;
		const initialTargetId = targetNode.id;
		
		// Get all existing relationships for the dropdown
		const allRelationships = this.graph.getAllEdgeRelationships();
		
		// Get all nodes for the dropdowns
		const allNodes = this.graph.getAllNodeIds().map(id => {
			const node = this.graph.getNode(id);
			return {
				id: id,
				name: node ? (node.name || id) : id
			};
		});
		
		// Create modal for connection input
		const modal = document.createElement('div');
		modal.className = 'modal-overlay';
		modal.innerHTML = `
			<div class="modal-content">
				<h3>Create Connection</h3>
				<div class="form-group">
					<label>From:</label>
					<select id="quick-connect-from" class="property-input">
						${allNodes.map(node => 
							`<option value="${Utils.sanitizeHtml(node.id)}" ${node.id === initialSourceId ? 'selected' : ''}>${Utils.sanitizeHtml(node.name)}</option>`
						).join('')}
					</select>
				</div>
				<div class="form-group">
					<label>To:</label>
					<select id="quick-connect-to" class="property-input">
						${allNodes.map(node => 
							`<option value="${Utils.sanitizeHtml(node.id)}" ${node.id === initialTargetId ? 'selected' : ''}>${Utils.sanitizeHtml(node.name)}</option>`
						).join('')}
					</select>
				</div>
				<div class="form-group">
					<label>Direction:</label>
					<div class="direction-radio-group">
						<label class="radio-option">
							<input type="radio" name="quick-connection-direction" value="outgoing" checked>
							<span>→ Outgoing (from this node)</span>
						</label>
						<label class="radio-option">
							<input type="radio" name="quick-connection-direction" value="incoming">
							<span>← Incoming (to this node)</span>
						</label>
					</div>
				</div>
				<div class="form-group">
					<label>Relationship (optional):</label>
					<input type="text" id="quick-connect-relationship" class="property-input" 
						   list="quick-relationship-list" 
						   placeholder="Type or select...">
					<datalist id="quick-relationship-list">
						${allRelationships.map(rel => `<option value="${Utils.sanitizeHtml(rel)}">`).join('')}
					</datalist>
				</div>
				<div class="modal-actions">
					<button class="btn-primary" id="btn-confirm-quick-connect">Connect</button>
					<button class="btn-secondary" id="btn-cancel-quick-connect">Cancel</button>
				</div>
			</div>
		`;
		
		document.body.appendChild(modal);
		
		const confirmBtn = modal.querySelector('#btn-confirm-quick-connect');
		const cancelBtn = modal.querySelector('#btn-cancel-quick-connect');
		const relationshipInput = modal.querySelector('#quick-connect-relationship');
		
		// Focus the input
		setTimeout(() => relationshipInput.focus(), 100);
		
		// Handle confirm
		const completeConnection = async () => {
			const fromSelect = modal.querySelector('#quick-connect-from');
			const toSelect = modal.querySelector('#quick-connect-to');
			const directionRadio = modal.querySelector('input[name="quick-connection-direction"]:checked');
			const relationship = relationshipInput.value.trim();
			
			const selectedFromId = fromSelect.value;
			const selectedToId = toSelect.value;
			const direction = directionRadio ? directionRadio.value : 'outgoing';
			
			// Validate not same node
			if (selectedFromId === selectedToId) {
				alert('Cannot connect a node to itself.');
				return;
			}
			
			// Determine actual source and target based on direction
			let actualSourceId, actualTargetId;
			if (direction === 'outgoing') {
				actualSourceId = selectedFromId;
				actualTargetId = selectedToId;
			} else {
				// Incoming: swap from/to
				actualSourceId = selectedToId;
				actualTargetId = selectedFromId;
			}
			
			// Auto-generate edge name
			const timestamp = Date.now();
			const edgeName = `edge_${timestamp}`;
			
			// Create edge object
			const edgeData = {
				name: edgeName,
				source: actualSourceId,
				target: actualTargetId,
				directed: true
			};
			
			// Add relationship if provided
			if (relationship) {
				edgeData.relationship = relationship;
			}
			
			await this.graph.addEdge(edgeData);
			
			this.renderer.render();
			this.updateStats();
			this.saveState();
			
			const sourceNode = this.graph.getNode(actualSourceId);
			const targetNodeObj = this.graph.getNode(actualTargetId);
			const sourceNodeName = sourceNode ? (sourceNode.name || actualSourceId) : actualSourceId;
			const targetNodeName = targetNodeObj ? (targetNodeObj.name || actualTargetId) : actualTargetId;
			
			// Cancel mode and remove modal
			this.cancelConnectByClick();
			document.body.removeChild(modal);
			
			this.updateStatus(`Connected: ${sourceNodeName} → ${targetNodeName}`);
		};
		
		confirmBtn.addEventListener('click', completeConnection);
		
		// Allow Enter key to confirm
		relationshipInput.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				completeConnection();
			}
		});
		
		// Handle cancel
		const cancelConnection = () => {
			document.body.removeChild(modal);
			this.cancelConnectByClick();
		};
		
		cancelBtn.addEventListener('click', cancelConnection);
		
		// Close on Escape
		const escapeHandler = (e) => {
			if (e.key === 'Escape') {
				cancelConnection();
				document.removeEventListener('keydown', escapeHandler);
			}
		};
		document.addEventListener('keydown', escapeHandler);
		
		// Close on overlay click
		modal.addEventListener('click', (e) => {
			if (e.target === modal) {
				cancelConnection();
			}
		});
	}

    /**
     * Cancel connect by click mode
     */
    cancelConnectByClick() {
        this.connectByClickSourceNode = null;
        this.connectByClickActive = false;
        
        // Remove cursor class
        const canvas = document.getElementById('graph-canvas');
        canvas.classList.remove('connecting');
        
        // Clear selection
        this.renderer.clearSelection();
        
        this.updateStatus('Connect by click cancelled');
    }

    /**
     * Toggle freeze simulation
     */
    toggleFreeze() {
        if (this.renderer.isFrozen) {
            // Unfreeze: unpin all nodes and restart simulation
            this.renderer.unpinAllNodes();
            this.renderer.unfreezeSimulation();
            this.updateStatus('Unfrozen: All nodes unpinned, simulation active');
        } else {
            // Freeze: pin all nodes at current positions and stop simulation
            this.renderer.pinAllNodes();
            this.renderer.freezeSimulation();
            this.updateStatus('Frozen: All nodes pinned, simulation stopped');
        }
        
        // Update button UI
        const btn = document.getElementById('btn-freeze');
        if (btn) {
            const icon = btn.querySelector('span:first-child');
            const label = btn.querySelector('.tool-label');
            if (this.renderer.isFrozen) {
                icon.textContent = '▶️';
                label.textContent = 'Unfreeze';
                btn.classList.add('active');
            } else {
                icon.textContent = '❄️';
                label.textContent = 'Freeze';
                btn.classList.remove('active');
            }
        }
        
        this.updateSimulationStatus();
    }

    /**
	 * Resimulate graph
	 */
	resimulate() {
		// Shuffle nodes with random displacement to help untangle
		this.graph.nodes.forEach(node => {
			// Add random offset pixels
			const offsetX = (Math.random() - 0.5) * 200;
			const offsetY = (Math.random() - 0.5) * 200;
			
			node.x += offsetX;
			node.y += offsetY;
			
			// If node was pinned, update fixed position too
			if (node.fx !== null && node.fx !== undefined) {
				node.fx += offsetX;
			}
			if (node.fy !== null && node.fy !== undefined) {
				node.fy += offsetY;
			}
		});
		
		// Unpin all nodes
		this.renderer.unpinAllNodes();
		
		// Unfreeze if frozen
		if (this.renderer.isFrozen) {
			this.renderer.unfreezeSimulation();
			
			// Update freeze button UI
			const btn = document.getElementById('btn-freeze');
			if (btn) {
				const icon = btn.querySelector('span:first-child');
				const label = btn.querySelector('.tool-label');
				icon.textContent = '❄️';
				label.textContent = 'Freeze';
				btn.classList.remove('active');
			}
		}
		
		// Restart simulation with higher alpha for more movement
		this.renderer.restartSimulation();
		
		this.updateStatus('Simulation restarted with shuffle - all nodes unpinned');
		this.updateSimulationStatus();
	}
	
	/**
	 * Update simulation force strength
	 */
	updateForceStrength(strength) {
		this.currentForceStrength = strength;
		
		// Update display
		const valueDisplay = document.getElementById('force-value');
		if (valueDisplay) {
			valueDisplay.textContent = strength;
		}
		
		// Update renderer
		this.renderer.updateForceStrength(strength);
		
		this.updateStatus(`Force strength: ${strength}`);
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
	 * Add graph from file - prompts user and consolidates nodes
	 */
	addGraphFromFile() {
		if (!confirm('You are about to add the content of another JSON file to the current graph.\n\nNodes with the same "name" will be consolidated, but all edges will be preserved (including multiple edges between nodes).\n\nContinue?')) {
			return;
		}
		
		const fileInput = document.getElementById('add-graph-input');
		if (fileInput) {
			fileInput.click();
		}
	}
	
	/**
	 * Handle add graph file selection
	 */
	async handleAddGraphFile(event) {
		const file = event.target.files[0];
		if (!file) return;

		if (!file.name.endsWith('.json')) {
			alert('Please select a JSON file');
			event.target.value = '';
			return;
		}

		// Security: Check file size
		const MAX_JSON_SIZE = 50 * 1024 * 1024; // 50MB
		if (file.size > MAX_JSON_SIZE) {
			const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
			const maxSizeMB = (MAX_JSON_SIZE / (1024 * 1024)).toFixed(0);
			alert(`Security Error: File too large!\n\nFile size: ${sizeMB} MB\nMaximum allowed: ${maxSizeMB} MB`);
			event.target.value = '';
			return;
		}

		const reader = new FileReader();
		reader.onload = async (e) => {
			try {
				const json = JSON.parse(e.target.result);
				await this.addGraphToCurrentGraph(json);
				event.target.value = '';
			} catch (error) {
				alert('Error reading file: ' + error.message);
				console.error('Add graph error:', error);
				event.target.value = '';
			}
		};

		reader.readAsText(file);
	}

	/**
	 * Add graph to current graph with node consolidation
	 */
	async addGraphToCurrentGraph(newGraphJson) {
		Utils.showLoading();
		
		try {
			// Extract nodes and edges from new graph
			const newNodes = newGraphJson.graph?.nodes || newGraphJson.nodes || [];
			const newEdges = newGraphJson.graph?.edges || newGraphJson.edges || [];
			
			if (newNodes.length === 0) {
				throw new Error('No nodes found in the selected graph');
			}
			
			// Create a map of existing node names to IDs
			const existingNodesByName = new Map();
			this.graph.nodes.forEach(node => {
				if (node.name) {
					existingNodesByName.set(node.name.toLowerCase(), node.id);
				}
			});
			
			// Map to track old IDs to new IDs (for edge updating)
			const idMapping = new Map();
			
			// Process new nodes
			let nodesAdded = 0;
			let nodesConsolidated = 0;
			
			for (const newNode of newNodes) {
				if (!newNode.name) {
					console.warn('Skipping node without name:', newNode);
					continue;
				}
				
				const nameLower = newNode.name.toLowerCase();
				
				// Check if node with same name exists
				if (existingNodesByName.has(nameLower)) {
					// Node exists - map old ID to existing ID
					const existingId = existingNodesByName.get(nameLower);
					idMapping.set(newNode.id, existingId);
					nodesConsolidated++;
				} else {
					// Node doesn't exist - add it
					const addedNode = await this.graph.addNode(newNode);
					idMapping.set(newNode.id, addedNode.id);
					existingNodesByName.set(nameLower, addedNode.id);
					nodesAdded++;
				}
			}
			
			// Process edges with updated node references
			let edgesAdded = 0;
			
			for (const newEdge of newEdges) {
				// Map source and target to new IDs
				const sourceId = idMapping.get(newEdge.source) || newEdge.source;
				const targetId = idMapping.get(newEdge.target) || newEdge.target;
				
				// Add edge (even if duplicate - as per requirements)
				await this.graph.addEdge({
					...newEdge,
					source: sourceId,
					target: targetId
				});
				
				edgesAdded++;
			}
			
			// Render and update
			this.renderer.render();
			
			setTimeout(() => {
				this.renderer.fitToView();
			}, 150);
			
			this.updateStats();
			this.saveState();
			
			Utils.hideLoading();
			
			const message = `Graph added successfully!\n\n` +
						   `Nodes added: ${nodesAdded}\n` +
						   `Nodes consolidated: ${nodesConsolidated}\n` +
						   `Edges added: ${edgesAdded}`;
			
			alert(message);
			this.updateStatus(`Added graph: ${nodesAdded} new nodes, ${nodesConsolidated} consolidated, ${edgesAdded} edges`);
			
		} catch (error) {
			Utils.hideLoading();
			alert('Error adding graph: ' + error.message);
			console.error('Add graph error:', error);
		}
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
        const showAllCheckbox = document.getElementById('path-show-all');
        
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
            const showAll = showAllCheckbox?.checked || false;
            
            if (startId && endId) {
                this.calculateShortestPath(startId, endId, showAll);
            }
        });
        
        // Clear path
        clearBtn?.addEventListener('click', () => {
            this.renderer.clearHighlight();
            const resultsDiv = document.getElementById('path-results');
            if (resultsDiv) {
                resultsDiv.innerHTML = '';
            }
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
     * Calculate shortest path or all paths
     */
    calculateShortestPath(startId, endId, showAll = false) {
        if (showAll) {
            // Find all paths
            const paths = Algorithms.findAllPaths(this.graph, startId, endId, true);
            
            if (paths.length === 0) {
                alert('No path found between selected nodes');
                return;
            }
            
            // Display all paths
            this.displayAllPaths(paths, startId, endId);
            
            // Highlight the shortest path
            const shortestPath = paths[0];
            this.renderer.highlightNodes(shortestPath.nodes);
            this.renderer.highlightEdges(shortestPath.edges);
            
            this.updateStatus(`Found ${paths.length} path(s) between nodes`);
        } else {
            // Find only shortest path
            const result = Algorithms.findShortestPath(this.graph, startId, endId, true);
            
            if (!result) {
                alert('No path found between selected nodes');
                return;
            }
            
            // Highlight the path
            this.renderer.highlightNodes(result.nodes);
            this.renderer.highlightEdges(result.edges);
            
            // Display single path result
            this.displaySinglePath(result, startId, endId);
            
            this.updateStatus(`Shortest path: ${result.nodes.length} nodes, distance: ${result.distance.toFixed(2)}`);
        }
    }
    
    /**
     * Display single path result
     */
    displaySinglePath(result, startId, endId) {
        const resultsDiv = document.getElementById('path-results');
        if (!resultsDiv) return;
        
        const startNode = this.graph.getNode(startId);
        const endNode = this.graph.getNode(endId);
        
        const startName = startNode ? startNode.name : startId;
        const endName = endNode ? endNode.name : endId;
        
        const pathNames = result.nodes.map(nodeId => {
            const node = this.graph.getNode(nodeId);
            return node ? node.name : nodeId;
        });
        
        resultsDiv.innerHTML = `
            <div class="path-result-item">
                <div class="path-result-header">
                    <strong>Shortest Path Found</strong>
                </div>
                <div class="path-result-details">
                    <div><strong>From:</strong> ${startName}</div>
                    <div><strong>To:</strong> ${endName}</div>
                    <div><strong>Hops:</strong> ${result.nodes.length - 1}</div>
                    <div><strong>Distance:</strong> ${result.distance.toFixed(2)}</div>
                    <div class="path-route"><strong>Route:</strong> ${pathNames.join(' → ')}</div>
                </div>
            </div>
        `;
    }
    
    /**
     * Display all paths results
     */
    displayAllPaths(paths, startId, endId) {
        const resultsDiv = document.getElementById('path-results');
        if (!resultsDiv) return;
        
        const startNode = this.graph.getNode(startId);
        const endNode = this.graph.getNode(endId);
        
        const startName = startNode ? startNode.name : startId;
        const endName = endNode ? endNode.name : endId;
        
        let html = `<div class="path-results-summary">
            <strong>Found ${paths.length} path(s) from "${startName}" to "${endName}"</strong>
        </div>`;
        
        paths.forEach((path, index) => {
            const pathNames = path.nodes.map(nodeId => {
                const node = this.graph.getNode(nodeId);
                return node ? node.name : nodeId;
            });
            
            html += `
                <div class="path-result-item" data-path-index="${index}">
                    <div class="path-result-header">
                        <strong>Path ${index + 1}</strong>
                        ${index === 0 ? '<span class="path-shortest-badge">Shortest</span>' : ''}
                    </div>
                    <div class="path-result-details">
                        <div><strong>Hops:</strong> ${path.length}</div>
                        <div><strong>Distance:</strong> ${path.distance.toFixed(2)}</div>
                        <div class="path-route">${pathNames.join(' → ')}</div>
                    </div>
                </div>
            `;
        });
        
        resultsDiv.innerHTML = html;
        
        // Add click handlers to highlight individual paths
        resultsDiv.querySelectorAll('.path-result-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                const path = paths[index];
                this.renderer.highlightNodes(path.nodes);
                this.renderer.highlightEdges(path.edges);
                
                // Remove active class from all items
                resultsDiv.querySelectorAll('.path-result-item').forEach(i => {
                    i.classList.remove('active');
                });
                // Add active class to clicked item
                item.classList.add('active');
                
                this.updateStatus(`Showing path ${index + 1}: ${path.length} hops, distance ${path.distance.toFixed(2)}`);
            });
        });
        
        // Mark first path as active
        const firstItem = resultsDiv.querySelector('.path-result-item');
        if (firstItem) {
            firstItem.classList.add('active');
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

    /* ===========================================
	   APP.JS MODIFICATION - updateStatus() FUNCTION
	   WITH EXTRA SPACING BEFORE DESCRIPTION
	   =========================================== */

	/* LOCATION: In js/app.js, replace the existing updateStatus() function */

	/**
	 * Update status message with node/edge details
	 * Displays selection info on line 1, stats on line 2
	 */
	updateStatus(message) {
		const selectedNode = Array.from(this.renderer.selectedNodes)[0];
		const selectedEdge = Array.from(this.renderer.selectedEdges)[0];
		
		let selectionText = 'Selected: None';
		
		if (selectedNode) {
			const node = this.graph.getNode(selectedNode);
			if (node) {
				// Build node selection text with properties
				const parts = [`Selected: ${node.name || selectedNode}`];
				
				// Add Category if exists
				if (node.category && node.category.trim() !== '') {
					parts.push(`Category: ${node.category}`);
				}
				
				// Add Sub-Category if exists
				if (node.subCat && node.subCat.trim() !== '') {
					parts.push(`Sub-Category: ${node.subCat}`);
				}
				
				// Add Priority if exists
				if (node.priority && node.priority.trim() !== '') {
					parts.push(`Priority: ${node.priority}`);
				}
				
				// Add Deadline if exists
				if (node.deadline && node.deadline.trim() !== '') {
					parts.push(`Deadline: ${node.deadline}`);
				}
				
				// Join the parts so far
				selectionText = parts.join(' | ');
				
				// Add truncated Description with extra spacing if exists
				if (node.description && node.description.trim() !== '') {
					const maxDescLength = 80;
					const desc = node.description.length > maxDescLength 
						? node.description.substring(0, maxDescLength) + '...' 
						: node.description;
					selectionText += `    ||     Description: ${desc}`;  // EXTRA SPACING BEFORE DESCRIPTION
				}
			} else {
				selectionText = `Selected: Node ${selectedNode}`;
			}
		} else if (selectedEdge) {
			const edge = this.graph.getEdge(selectedEdge);
			if (edge) {
				// Build edge selection text
				const parts = [`Selected: Edge: ${edge.name || edge.relationship || selectedEdge}`];
				
				// Add relationship if different from name
				if (edge.relationship && edge.relationship !== edge.name) {
					parts.push(`Relationship: ${edge.relationship}`);
				}
				
				// Add source and target node names
				const sourceNode = this.graph.getNode(edge.source);
				const targetNode = this.graph.getNode(edge.target);
				if (sourceNode && targetNode) {
					parts.push(`From: ${sourceNode.name || edge.source}`);
					parts.push(`To: ${targetNode.name || edge.target}`);
				}
				
				selectionText = parts.join(' | ');
			} else {
				selectionText = `Selected: Edge ${selectedEdge}`;
			}
		}
		
		document.getElementById('status-selection').textContent = selectionText;
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
            modified: Utils.getCurrentDate(),
			copyright: 'Presented to you by MQC INC.'
        };

        // Clear the current filename so Save will prompt
        this.fileManager.clearCurrentFilename();

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
	 * Open file in new tab
	 */
	openInNewTab() {
		this.fileManager.openInNewTab();
	}

	/**
	 * Check if there's data to load for new tab
	 */
	checkForNewTabData() {
		try {
			const tempData = localStorage.getItem('nodebook-open-in-new-tab');
			if (!tempData) return;

			const data = JSON.parse(tempData);
			
			// Check if data is fresh (less than 5 seconds old)
			const age = Date.now() - data.timestamp;
			if (age > 5000) {
				// Too old, clean up
				localStorage.removeItem('nodebook-open-in-new-tab');
				return;
			}

			// Clear the temp data immediately
			localStorage.removeItem('nodebook-open-in-new-tab');

			// Load the graph
			if (data.json && data.filename) {
				this.fileManager.setCurrentFilename(data.filename);
				this.loadGraph(data.json);
				this.updateStatus(`Opened: ${data.filename}.json`);
			}
		} catch (error) {
			console.error('Error loading new tab data:', error);
			localStorage.removeItem('nodebook-open-in-new-tab');
		}
	}
	
	/**
	 * Prompt user to choose between empty graph or welcome graph
	 */
	async promptForWelcomeGraphIfEmpty() {
		// Check if graph is truly empty (no nodes)
		if (this.graph.nodes.length > 0) {
			return; // Already has data
		}
		
		// Check if there's saved data in localStorage
		const savedData = localStorage.getItem('nodebook-autosave');
		if (savedData) {
			try {
				const json = JSON.parse(savedData);
				if (json.graph && json.graph.nodes && json.graph.nodes.length > 0) {
					return; // Has saved data, don't prompt
				}
			} catch (e) {
				// Ignore parsing errors
			}
		}
		
		// Show modal asking user what they want
		this.showWelcomeGraphModal();
	}

	/**
	 * Show modal for choosing empty or welcome graph
	 */
	showWelcomeGraphModal() {
		// Create modal HTML
		const modal = document.createElement('div');
		modal.id = 'welcome-graph-modal';
		modal.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: rgba(0, 0, 0, 0.7);
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 10000;
			backdrop-filter: blur(4px);
		`;
		
		modal.innerHTML = `
			<div style="
				background: var(--bg-primary, #1a1a2e);
				border-radius: 12px;
				padding: 2rem;
				max-width: 500px;
				box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
				border: 1px solid var(--border-color, #34495e);
			">
				<h2 style="
					margin: 0 0 1rem 0;
					color: var(--text-primary, #ecf0f1);
					font-size: 1.5rem;
					display: flex;
					align-items: center;
					gap: 0.5rem;
				">
					<span style="font-size: 2rem;">👋</span>
					Welcome to NodeBook!
				</h2>
				<p style="
					color: var(--text-secondary, #bdc3c7);
					line-height: 1.6;
					margin-bottom: 1.5rem;
				">
					It looks like you're starting fresh. Would you like to begin with an empty canvas, 
					or see a quick welcome graph with helpful tips?
				</p>
				<div style="
					display: flex;
					gap: 1rem;
					justify-content: flex-end;
				">
					<button id="btn-welcome-empty" style="
						padding: 0.75rem 1.5rem;
						background: #34495e;
						color: #ecf0f1;
						border: 1px solid #7f8c8d;
						border-radius: 6px;
						cursor: pointer;
						font-size: 0.95rem;
						font-weight: 500;
						transition: all 0.2s;
					">
						Empty Graph
					</button>
					<button id="btn-welcome-guided" style="
						padding: 0.75rem 1.5rem;
						background: #3498db;
						color: white;
						border: none;
						border-radius: 6px;
						cursor: pointer;
						font-size: 0.95rem;
						font-weight: 500;
						transition: all 0.2s;
					">
						Show Welcome Graph 🎉
					</button>
				</div>
			</div>
		`;
		
		document.body.appendChild(modal);
		
		// Add hover effects
		const emptyBtn = modal.querySelector('#btn-welcome-empty');
		const guidedBtn = modal.querySelector('#btn-welcome-guided');
		
		emptyBtn.addEventListener('mouseenter', () => {
			emptyBtn.style.background = '#4a5f7f';
			emptyBtn.style.borderColor = '#95a5a6';
		});
		emptyBtn.addEventListener('mouseleave', () => {
			emptyBtn.style.background = '#34495e';
			emptyBtn.style.borderColor = '#7f8c8d';
		});
		
		guidedBtn.addEventListener('mouseenter', () => {
			guidedBtn.style.background = '#2980b9';
		});
		guidedBtn.addEventListener('mouseleave', () => {
			guidedBtn.style.background = '#3498db';
		});
		
		// Handle button clicks
		emptyBtn.addEventListener('click', () => {
			modal.remove();
			this.updateStatus('Empty graph ready. Right-click to start building!');
		});
		
		guidedBtn.addEventListener('click', async () => {
			modal.remove();
			await this.loadWelcomeGraph();
		});
	}

	/**
	 * Load a welcome graph with helpful instructions
	 */
	async loadWelcomeGraph() {
		// Create welcome graph with humorous instructions
		const welcomeGraph = {
			graph: {
				metadata: {
					name: 'Welcome to NodeBook! 🎉',
					title: 'Your First Graph',
					description: 'A friendly introduction to get you started',
					created: Utils.getCurrentDate(),
					modified: Utils.getCurrentDate(),
					copyright: 'Presented to you by MQC INC.'
				},
				settings: {
					nodeLabelSize: 12,
					edgeLabelSize: 10,
					worldBoundary: {
						enabled: false,
						minX: -2000,
						maxX: 2000,
						minY: -2000,
						maxY: 2000
					}
				},
				nodes: [
					{
						id: await Utils.generateSHA256('start'),
						name: 'Start Here! 👋',
						color: '#3498db',
						size: 20,
						icon: '🎯',
						description: 'Right-click anywhere on the canvas to add nodes! Click on me to see my properties.',
						x: 400,
						y: 300,
						fx: 400,
						fy: 300
					},
					{
						id: await Utils.generateSHA256('drag'),
						name: 'Drag Me!',
						color: '#2ecc71',
						size: 15,
						icon: '🏃',
						description: 'Hold spacebar and drag to pan around. Or just drag nodes to move them!',
						x: 600,
						y: 250,
						fx: 600,
						fy: 250
					},
					{
						id: await Utils.generateSHA256('tools'),
						name: 'Tools & Shortcuts',
						color: '#9b59b6',
						size: 15,
						icon: '🛠️',
						description: 'Press F to freeze/unfreeze physics. Ctrl+N for new graph. Ctrl+S to save. Check the Help tab for more!',
						x: 400,
						y: 450,
						fx: 400,
						fy: 450
					},
					{
						id: await Utils.generateSHA256('edges'),
						name: 'Connect Nodes',
						color: '#e67e22',
						size: 15,
						icon: '🔗',
						description: 'Right-click on a node and choose "Add Edge" to connect nodes. You can also use the Tools panel!',
						x: 200,
						y: 300,
						fx: 200,
						fy: 300
					},
					{
						id: await Utils.generateSHA256('delete'),
						name: 'Delete Me! (When Ready)',
						color: '#e74c3c',
						size: 12,
						icon: '🗑️',
						description: 'Select any node and press Delete or use Ctrl+N to start fresh. We won\'t cry... much. 😢',
						x: 600,
						y: 400,
						fx: 600,
						fy: 400
					}
				],
				edges: [
					{
						id: await Utils.generateSHA256('edge1'),
						source: await Utils.generateSHA256('start'),
						target: await Utils.generateSHA256('drag'),
						relationship: 'leads to',
						color: '#95a5a6',
						weight: 1,
						directed: true
					},
					{
						id: await Utils.generateSHA256('edge2'),
						source: await Utils.generateSHA256('start'),
						target: await Utils.generateSHA256('edges'),
						relationship: 'connects to',
						color: '#95a5a6',
						weight: 1,
						directed: true
					},
					{
						id: await Utils.generateSHA256('edge3'),
						source: await Utils.generateSHA256('start'),
						target: await Utils.generateSHA256('tools'),
						relationship: 'shows',
						color: '#95a5a6',
						weight: 1,
						directed: true
					},
					{
						id: await Utils.generateSHA256('edge4'),
						source: await Utils.generateSHA256('tools'),
						target: await Utils.generateSHA256('delete'),
						relationship: 'helps with',
						color: '#95a5a6',
						weight: 1,
						directed: true
					}
				]
			}
		};
		
		// Load the welcome graph
		this.loadGraph(welcomeGraph);
		this.updateStatus('Welcome! Right-click on canvas to start building 🚀');
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
     * Generate next available node name
     * @returns {string} Suggested node name (e.g., "Node 1", "Node 2")
     */
    generateNextNodeName() {
        // Find all nodes with names matching "Node X" pattern
        const nodeNumberPattern = /^Node (\d+)$/;
        const existingNumbers = this.graph.nodes
            .map(node => {
                const match = node.name.match(nodeNumberPattern);
                return match ? parseInt(match[1]) : 0;
            })
            .filter(num => num > 0);
        
        // Find the highest number
        const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
        
        // Return next available number
        return `Node ${maxNumber + 1}`;
    }
	
	
	/**
     * Add node at specific position (called from context menu)
     */
    async addNode(x, y) {
        const suggestedName = this.generateNextNodeName();
		const name = prompt('Enter node name:', suggestedName);
		if (!name) return;

        const node = await this.graph.addNode({
            name: name,
            x: x,
            y: y,
            fx: x,
            fy: y,
			color: this.lastNodeColor, // NEW: Use last color
			icon: this.lastNodeIcon     // NEW: Use last icon
        });
		
		// Update last used settings
		this.lastNodeColor = node.color;
		this.lastNodeIcon = node.icon;

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