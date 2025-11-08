// Properties Panel Manager

class PropertiesPanel {
    constructor(graph, renderer) {
        this.graph = graph;
        this.renderer = renderer;
        this.panel = document.getElementById('properties-panel');
        this.content = document.getElementById('properties-content');
        this.closeBtn = document.getElementById('btn-close-properties');
        
        this.currentSelection = null;
        this.currentType = null; // 'node' or 'edge'
        
        // Feature 8: Default color palette
        this.colorPalette = [
            '#3498db', // Blue
            '#2ecc71', // Green
            '#e74c3c', // Red
            '#f39c12', // Orange
            '#9b59b6', // Purple
            '#1abc9c', // Teal
            '#34495e', // Dark Gray
            '#95a5a6'  // Light Gray
        ];
        
        // NEW: Store pending inline edit changes
        this.pendingInlineEdit = null;
        
        this.setupEventListeners();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        this.closeBtn?.addEventListener('click', () => {
            this.hide();
        });
    }

    /**
     * Show panel
     */
    show() {
        this.panel?.classList.remove('hidden');
    }

    /**
     * Hide panel
     */
    hide() {
        this.panel?.classList.add('hidden');
        this.currentSelection = null;
        this.currentType = null;
    }

    /**
     * Display node properties
     */
    showNodeProperties(nodeId) {
        const node = this.graph.getNode(nodeId);
        if (!node) return;

        this.currentSelection = nodeId;
        this.currentType = 'node';
        this.show();

        const html = `
            <div class="property-group">
                <div class="property-group-title">Node Information</div>
                
                <div class="property-item">
                    <label class="property-label">ID (Feature 2: Editable)</label>
                    <input type="text" class="property-input" id="prop-node-id" value="${Utils.sanitizeHtml(node.id)}">
                    <p class="property-hint">Press Enter to save</p>
                </div>

                <div class="property-item">
                    <label class="property-label">Color (Feature 8: Palette)</label>
                    <div class="color-palette">
                        ${this.colorPalette.map(color => `
                            <button class="color-swatch ${node.properties.color === color ? 'selected' : ''}" 
                                    data-color="${color}" 
                                    style="background-color: ${color};"
                                    title="${color}">
                            </button>
                        `).join('')}
                    </div>
                    <input type="color" class="property-input" id="prop-color" value="${node.properties.color || '#3498db'}">
                </div>

                <div class="property-item">
                    <label class="property-label">Size</label>
                    <input type="number" class="property-input" id="prop-size" value="${node.properties.size || 10}" min="5" max="50">
                </div>

                <div class="property-item">
                    <label class="property-label">Description</label>
                    <textarea class="property-textarea" id="prop-description">${Utils.sanitizeHtml(node.properties.description || '')}</textarea>
                </div>
                
                <!-- Feature 11: Priority and Deadline -->
                <div class="property-item">
                    <label class="property-label">Priority (1-5)</label>
                    <input type="number" class="property-input" id="prop-priority" value="${node.properties.priority || ''}" min="1" max="5" placeholder="Optional">
                    <p class="property-hint">1=Highest, 5=Lowest</p>
                </div>
                
                <div class="property-item">
                    <label class="property-label">Deadline</label>
                    <input type="date" class="property-input" id="prop-deadline" value="${node.properties.deadline || ''}">
                </div>
            </div>

            <div class="property-group">
                <div class="property-group-title">Connections</div>
                <div id="connections-container">
                    ${this.renderNodeConnections(nodeId)}
                </div>
                <button class="btn-secondary" id="btn-connect-to-node" style="margin-top: 10px; width: 100%;">
                    Connect to Another Node
                </button>
            </div>

            <div class="property-group">
                <div class="property-group-title">Custom Properties</div>
                <div id="custom-properties-container">
                    ${this.renderCustomProperties(node.properties)}
                </div>
                <button class="btn-add-property" id="btn-add-custom-property">+ Add Property</button>
            </div>

            <div class="property-group">
                <div class="property-group-title">Metadata</div>
                <div class="metadata-section">
                    <div class="metadata-item">
                        <strong>Created:</strong>
                        <span>${node.properties.createdDate || 'N/A'}</span>
                    </div>
                    <div class="metadata-item">
                        <strong>Modified:</strong>
                        <span>${node.properties.modifiedDate || 'N/A'}</span>
                    </div>
                </div>
            </div>

            <div class="property-actions">
                <button class="btn-delete-selected" id="btn-delete-node">Delete Node</button>
            </div>
        `;

        this.content.innerHTML = html;
        this.attachPropertyHandlers();
    }

