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
                    <label class="property-label">ID</label>
                    <input type="text" class="property-input" value="${Utils.sanitizeHtml(node.id)}" readonly>
                </div>

                <div class="property-item">
                    <label class="property-label">Color</label>
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
            </div>

            <div class="property-group">
                <div class="property-group-title">Custom Properties</div>
                <div id="custom-properties-container">
                    ${this.renderCustomProperties(node.properties)}
                </div>
                <button class="btn-add-property" id="btn-add-custom-property">+ Add Property</button>
            </div>
			<div class="property-group">
				<div class="property-group-title">Connections (${this.getNodeEdges(nodeId).length})</div>
				<div id="connections-container">
					${this.renderConnections(nodeId)}
				</div>
				<button class="btn-add-property" id="btn-connect-to-node">+ Connect to Another Node</button>
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

        const sourceNode = this.graph.getNode(edge.source)?.id || edge.source;
		const targetNode = this.graph.getNode(edge.target)?.id || edge.target;

		const html = `
			<div class="property-group">
				<div class="property-group-title">Edge: ${Utils.sanitizeHtml(sourceNode)} → ${Utils.sanitizeHtml(targetNode)}</div>
                
                <div class="property-item">
                    <label class="property-label">ID</label>
                    <input type="text" class="property-input" value="${Utils.sanitizeHtml(edge.id)}" readonly>
                </div>

                <div class="property-item">
                    <label class="property-label">Source</label>
                    <input type="text" class="property-input" value="${Utils.sanitizeHtml(edge.source)}" readonly>
                </div>

                <div class="property-item">
                    <label class="property-label">Target</label>
                    <input type="text" class="property-input" value="${Utils.sanitizeHtml(edge.target)}" readonly>
                </div>

                <div class="property-item">
                    <label class="property-label">Type</label>
                    <input type="text" class="property-input" id="prop-type" value="${Utils.sanitizeHtml(edge.properties.type || 'related')}">
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
                    <label class="property-label">Directed</label>
                    <div class="property-checkbox-container">
                        <input type="checkbox" class="property-checkbox" id="prop-directed" ${edge.properties.directed ? 'checked' : ''}>
                        <span>Show arrow direction</span>
                    </div>
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
        const standardProps = ['color', 'size', 'description', 'type', 'weight', 'directed'];
        const customProps = Object.entries(properties).filter(([key]) => 
            !standardProps.includes(key) && !key.startsWith('_')
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
     * Attach event handlers to property inputs
     */
    attachPropertyHandlers() {
        // Standard properties
        const colorInput = document.getElementById('prop-color');
        const sizeInput = document.getElementById('prop-size');
        const descInput = document.getElementById('prop-description');
        const typeInput = document.getElementById('prop-type');
        const weightInput = document.getElementById('prop-weight');
        const directedInput = document.getElementById('prop-directed');

        if (colorInput) {
            colorInput.addEventListener('change', () => this.updateProperty('color', colorInput.value));
        }

        if (sizeInput) {
            sizeInput.addEventListener('change', () => this.updateProperty('size', parseFloat(sizeInput.value)));
        }

        if (descInput) {
            descInput.addEventListener('change', () => this.updateProperty('description', descInput.value));
        }

        if (typeInput) {
            typeInput.addEventListener('change', () => this.updateProperty('type', typeInput.value));
        }

        if (weightInput) {
            weightInput.addEventListener('change', () => this.updateProperty('weight', parseFloat(weightInput.value)));
        }

        if (directedInput) {
            directedInput.addEventListener('change', () => this.updateProperty('directed', directedInput.checked));
        }

        // Custom properties
        const customContainer = document.getElementById('custom-properties-container');
        if (customContainer) {
            customContainer.addEventListener('change', (e) => {
                if (e.target.classList.contains('custom-property-key') || 
                    e.target.classList.contains('custom-property-value')) {
                    this.updateCustomProperty(e.target);
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
		// Connection item handlers
		const connectionsContainer = document.getElementById('connections-container');
		if (connectionsContainer) {
			connectionsContainer.addEventListener('click', (e) => {
				const connectionItem = e.target.closest('.connection-item');
				if (!connectionItem) return;
				
				const edgeId = connectionItem.dataset.edgeId;
				
				if (e.target.classList.contains('btn-edit-connection')) {
					// Show edge properties
					this.showEdgeProperties(edgeId);
				} else if (e.target.classList.contains('btn-delete-connection')) {
					// Delete connection
					if (Utils.confirm('Delete this connection?')) {
						this.graph.removeEdge(edgeId);
						this.renderer.render();
						// Refresh node properties
						this.showNodeProperties(this.currentSelection);
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
     * Update a standard property
     */
    updateProperty(key, value) {
        if (!this.currentSelection) return;

        if (this.currentType === 'node') {
            this.graph.updateNode(this.currentSelection, { [key]: value });
        } else if (this.currentType === 'edge') {
            this.graph.updateEdge(this.currentSelection, { [key]: value });
        }

        // Re-render to show changes
        this.renderer.render();
		
		// ADD THIS BLOCK - Refresh edge labels if type changed
		if (this.currentType === 'edge' && key === 'type') {
			this.renderer.edgeGroup.selectAll('.edge-label')
				.filter(d => d.id === this.currentSelection)
				.text(d => d.properties.type || d.id);
		}
        
        // Trigger save for history
        if (window.app) {
            window.app.saveState();
        }
    }

    /**
     * Update custom property
     */
    updateCustomProperty(input) {
        const propertyDiv = input.closest('.custom-property');
        const oldKey = propertyDiv.dataset.key;
        const keyInput = propertyDiv.querySelector('.custom-property-key');
        const valueInput = propertyDiv.querySelector('.custom-property-value');
        const newKey = keyInput.value.trim();
        const newValue = valueInput.value.trim();

        if (!newKey) return;

        if (!this.currentSelection) return;

        if (this.currentType === 'node') {
            const node = this.graph.getNode(this.currentSelection);
            if (node) {
                // Remove old key if it changed
                if (oldKey !== newKey && oldKey) {
                    delete node.properties[oldKey];
                }
                node.properties[newKey] = newValue;
                propertyDiv.dataset.key = newKey;
            }
        } else if (this.currentType === 'edge') {
            const edge = this.graph.getEdge(this.currentSelection);
            if (edge) {
                if (oldKey !== newKey && oldKey) {
                    delete edge.properties[oldKey];
                }
                edge.properties[newKey] = newValue;
                propertyDiv.dataset.key = newKey;
            }
        }

        this.graph.updateModifiedDate();
        
        if (window.app) {
            window.app.saveState();
        }
    }

    /**
     * Remove custom property
     */
    removeCustomProperty(key) {
        if (!this.currentSelection) return;

        if (this.currentType === 'node') {
            const node = this.graph.getNode(this.currentSelection);
            if (node && node.properties[key] !== undefined) {
                delete node.properties[key];
            }
        } else if (this.currentType === 'edge') {
            const edge = this.graph.getEdge(this.currentSelection);
            if (edge && edge.properties[key] !== undefined) {
                delete edge.properties[key];
            }
        }

        this.graph.updateModifiedDate();

        // Refresh display
        if (this.currentType === 'node') {
            this.showNodeProperties(this.currentSelection);
        } else {
            this.showEdgeProperties(this.currentSelection);
        }

        if (window.app) {
            window.app.saveState();
        }
    }

    /**
     * Add new custom property
     */
    addCustomProperty() {
        if (!this.currentSelection) return;

        const key = `property_${Date.now()}`;
        const value = '';

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
     * Delete selected node or edge
     */
    deleteSelected() {
        if (!this.currentSelection) return;

        const message = this.currentType === 'node' 
            ? 'Delete this node and all connected edges?' 
            : 'Delete this edge?';

        if (!Utils.confirm(message)) return;

        if (this.currentType === 'node') {
            this.graph.removeNode(this.currentSelection);
            this.renderer.clearSelection();
        } else if (this.currentType === 'edge') {
            this.graph.removeEdge(this.currentSelection);
            this.renderer.clearSelection();
        }

        this.hide();
        this.renderer.render();

        if (window.app) {
            window.app.updateStats();
            window.app.saveState();
        }
    }
	/**
	 * Get all edges connected to a node
	 */
	getNodeEdges(nodeId) {
		return this.graph.edges.filter(e => {
			const sourceId = typeof e.source === 'object' ? e.source.id : e.source;
			const targetId = typeof e.target === 'object' ? e.target.id : e.target;
			return sourceId === nodeId || targetId === nodeId;
		});
	}

	/**
	 * Render connections list for a node
	 */
	renderConnections(nodeId) {
		const edges = this.getNodeEdges(nodeId);
		
		if (edges.length === 0) {
			return '<p style="color: var(--text-secondary); font-size: 13px;">No connections</p>';
		}
		
		return edges.map(edge => {
			const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
			const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
			
			const isOutgoing = sourceId === nodeId;
			const otherNodeId = isOutgoing ? targetId : sourceId;
			const direction = isOutgoing ? '→' : '←';
			const edgeLabel = edge.properties.type || edge.id;
			
			return `
				<div class="connection-item" data-edge-id="${edge.id}">
					<div class="connection-info">
						<span class="connection-direction">${direction}</span>
						<span class="connection-node">${Utils.sanitizeHtml(otherNodeId)}</span>
						<span class="connection-label">${Utils.sanitizeHtml(edgeLabel)}</span>
					</div>
					<div class="connection-actions">
						<button class="btn-edit-connection" title="Edit edge properties">✎</button>
						<button class="btn-delete-connection" title="Delete connection">✕</button>
					</div>
				</div>
			`;
		}).join('');
	}

	/**
	 * Show connection to node dialog
	 */
	showConnectToNodeDialog(sourceNodeId) {
		const availableNodes = this.graph.nodes
			.filter(n => n.id !== sourceNodeId)
			.map(n => n.id)
			.sort();
		
		if (availableNodes.length === 0) {
			alert('No other nodes available to connect to');
			return;
		}
		
		// Create simple selection dialog
		const nodeList = availableNodes.map(id => `• ${id}`).join('\n');
		const targetId = prompt(`Select target node to connect to:\n\n${nodeList}\n\nEnter node ID:`);
		
		if (!targetId) return;
		
		// Validate node exists
		if (!this.graph.getNode(targetId)) {
			alert('Invalid node ID');
			return;
		}
		
		// Create edge using app controller
		if (window.app) {
			window.app.addEdge(sourceNodeId, targetId);
			// Refresh properties panel
			this.showNodeProperties(sourceNodeId);
		}
	}
}

// Export
window.PropertiesPanel = PropertiesPanel;
