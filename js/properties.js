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
                            <button class="color-swatch ${node.properties.color === color ? 'active' : ''}" 
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
                    <input type="number" class="property-input" id="prop-size" value="${node.properties.size || 10}" min="5" max="30">
                </div>

                <div class="property-item">
                    <label class="property-label">Description</label>
                    <textarea class="property-textarea" id="prop-description">${Utils.sanitizeHtml(node.properties.description || '')}</textarea>
                </div>
            </div>

            <div class="property-group">
                <div class="property-group-title">Task Properties (Feature 5)</div>
                
                <div class="property-item">
                    <label class="property-label">Priority</label>
                    <select class="property-select" id="prop-priority">
                        <option value="" ${!node.properties.priority ? 'selected' : ''}>-- None --</option>
                        <option value="high" ${node.properties.priority === 'high' ? 'selected' : ''}>High</option>
                        <option value="medium" ${node.properties.priority === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="low" ${node.properties.priority === 'low' ? 'selected' : ''}>Low</option>
                    </select>
                </div>

                <div class="property-item">
                    <label class="property-label">Deadline</label>
                    <input type="date" class="property-input" id="prop-deadline" value="${node.properties.deadline || ''}">
                </div>

                <div class="property-item">
                    <label class="property-label">User Date</label>
                    <input type="date" class="property-input" id="prop-userDate" value="${node.properties.userDate || ''}">
                </div>
            </div>

            <div class="property-group">
                <div class="property-group-title">Connections (${this.getNodeEdges(nodeId).length})</div>
                <div id="connections-container">
                    ${this.renderConnections(nodeId)}
                </div>
                <button class="btn-add-property" id="btn-connect-to-node" style="margin-top: 10px;">+ Connect to Node</button>
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

        const sourceNode = this.graph.getNode(edge.source)?.id || edge.source || '(Free End)';
        const targetNode = this.graph.getNode(edge.target)?.id || edge.target || '(Free End)';

        // Get all node IDs for dropdowns
		const allNodeIds = this.graph.getAllNodeIds();
		// Feature 11: Get all edge types for dropdown
        const allTypes = this.graph.getAllEdgeTypes();

        const html = `
            <div class="property-group">
                <div class="property-group-title">Edge: ${Utils.sanitizeHtml(sourceNode)} → ${Utils.sanitizeHtml(targetNode)}</div>
                
                <div class="property-item">
                    <label class="property-label">ID (Feature 2: Editable)</label>
                    <input type="text" class="property-input" id="prop-edge-id" value="${Utils.sanitizeHtml(edge.id)}">
                    <p class="property-hint">Press Enter to save</p>
                </div>

                <div class="property-item">
					<label class="property-label">Source</label>
					<select class="property-input property-select" id="prop-source">
						<option value="">(Free End)</option>
						${allNodeIds.map(nodeId => `
							<option value="${Utils.sanitizeHtml(nodeId)}" ${(edge.source === nodeId || (typeof edge.source === 'object' && edge.source.id === nodeId)) ? 'selected' : ''}>
								${Utils.sanitizeHtml(nodeId)}
							</option>
						`).join('')}
					</select>
				</div>

				<div class="property-item">
					<label class="property-label">Target</label>
					<select class="property-input property-select" id="prop-target">
						<option value="">(Free End)</option>
						${allNodeIds.map(nodeId => `
							<option value="${Utils.sanitizeHtml(nodeId)}" ${(edge.target === nodeId || (typeof edge.target === 'object' && edge.target.id === nodeId)) ? 'selected' : ''}>
								${Utils.sanitizeHtml(nodeId)}
							</option>
						`).join('')}
					</select>
				</div>

                <div class="property-item">
                    <label class="property-label">Type (Feature 11: Dropdown)</label>
                    <input list="edge-types-datalist" type="text" class="property-input" id="prop-type" value="${Utils.sanitizeHtml(edge.properties.type || 'related')}">
                    <datalist id="edge-types-datalist">
                        ${allTypes.map(type => `<option value="${Utils.sanitizeHtml(type)}">`).join('')}
                    </datalist>
                </div>

                <div class="property-item">
                    <label class="property-label">Color</label>
                    <div class="color-palette">
                        ${this.colorPalette.map(color => `
                            <button class="color-swatch ${edge.properties.color === color ? 'active' : ''}" 
                                    data-color="${color}" 
                                    style="background-color: ${color};"
                                    title="${color}">
                            </button>
                        `).join('')}
                    </div>
                    <input type="color" class="property-input" id="prop-color" value="${edge.properties.color || '#95a5a6'}">
                </div>

                <div class="property-item">
                    <label class="property-label">Weight</label>
                    <input type="number" class="property-input" id="prop-weight" value="${edge.properties.weight || 1}" min="0.1" max="10" step="0.1">
                </div>

                <div class="property-item">
                    <label class="property-label">Arrow Direction</label>
                    <div class="property-checkbox-container">
                        <input type="checkbox" class="property-checkbox" id="prop-directed" ${edge.properties.directed !== false ? 'checked' : ''}>
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
            const otherNodeId = isOutgoing ? (targetId || '(Free End)') : (sourceId || '(Free End)');
            const direction = isOutgoing ? '→' : '←';
            const edgeLabel = edge.properties.type || edge.id;
            
            return `
                <div class="connection-item" data-edge-id="${edge.id}" data-node-id="${nodeId}">
                    <div class="connection-info">
                        <span class="connection-direction">${direction}</span>
                        <span class="connection-node">${Utils.sanitizeHtml(String(otherNodeId))}</span>
                        <span class="connection-label">${Utils.sanitizeHtml(edgeLabel)}</span>
                    </div>
                    <div class="connection-actions">
                        <button class="btn-toggle-inline-edit" title="Quick edit" data-edge-id="${edge.id}">✎</button>
                        <button class="btn-view-edge-details" title="View full details" data-edge-id="${edge.id}">⋯</button>
                        <button class="btn-delete-connection" title="Delete connection" data-edge-id="${edge.id}">✕</button>
                    </div>
                    <div class="connection-inline-edit" id="inline-edit-${edge.id}" style="display: none;">
                        <!-- Inline editing controls will be inserted here -->
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Toggle inline editing for a connection
     */
    toggleConnectionInlineEdit(edgeId, nodeId) {
        const inlineEditDiv = document.getElementById(`inline-edit-${edgeId}`);
        if (!inlineEditDiv) return;

        // If already visible, hide it
        if (inlineEditDiv.style.display !== 'none') {
            inlineEditDiv.style.display = 'none';
            inlineEditDiv.innerHTML = '';
            return;
        }

        // Hide all other inline edits first
        document.querySelectorAll('.connection-inline-edit').forEach(div => {
            div.style.display = 'none';
            div.innerHTML = '';
        });

        // Get edge data
        const edge = this.graph.getEdge(edgeId);
        if (!edge) return;

        const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
        const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
        const isOutgoing = sourceId === nodeId;

        // Get all available nodes and types
        const allNodeIds = this.graph.getAllNodeIds().filter(id => id !== nodeId);
        const allTypes = this.graph.getAllEdgeTypes();
        const currentType = edge.properties.type || 'related';

        // Build inline editing HTML
        const inlineHTML = `
            <div class="inline-edit-controls">
                <div class="inline-edit-row">
                    <label class="inline-edit-label">Direction:</label>
                    <select class="inline-edit-select" id="inline-direction-${edgeId}">
                        <option value="outgoing" ${isOutgoing ? 'selected' : ''}>→ Outgoing</option>
                        <option value="incoming" ${!isOutgoing ? 'selected' : ''}>← Incoming</option>
                    </select>
                </div>
                <div class="inline-edit-row">
                    <label class="inline-edit-label">Node:</label>
                    <select class="inline-edit-select" id="inline-node-${edgeId}">
                        <option value="">(Free End)</option>
                        ${allNodeIds.map(id => {
                            const otherNodeId = isOutgoing ? targetId : sourceId;
                            const selected = id === otherNodeId ? 'selected' : '';
                            return `<option value="${Utils.sanitizeHtml(id)}" ${selected}>${Utils.sanitizeHtml(id)}</option>`;
                        }).join('')}
                    </select>
                </div>
                <div class="inline-edit-row">
                    <label class="inline-edit-label">Type:</label>
                    <input list="inline-types-${edgeId}" 
                           type="text" 
                           class="inline-edit-input" 
                           id="inline-type-${edgeId}" 
                           value="${Utils.sanitizeHtml(currentType)}">
                    <datalist id="inline-types-${edgeId}">
                        ${allTypes.map(type => `<option value="${Utils.sanitizeHtml(type)}">`).join('')}
                    </datalist>
                </div>
            </div>
        `;

        inlineEditDiv.innerHTML = inlineHTML;
        inlineEditDiv.style.display = 'block';

        // Attach event listeners for inline edits
        this.attachInlineEditHandlers(edgeId, nodeId);
    }

    /**
     * Attach event listeners for inline editing controls
     */
    attachInlineEditHandlers(edgeId, nodeId) {
        const directionSelect = document.getElementById(`inline-direction-${edgeId}`);
        const nodeSelect = document.getElementById(`inline-node-${edgeId}`);
        const typeInput = document.getElementById(`inline-type-${edgeId}`);

        if (!directionSelect || !nodeSelect || !typeInput) return;

        // Handle direction change
        directionSelect.addEventListener('change', () => {
            const newDirection = directionSelect.value;
            const selectedNode = nodeSelect.value;
            
            if (selectedNode) {
                this.updateConnectionDirection(edgeId, nodeId, newDirection, selectedNode);
            }
        });

        // Handle node change
        nodeSelect.addEventListener('change', () => {
            const newDirection = directionSelect.value;
            const selectedNode = nodeSelect.value;
            
            this.updateConnectionNode(edgeId, nodeId, newDirection, selectedNode);
        });

        // Handle type change
        typeInput.addEventListener('change', () => {
            const newType = typeInput.value.trim();
            if (newType) {
                this.graph.updateEdge(edgeId, { type: newType });
                this.renderer.render();
                
                if (window.app) {
                    window.app.saveState();
                    window.app.updateStatus(`Updated edge type to: ${newType}`);
                }

                // Refresh the connections list
                this.showNodeProperties(nodeId);
            }
        });
    }

    /**
     * Update connection direction
     */
    updateConnectionDirection(edgeId, currentNodeId, newDirection, otherNodeId) {
        const edge = this.graph.getEdge(edgeId);
        if (!edge) return;

        if (newDirection === 'outgoing') {
            // Current node should be source
            this.graph.changeEdgeEndpoint(edgeId, 'source', currentNodeId);
            this.graph.changeEdgeEndpoint(edgeId, 'target', otherNodeId || '');
        } else {
            // Current node should be target
            this.graph.changeEdgeEndpoint(edgeId, 'source', otherNodeId || '');
            this.graph.changeEdgeEndpoint(edgeId, 'target', currentNodeId);
        }

        this.renderer.render();
        
        if (window.app) {
            window.app.saveState();
            window.app.updateStatus(`Updated connection direction`);
        }

        // Refresh the connections list
        this.showNodeProperties(currentNodeId);
    }

    /**
     * Update connection node
     */
    updateConnectionNode(edgeId, currentNodeId, direction, newNodeId) {
        const edge = this.graph.getEdge(edgeId);
        if (!edge) return;

        if (direction === 'outgoing') {
            // Update target
            this.graph.changeEdgeEndpoint(edgeId, 'target', newNodeId || '');
        } else {
            // Update source
            this.graph.changeEdgeEndpoint(edgeId, 'source', newNodeId || '');
        }

        this.renderer.render();
        
        if (window.app) {
            window.app.saveState();
            window.app.updateStatus(`Updated connection to: ${newNodeId || '(Free End)'}`);
        }

        // Refresh the connections list
        this.showNodeProperties(currentNodeId);
    }

    /**
     * Show connection to node dialog (Feature 7: Fixed selection reset)
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
        
        const dropdownHTML = `
            <div class="connection-selector" style="margin-top: 15px; padding: 15px; background: var(--light-bg); border-radius: 6px;">
                <label class="property-label">Select target node:</label>
                <select id="target-node-dropdown" class="property-select" style="margin-bottom: 10px;">
                    <option value="">-- Choose a node --</option>
                    ${availableNodes.map(id => `<option value="${Utils.sanitizeHtml(id)}">${Utils.sanitizeHtml(id)}</option>`).join('')}
                </select>
                
                <label class="property-label" style="margin-top: 10px;">Connection direction:</label>
                <div style="display: flex; gap: 15px; margin-bottom: 10px; padding: 10px; background: white; border-radius: 4px;">
                    <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                        <input type="radio" name="connection-direction" value="outgoing" checked style="cursor: pointer;">
                        <span style="font-size: 13px;">
                            <strong>${Utils.sanitizeHtml(sourceNodeId)}</strong> → Target (Outgoing)
                        </span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                        <input type="radio" name="connection-direction" value="incoming" style="cursor: pointer;">
                        <span style="font-size: 13px;">
                            Target → <strong>${Utils.sanitizeHtml(sourceNodeId)}</strong> (Incoming)
                        </span>
                    </label>
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button id="btn-confirm-connection" class="modal-btn" style="flex: 1;" disabled>Create Connection</button>
                    <button id="btn-cancel-connection" class="modal-btn" style="flex: 1; background-color: var(--border-color);">Cancel</button>
                </div>
            </div>
        `;
        
        const connectionsContainer = document.getElementById('connections-container');
        if (connectionsContainer) {
            const existingSelector = connectionsContainer.querySelector('.connection-selector');
            if (existingSelector) existingSelector.remove();
            
            connectionsContainer.insertAdjacentHTML('afterend', dropdownHTML);
            
            const dropdown = document.getElementById('target-node-dropdown');
            const confirmBtn = document.getElementById('btn-confirm-connection');
            const cancelBtn = document.getElementById('btn-cancel-connection');
            
            dropdown.addEventListener('change', () => {
                confirmBtn.disabled = !dropdown.value;
            });
            
            confirmBtn.addEventListener('click', () => {
                const targetId = dropdown.value;
                const direction = document.querySelector('input[name="connection-direction"]:checked').value;
                
                if (targetId && window.app) {
                    // Feature 7: Clear selection before creating edge
                    this.renderer.clearSelection();
                    
                    if (direction === 'outgoing') {
                        window.app.addEdge(sourceNodeId, targetId);
                    } else {
                        window.app.addEdge(targetId, sourceNodeId);
                    }
                    
                    this.showNodeProperties(sourceNodeId);
                }
            });
            
            cancelBtn.addEventListener('click', () => {
                const selector = document.querySelector('.connection-selector');
                if (selector) selector.remove();
            });
            
            dropdown.focus();
        }
    }

    /**
     * Attach event handlers to property inputs
     */
    attachPropertyHandlers() {
        // Feature 2: Editable IDs
        const nodeIdInput = document.getElementById('prop-node-id');
        const edgeIdInput = document.getElementById('prop-edge-id');
		
		// Source/Target dropdown handlers
		const sourceInput = document.getElementById('prop-source');
		const targetInput = document.getElementById('prop-target');

		if (sourceInput) {
			sourceInput.addEventListener('change', (e) => {
				const newSourceId = e.target.value;
				this.changeEdgeEndpoint('source', newSourceId);
			});
		}

		if (targetInput) {
			targetInput.addEventListener('change', (e) => {
				const newTargetId = e.target.value;
				this.changeEdgeEndpoint('target', newTargetId);
			});
		}
        
        if (nodeIdInput) {
            nodeIdInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.renameNode(nodeIdInput.value.trim());
                }
            });
        }
        
        if (edgeIdInput) {
            edgeIdInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.renameEdge(edgeIdInput.value.trim());
                }
            });
        }

        // Feature 8: Color palette swatches
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', () => {
                const color = swatch.dataset.color;
                this.updateProperty('color', color);
                
                // Update active state
                document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
                
                // Update color picker
                const colorInput = document.getElementById('prop-color');
                if (colorInput) {
                    colorInput.value = color;
                }
            });
        });

        // Standard property inputs
        const colorInput = document.getElementById('prop-color');
        const sizeInput = document.getElementById('prop-size');
        const descInput = document.getElementById('prop-description');
        const typeInput = document.getElementById('prop-type');
        const weightInput = document.getElementById('prop-weight');
        const directedInput = document.getElementById('prop-directed');
        const priorityInput = document.getElementById('prop-priority');
        const deadlineInput = document.getElementById('prop-deadline');
        const userDateInput = document.getElementById('prop-userDate');

        if (colorInput) {
            colorInput.addEventListener('change', (e) => this.updateProperty('color', e.target.value));
        }

        if (sizeInput) {
            sizeInput.addEventListener('change', (e) => this.updateProperty('size', parseFloat(e.target.value)));
        }

        if (descInput) {
            descInput.addEventListener('change', (e) => this.updateProperty('description', e.target.value));
        }

        if (typeInput) {
            typeInput.addEventListener('change', (e) => this.updateProperty('type', e.target.value));
        }

        if (weightInput) {
            weightInput.addEventListener('change', (e) => this.updateProperty('weight', parseFloat(e.target.value)));
        }

        if (directedInput) {
            directedInput.addEventListener('change', (e) => this.updateProperty('directed', e.target.checked));
        }

        if (priorityInput) {
            priorityInput.addEventListener('change', (e) => this.updateProperty('priority', e.target.value));
        }

        if (deadlineInput) {
            deadlineInput.addEventListener('change', (e) => this.updateProperty('deadline', e.target.value));
        }

        if (userDateInput) {
            userDateInput.addEventListener('change', (e) => this.updateProperty('userDate', userDateInput.value));
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
        
        // NEW: Connection handlers with three buttons
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
                .text(d => d.properties.type || d.id);
        }
        
        if (window.app) {
            window.app.saveState();
        }
    }

    /**
     * Update a custom property
     */
    updateCustomProperty(input) {
        if (!this.currentSelection) return;

        const propertyDiv = input.closest('.custom-property');
        const oldKey = propertyDiv.dataset.key;
        const keyInput = propertyDiv.querySelector('.custom-property-key');
        const valueInput = propertyDiv.querySelector('.custom-property-value');
        
        const newKey = keyInput.value.trim();
        const newValue = valueInput.value.trim();

        if (!newKey) return;

        if (this.currentType === 'node') {
            const node = this.graph.getNode(this.currentSelection);
            if (newKey !== oldKey) {
                delete node.properties[oldKey];
            }
            node.properties[newKey] = newValue;
        } else if (this.currentType === 'edge') {
            const edge = this.graph.getEdge(this.currentSelection);
            if (newKey !== oldKey) {
                delete edge.properties[oldKey];
            }
            edge.properties[newKey] = newValue;
        }

        propertyDiv.dataset.key = newKey;
        
        if (window.app) {
            window.app.saveState();
        }
    }

    /**
     * Add a new custom property
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
}

// Export
window.PropertiesPanel = PropertiesPanel;