    /**
     * Display edge properties
     */
    showEdgeProperties(edgeId) {
        const edge = this.graph.getEdge(edgeId);
        if (!edge) return;

        this.currentSelection = edgeId;
        this.currentType = 'edge';
        this.show();

        const sourceNode = this.graph.getNode(edge.source?.id || edge.source);
        const targetNode = this.graph.getNode(edge.target?.id || edge.target);

        const allNodeIds = this.graph.getAllNodeIds();
        const allTypes = this.graph.getAllEdgeTypes();

        const html = `
            <div class="property-group">
                <div class="property-group-title">Edge Information</div>
                
                <div class="property-item">
                    <label class="property-label">ID (Feature 2: Editable)</label>
                    <input type="text" class="property-input" id="prop-edge-id" value="${Utils.sanitizeHtml(edge.id)}">
                    <p class="property-hint">Press Enter to save</p>
                </div>

                <div class="property-item">
                    <label class="property-label">Source</label>
                    <select class="property-input" id="prop-source">
                        <option value="">(Free End)</option>
                        ${allNodeIds.map(id => {
                            const sourceId = edge.source?.id || edge.source;
                            return `<option value="${Utils.sanitizeHtml(id)}" ${id === sourceId ? 'selected' : ''}>${Utils.sanitizeHtml(id)}</option>`;
                        }).join('')}
                    </select>
                </div>

                <div class="property-item">
                    <label class="property-label">Target</label>
                    <select class="property-input" id="prop-target">
                        <option value="">(Free End)</option>
                        ${allNodeIds.map(id => {
                            const targetId = edge.target?.id || edge.target;
                            return `<option value="${Utils.sanitizeHtml(id)}" ${id === targetId ? 'selected' : ''}>${Utils.sanitizeHtml(id)}</option>`;
                        }).join('')}
                    </select>
                </div>

                <div class="property-item">
                    <label class="property-label">Type</label>
                    <input type="text" class="property-input" id="prop-type" value="${Utils.sanitizeHtml(edge.properties.type || '')}" list="edge-types">
                    <datalist id="edge-types">
                        ${allTypes.map(type => `<option value="${Utils.sanitizeHtml(type)}">`).join('')}
                    </datalist>
                </div>

                <div class="property-item">
                    <label class="property-label">Color</label>
                    <input type="color" class="property-input" id="prop-color" value="${edge.properties.color || '#95a5a6'}">
                </div>

                <div class="property-item">
                    <label class="property-label">Weight</label>
                    <input type="number" class="property-input" id="prop-weight" value="${edge.properties.weight || 1}" min="0.1" step="0.1">
                </div>

                <div class="property-item">
                    <label class="property-label">
                        <input type="checkbox" id="prop-directed" ${edge.properties.directed ? 'checked' : ''}>
                        <span>Show arrow direction</span>
                    </label>
                </div>

                <div class="property-item">
                    <label class="property-label">Description</label>
                    <textarea class="property-textarea" id="prop-description">${Utils.sanitizeHtml(edge.properties.description || '')}</textarea>
                </div>
            </div>

            <div class="property-group">
                <div class="property-group-title">Custom Properties</div>
                <div id="custom-properties-container">
                    ${this.renderCustomProperties(edge.properties)}
                </div>
                <button class="btn-add-property" id="btn-add-custom-property">+ Add Property</button>
            </div>

            <div class="property-actions">
                <button class="btn-secondary" id="btn-break-edge" style="margin-bottom: 10px;">
                    Break Edge into 2 Pieces
                </button>
                <button class="btn-delete-selected" id="btn-delete-edge">Delete Edge</button>
            </div>
        `;

        this.content.innerHTML = html;
        this.attachPropertyHandlers();
    }

    /**
     * Render custom properties
     */
    renderCustomProperties(properties) {
        const standardProps = ['color', 'size', 'description', 'type', 'weight', 'directed', 
                               'priority', 'deadline', 'userDate', 'createdDate', 'modifiedDate'];
        const customProps = Object.entries(properties).filter(([key]) => 
            !standardProps.includes(key) && !key.startsWith('_') && !key.startsWith('merged_')
        );

        if (customProps.length === 0) {
            return '<p style="color: var(--text-secondary); font-size: 13px;">No custom properties</p>';
        }

        return customProps.map(([key, value]) => `
            <div class="custom-property" data-key="${Utils.sanitizeHtml(key)}">
                <div class="custom-property-inputs">
                    <input type="text" class="custom-property-key" value="${Utils.sanitizeHtml(key)}" placeholder="Property name">
                    <input type="text" class="custom-property-value" value="${Utils.sanitizeHtml(String(value))}" placeholder="Property value">
                </div>
                <button class="btn-remove-property" title="Remove property">✕</button>
            </div>
        `).join('');
    }

    /**
     * Get edges connected to a node
     */
    getNodeEdges(nodeId) {
        return this.graph.edges.filter(e => {
            const sourceId = typeof e.source === 'object' ? e.source.id : e.source;
            const targetId = typeof e.target === 'object' ? e.target.id : e.target;
            return sourceId === nodeId || targetId === nodeId;
        });
    }

    /**
     * Render node connections
     */
    renderNodeConnections(nodeId) {
        const edges = this.getNodeEdges(nodeId);

        if (edges.length === 0) {
            return '<p style="color: var(--text-secondary); font-size: 13px;">No connections</p>';
        }

        return edges.map(edge => {
            const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
            const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
            const otherNodeId = sourceId === nodeId ? targetId : sourceId;
            const direction = sourceId === nodeId ? '→' : '←';

            return `
                <div class="connection-item" data-edge-id="${Utils.sanitizeHtml(edge.id)}" data-node-id="${Utils.sanitizeHtml(otherNodeId)}">
                    <span class="connection-info">
                        <strong>${direction} ${Utils.sanitizeHtml(otherNodeId || '(Free End)')}</strong>
                        <small style="color: var(--text-secondary);">${edge.properties.type || edge.id}</small>
                    </span>
                    <div class="connection-actions">
                        <button class="btn-icon btn-toggle-inline-edit" title="Edit edge endpoint">✎</button>
                        <button class="btn-icon btn-view-edge-details" title="View edge details">⋯</button>
                        <button class="btn-icon btn-delete-connection" title="Delete connection">✕</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Attach event handlers to property inputs
     */
    attachPropertyHandlers() {
        // Node ID rename
        const nodeIdInput = document.getElementById('prop-node-id');
        if (nodeIdInput) {
            nodeIdInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.renameNode(e.target.value.trim());
                }
            });
        }

        // Edge ID rename
        const edgeIdInput = document.getElementById('prop-edge-id');
        if (edgeIdInput) {
            edgeIdInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.renameEdge(e.target.value.trim());
                }
            });
        }

        // Color palette
        const colorSwatches = document.querySelectorAll('.color-swatch');
        colorSwatches.forEach(swatch => {
            swatch.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                this.updateProperty('color', color);
                document.getElementById('prop-color').value = color;
            });
        });

        // Standard properties
        const propertyInputs = [
            { id: 'prop-color', key: 'color' },
            { id: 'prop-size', key: 'size', parse: parseFloat },
            { id: 'prop-type', key: 'type' },
            { id: 'prop-weight', key: 'weight', parse: parseFloat },
            { id: 'prop-description', key: 'description' },
            { id: 'prop-priority', key: 'priority', parse: parseInt },
            { id: 'prop-deadline', key: 'deadline' }
        ];

        propertyInputs.forEach(({ id, key, parse }) => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', (e) => {
                    const value = parse ? parse(e.target.value) : e.target.value;
                    this.updateProperty(key, value);
                });
            }
        });

        // Directed checkbox
        const directedCheckbox = document.getElementById('prop-directed');
        if (directedCheckbox) {
            directedCheckbox.addEventListener('change', (e) => {
                this.updateProperty('directed', e.target.checked);
            });
        }

        // Edge source/target dropdowns
        const sourceSelect = document.getElementById('prop-source');
        if (sourceSelect) {
            sourceSelect.addEventListener('change', (e) => {
                this.changeEdgeEndpoint('source', e.target.value);
            });
        }

        const targetSelect = document.getElementById('prop-target');
        if (targetSelect) {
            targetSelect.addEventListener('change', (e) => {
                this.changeEdgeEndpoint('target', e.target.value);
            });
        }

        // Custom properties
        const customContainer = document.getElementById('custom-properties-container');
        if (customContainer) {
            customContainer.addEventListener('change', (e) => {
                if (e.target.classList.contains('custom-property-key') || 
                    e.target.classList.contains('custom-property-value')) {
                    const propertyDiv = e.target.closest('.custom-property');
                    const oldKey = propertyDiv.dataset.key;
                    const newKey = propertyDiv.querySelector('.custom-property-key').value.trim();
                    const newValue = propertyDiv.querySelector('.custom-property-value').value;

                    if (newKey && oldKey !== newKey) {
                        if (this.currentType === 'node') {
                            const node = this.graph.getNode(this.currentSelection);
                            delete node.properties[oldKey];
                            node.properties[newKey] = newValue;
                        } else if (this.currentType === 'edge') {
                            const edge = this.graph.getEdge(this.currentSelection);
                            delete edge.properties[oldKey];
                            edge.properties[newKey] = newValue;
                        }
                        propertyDiv.dataset.key = newKey;
                    } else if (newKey) {
                        this.updateProperty(newKey, newValue);
                    }

                    if (window.app) {
                        window.app.saveState();
                    }
                }
            });

            customContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('btn-remove-property')) {
                    const propertyDiv = e.target.closest('.custom-property');
                    const key = propertyDiv.dataset.key;
                    this.removeCustomProperty(key);
                }
            });
        }

        // Add custom property button
        const addBtn = document.getElementById('btn-add-custom-property');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addCustomProperty());
        }

        // Delete button
        const deleteBtn = document.getElementById('btn-delete-node') || 
                         document.getElementById('btn-delete-edge');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteSelected());
        }
        
        // Break edge button (NEW)
        const breakEdgeBtn = document.getElementById('btn-break-edge');
        if (breakEdgeBtn) {
            breakEdgeBtn.addEventListener('click', () => this.breakEdgeWithNodes());
        }
        
        // Connection handlers with three buttons
        const connectionsContainer = document.getElementById('connections-container');
        if (connectionsContainer) {
            connectionsContainer.addEventListener('click', (e) => {
                const connectionItem = e.target.closest('.connection-item');
                if (!connectionItem) return;
                
                const edgeId = connectionItem.dataset.edgeId;
                const nodeId = connectionItem.dataset.nodeId;
                
                // Toggle inline edit (pen icon)
                if (e.target.classList.contains('btn-toggle-inline-edit')) {
                    this.toggleConnectionInlineEdit(edgeId, nodeId);
                } 
                // View full edge details (three dots icon)
                else if (e.target.classList.contains('btn-view-edge-details')) {
                    this.showEdgeProperties(edgeId);
                } 
                // Delete connection (X icon)
                else if (e.target.classList.contains('btn-delete-connection')) {
                    if (Utils.confirm('Delete this connection?')) {
                        this.graph.removeEdge(edgeId);
                        this.renderer.render();
                        this.showNodeProperties(nodeId);
                        if (window.app) {
                            window.app.updateStats();
                            window.app.saveState();
                        }
                    }
                }
            });
        }

        // Connect to node button
        const connectBtn = document.getElementById('btn-connect-to-node');
        if (connectBtn) {
            connectBtn.addEventListener('click', () => {
                this.showConnectToNodeDialog(this.currentSelection);
            });
        }
    }

    /**
     * Feature 2: Rename node
     */
    renameNode(newId) {
        if (!newId || newId === this.currentSelection) return;
        
        const success = this.graph.renameNode(this.currentSelection, newId);
        
        if (!success) {
            alert('Failed to rename node. ID may already exist.');
            return;
        }
        
        this.currentSelection = newId;
        this.renderer.render();
        this.showNodeProperties(newId);
        
        if (window.app) {
            window.app.saveState();
            window.app.updateStatus(`Renamed node to: ${newId}`);
        }
    }

    /**
     * Feature 2: Rename edge
     */
    renameEdge(newId) {
        if (!newId || newId === this.currentSelection) return;
        
        const success = this.graph.renameEdge(this.currentSelection, newId);
        
        if (!success) {
            alert('Failed to rename edge. ID may already exist.');
            return;
        }
        
        this.currentSelection = newId;
        this.renderer.render();
        this.showEdgeProperties(newId);
        
        if (window.app) {
            window.app.saveState();
            window.app.updateStatus(`Renamed edge to: ${newId}`);
        }
    }

	/**
	 * Change edge source or target endpoint
	 * @param {string} end - 'source' or 'target'
	 * @param {string} newNodeId - New node ID (empty string for free end)
	 */
	changeEdgeEndpoint(end, newNodeId) {
		if (!this.currentSelection || this.currentType !== 'edge') return;
		
		const edge = this.graph.getEdge(this.currentSelection);
		if (!edge) return;
		
		// Handle free end (empty string)
		if (newNodeId === '') {
			// Break the edge at this end
			const coords = this.getEdgeEndCoordinates(edge, end);
			this.graph.breakEdge(this.currentSelection, end, coords.x, coords.y);
		} else {
			// Connect to the selected node
			const success = this.graph.changeEdgeEndpoint(this.currentSelection, end, newNodeId);
			
			if (!success) {
				alert(`Failed to change edge ${end}. Node may not exist.`);
				return;
			}
		}
		
		this.renderer.render();
		this.showEdgeProperties(this.currentSelection);
		
		if (window.app) {
			window.app.saveState();
			window.app.updateStatus(`Changed edge ${end} to: ${newNodeId || '(Free End)'}`);
		}
	}

	/**
	 * Get coordinates for edge endpoint (for breaking)
	 * @param {Object} edge - Edge object
	 * @param {string} end - 'source' or 'target'
	 * @returns {Object} {x, y} coordinates
	 */
	getEdgeEndCoordinates(edge, end) {
		if (end === 'source') {
			if (typeof edge.source === 'object' && edge.source !== null) {
				return { x: edge.source.x, y: edge.source.y };
			} else {
				return { x: edge.sourceX || 0, y: edge.sourceY || 0 };
			}
		} else {
			if (typeof edge.target === 'object' && edge.target !== null) {
				return { x: edge.target.x, y: edge.target.y };
			} else {
				return { x: edge.targetX || 0, y: edge.targetY || 0 };
			}
		}
	}
	
	/**
	 * NEW: Break edge by creating two intermediate nodes (NOT connected to each other)
	 * Creates nodes named: node_edge#{edgeId}_side1 and node_edge#{edgeId}_side2
	 * Creates edges named: {edgeId}_side1 (source → node1) and {edgeId}_side2 (node2 → target)
	 * This literally "breaks" the edge into two separate disconnected pieces
	 */
	breakEdgeWithNodes() {
		if (!this.currentSelection || this.currentType !== 'edge') return;
		
		const edge = this.graph.getEdge(this.currentSelection);
		if (!edge) {
			alert('Edge not found.');
			return;
		}
		
		// Verify edge has both endpoints connected
		const sourceNode = this.graph.getNode(edge.source?.id || edge.source);
		const targetNode = this.graph.getNode(edge.target?.id || edge.target);
		
		if (!sourceNode || !targetNode) {
			alert('Cannot break edge: both source and target must be connected to nodes.');
			return;
		}
		
		// Calculate positions for new nodes (at 33% and 66% along the edge)
		const sourceX = sourceNode.x;
		const sourceY = sourceNode.y;
		const targetX = targetNode.x;
		const targetY = targetNode.y;
		
		const node1X = sourceX + (targetX - sourceX) * 0.33;
		const node1Y = sourceY + (targetY - sourceY) * 0.33;
		const node2X = sourceX + (targetX - sourceX) * 0.67;
		const node2Y = sourceY + (targetY - sourceY) * 0.67;
		
		// Generate node IDs
		const node1Id = `node_edge#${edge.id}_side1`;
		const node2Id = `node_edge#${edge.id}_side2`;
		
		// Check if IDs already exist
		if (this.graph.getNode(node1Id) || this.graph.getNode(node2Id)) {
			alert('Cannot break edge: generated node IDs already exist. Try renaming existing nodes first.');
			return;
		}
		
		// Store original edge properties
		const edgeColor = edge.properties.color || '#95a5a6';
		const edgeType = edge.properties.type || '';
		const edgeWeight = edge.properties.weight || 1;
		const isDirected = edge.properties.directed || false;
		
		// Create two new nodes and pin them at their calculated positions
		const newNode1 = this.graph.addNode({
			id: node1Id,
			color: edgeColor,
			size: 8,
			description: `Break node from edge ${edge.id} (side 1)`
		});
		newNode1.x = node1X;
		newNode1.y = node1Y;
		newNode1.fx = node1X;
		newNode1.fy = node1Y;
		
		const newNode2 = this.graph.addNode({
			id: node2Id,
			color: edgeColor,
			size: 8,
			description: `Break node from edge ${edge.id} (side 2)`
		});
		newNode2.x = node2X;
		newNode2.y = node2Y;
		newNode2.fx = node2X;
		newNode2.fy = node2Y;
		
		// Create TWO new edges (not three) - this breaks the edge into two separate pieces
		// Edge 1: source → node1 (side1)
		const edge1Id = `${edge.id}_side1`;
		
		// Edge 2: node2 → target (side2)
		const edge2Id = `${edge.id}_side2`;
		
		// NOTE: graph.addEdge expects (source, target, properties) as separate parameters
		const edge1 = this.graph.addEdge(sourceNode.id, node1Id, {
			id: edge1Id,
			color: edgeColor,
			type: edgeType,
			weight: edgeWeight,
			directed: isDirected,
			description: `Side 1 of broken edge ${edge.id}`
		});
		
		const edge2 = this.graph.addEdge(node2Id, targetNode.id, {
			id: edge2Id,
			color: edgeColor,
			type: edgeType,
			weight: edgeWeight,
			directed: isDirected,
			description: `Side 2 of broken edge ${edge.id}`
		});
		
		// Check if both edges were created successfully
		if (!edge1 || !edge2) {
			alert('Error creating edge segments. Operation aborted.');
			// Clean up any partially created nodes
			if (this.graph.getNode(node1Id)) this.graph.removeNode(node1Id);
			if (this.graph.getNode(node2Id)) this.graph.removeNode(node2Id);
			return;
		}
		
		// Remove the original edge
		this.graph.removeEdge(edge.id);
		
		// Render and update UI with proper simulation restart
		this.renderer.render();
		
		// Restart simulation to properly integrate new nodes and edges
		if (!this.renderer.isFrozen) {
			this.renderer.simulation.alpha(0.5).restart();
		}
		
		this.hide();
		
		if (window.app) {
			window.app.updateStats();
			window.app.saveState();
			window.app.updateStatus(`Broke edge ${edge.id} into 2 separate pieces with nodes: ${node1Id}, ${node2Id}`);
		}
	}
	
    /**
     * Update a standard property
     */
    updateProperty(key, value) {
        if (!this.currentSelection) return;

        if (this.currentType === 'node') {
            this.graph.updateNode(this.currentSelection, { [key]: value });
        } else if (this.currentType === 'edge') {
            this.graph.updateEdge(this.currentSelection, { [key]: value });
        }

        this.renderer.render();
        
        if (this.currentType === 'edge' && key === 'type') {
            this.renderer.edgeGroup.selectAll('.edge-label')
                .filter(d => d.id === this.currentSelection)
                .text(value || this.currentSelection);
        }

        if (window.app) {
            window.app.saveState();
        }
    }

    /**
     * Add a custom property
     */
    addCustomProperty() {
        if (!this.currentSelection) return;

        const key = prompt('Property name:');
        if (!key) return;

        const value = prompt('Property value:');
        if (value === null) return;

        if (this.currentType === 'node') {
            this.graph.updateNode(this.currentSelection, { [key]: value });
            this.showNodeProperties(this.currentSelection);
        } else if (this.currentType === 'edge') {
            this.graph.updateEdge(this.currentSelection, { [key]: value });
            this.showEdgeProperties(this.currentSelection);
        }

        if (window.app) {
            window.app.saveState();
        }
    }

    /**
     * Remove a custom property
     */
    removeCustomProperty(key) {
        if (!this.currentSelection) return;

        if (!Utils.confirm(`Delete property "${key}"?`)) return;

        if (this.currentType === 'node') {
            const node = this.graph.getNode(this.currentSelection);
            delete node.properties[key];
            this.showNodeProperties(this.currentSelection);
        } else if (this.currentType === 'edge') {
            const edge = this.graph.getEdge(this.currentSelection);
            delete edge.properties[key];
            this.showEdgeProperties(this.currentSelection);
        }

        if (window.app) {
            window.app.saveState();
        }
    }

    /**
     * Delete selected node or edge
     */
    deleteSelected() {
        if (!this.currentSelection) return;

        const confirmMsg = this.currentType === 'node' 
            ? `Delete node "${this.currentSelection}"?`
            : `Delete edge "${this.currentSelection}"?`;

        if (!Utils.confirm(confirmMsg)) return;

        if (this.currentType === 'node') {
            this.graph.removeNode(this.currentSelection);
        } else if (this.currentType === 'edge') {
            this.graph.removeEdge(this.currentSelection);
        }

        this.hide();
        this.renderer.render();

        if (window.app) {
            window.app.updateStats();
            window.app.saveState();
        }
    }

    /**
     * Toggle inline editing for connection
     */
    toggleConnectionInlineEdit(edgeId, otherNodeId) {
        const connectionItem = document.querySelector(`.connection-item[data-edge-id="${edgeId}"]`);
        if (!connectionItem) return;

        const edge = this.graph.getEdge(edgeId);
        if (!edge) return;

        const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
        const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
        const isSource = sourceId === this.currentSelection;
        const end = isSource ? 'target' : 'source';

        const existingSelect = connectionItem.querySelector('.inline-edit-select');
        if (existingSelect) {
            existingSelect.remove();
            this.pendingInlineEdit = null;
            return;
        }

        const allNodeIds = this.graph.getAllNodeIds();
        const select = document.createElement('select');
        select.className = 'inline-edit-select property-input';
        select.style.marginTop = '5px';

        select.innerHTML = `
            <option value="">(Free End)</option>
            ${allNodeIds.map(id => `
                <option value="${Utils.sanitizeHtml(id)}" ${id === otherNodeId ? 'selected' : ''}>
                    ${Utils.sanitizeHtml(id)}
                </option>
            `).join('')}
        `;

        select.addEventListener('change', (e) => {
            this.changeEdgeEndpoint(end, e.target.value);
            select.remove();
            this.pendingInlineEdit = null;
        });

        connectionItem.appendChild(select);
        select.focus();

        this.pendingInlineEdit = { edgeId, end, select };
    }

    /**
     * Show dialog to connect current node to another node
     */
    showConnectToNodeDialog(fromNodeId) {
        const allNodeIds = this.graph.getAllNodeIds().filter(id => id !== fromNodeId);
        
        if (allNodeIds.length === 0) {
            alert('No other nodes available to connect to.');
            return;
        }

        const toNodeId = prompt('Enter target node ID:\n\n' + allNodeIds.join('\n'));
        if (!toNodeId) return;

        if (!this.graph.getNode(toNodeId)) {
            alert('Target node does not exist.');
            return;
        }

        const edgeId = `edge_${fromNodeId}_${toNodeId}`;
        
        this.graph.addEdge({
            id: edgeId,
            source: fromNodeId,
            target: toNodeId,
            properties: {
                type: 'connection',
                color: '#95a5a6'
            }
        });

        this.renderer.render();
        this.showNodeProperties(fromNodeId);

        if (window.app) {
            window.app.updateStats();
            window.app.saveState();
            window.app.updateStatus(`Connected ${fromNodeId} to ${toNodeId}`);
        }
    }
}

// Export
window.PropertiesPanel = PropertiesPanel;