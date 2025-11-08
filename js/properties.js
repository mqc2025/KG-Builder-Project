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
        
        // NEW: Store connect modal reference
        this.connectModal = null;
        
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
                                    style="background-color: ${color};" 
                                    data-color="${color}"></button>
                        `).join('')}
                    </div>
                    <input type="color" class="property-input" id="prop-color" value="${node.properties.color || '#3498db'}" style="margin-top: 8px;">
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
                <div class="property-group-title">Planning & Tracking</div>
                
                <div class="property-item">
                    <label class="property-label">Priority (Feature 3)</label>
                    <select class="property-input" id="prop-priority">
                        <option value="low" ${node.properties.priority === 'low' ? 'selected' : ''}>Low</option>
                        <option value="medium" ${node.properties.priority === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="high" ${node.properties.priority === 'high' ? 'selected' : ''}>High</option>
                    </select>
                </div>

                <div class="property-item">
                    <label class="property-label">Deadline (Feature 3)</label>
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

        const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
        const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
        const allNodeIds = this.graph.getAllNodeIds();
        const allTypes = [...new Set(this.graph.edges.map(e => e.properties.type).filter(t => t))];

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
                        <option value="">${sourceId ? '(Disconnect)' : '(Free End)'}</option>
                        ${allNodeIds.map(id => {
                            return `<option value="${Utils.sanitizeHtml(id)}" ${id === sourceId ? 'selected' : ''}>${Utils.sanitizeHtml(id)}</option>`;
                        }).join('')}
                    </select>
                </div>

                <div class="property-item">
                    <label class="property-label">Target</label>
                    <select class="property-input" id="prop-target">
                        <option value="">${targetId ? '(Disconnect)' : '(Free End)'}</option>
                        ${allNodeIds.map(id => {
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
                    <span class="connection-text">
                        ${direction} ${Utils.sanitizeHtml(otherNodeId || '(Free End)')}
                    </span>
                    <div class="connection-actions">
                        <button class="btn-toggle-inline-edit" title="Edit connection">✎</button>
                        <button class="btn-view-edge-details" title="View edge details">⋯</button>
                        <button class="btn-delete-connection" title="Delete connection">✕</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Attach property handlers to current panel
     */
    attachPropertyHandlers() {
        // Node ID editing
        const nodeIdInput = document.getElementById('prop-node-id');
        if (nodeIdInput) {
            nodeIdInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.renameNode(e.target.value.trim());
                }
            });
        }

        // Edge ID editing
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
        const propertyInputs = ['prop-color', 'prop-size', 'prop-description', 
                               'prop-priority', 'prop-deadline', 'prop-type', 'prop-weight'];
        
        propertyInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', (e) => {
                    const key = id.replace('prop-', '');
                    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
                    this.updateProperty(key, value);
                });
            }
        });

        // Custom properties - value changes
        const customValueInputs = document.querySelectorAll('.custom-property-value');
        customValueInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const propertyDiv = e.target.closest('.custom-property');
                const key = propertyDiv.dataset.key;
                let value = e.target.value;
                try {
                    value = value && !isNaN(value) ? JSON.parse(value) : value;
                } catch {
                    // Keep as string if not valid JSON
                }
                this.updateProperty(key, value);
            });
        });

        // Custom properties - key changes
        const customKeyInputs = document.querySelectorAll('.custom-property-key');
        customKeyInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const propertyDiv = e.target.closest('.custom-property');
                const oldKey = propertyDiv.dataset.key;
                const newKey = e.target.value.trim();
                const valueInput = propertyDiv.querySelector('.custom-property-value');
                let value = valueInput.value;
                
                try {
                    value = value && !isNaN(value) ? JSON.parse(value) : value;
                } catch {
                    // Keep as string
                }

                if (newKey && newKey !== oldKey) {
                    this.renameProperty(oldKey, newKey, value);
                    propertyDiv.dataset.key = newKey;
                }
            });
        });

        // Remove property buttons
        const removeButtons = document.querySelectorAll('.btn-remove-property');
        removeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const propertyDiv = e.target.closest('.custom-property');
                const key = propertyDiv.dataset.key;
                this.removeProperty(key);
            });
        });

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

        // Connect to node button - UPDATED to use modal
        const connectBtn = document.getElementById('btn-connect-to-node');
        if (connectBtn) {
            connectBtn.addEventListener('click', () => {
                this.showConnectToNodeModal(this.currentSelection);
            });
        }

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
        this.showNodeProperties(newId);
        this.renderer.render();
        
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
        this.showEdgeProperties(newId);
        this.renderer.render();
        
        if (window.app) {
            window.app.saveState();
            window.app.updateStatus(`Renamed edge to: ${newId}`);
        }
    }

    /**
     * Update a property
     */
    updateProperty(key, value) {
        if (this.currentType === 'node') {
            const node = this.graph.getNode(this.currentSelection);
            if (!node) return;
            node.properties[key] = value;
        } else if (this.currentType === 'edge') {
            const edge = this.graph.getEdge(this.currentSelection);
            if (!edge) return;
            edge.properties[key] = value;
        }

        this.graph.updateModifiedDate();
        this.renderer.render();
        
        if (window.app) {
            window.app.saveState();
        }
    }

    /**
     * Rename a custom property
     */
    renameProperty(oldKey, newKey, value) {
        if (this.currentType === 'node') {
            const node = this.graph.getNode(this.currentSelection);
            if (!node) return;
            delete node.properties[oldKey];
            node.properties[newKey] = value;
        } else if (this.currentType === 'edge') {
            const edge = this.graph.getEdge(this.currentSelection);
            if (!edge) return;
            delete edge.properties[oldKey];
            edge.properties[newKey] = value;
        }

        this.graph.updateModifiedDate();
        this.renderer.render();
        
        if (window.app) {
            window.app.saveState();
        }
    }

    /**
     * Remove a custom property
     */
    removeProperty(key) {
        if (this.currentType === 'node') {
            const node = this.graph.getNode(this.currentSelection);
            if (!node) return;
            delete node.properties[key];
            this.showNodeProperties(this.currentSelection);
        } else if (this.currentType === 'edge') {
            const edge = this.graph.getEdge(this.currentSelection);
            if (!edge) return;
            delete edge.properties[key];
            this.showEdgeProperties(this.currentSelection);
        }

        this.graph.updateModifiedDate();
        this.renderer.render();
        
        if (window.app) {
            window.app.saveState();
        }
    }

    /**
     * Add a new custom property
     */
    addCustomProperty() {
        const key = prompt('Property name:');
        if (!key) return;

        const value = prompt('Property value:');
        if (value === null) return;

        this.updateProperty(key, value);

        if (this.currentType === 'node') {
            this.showNodeProperties(this.currentSelection);
        } else if (this.currentType === 'edge') {
            this.showEdgeProperties(this.currentSelection);
        }
    }

    /**
     * Delete selected node or edge
     */
    deleteSelected() {
        if (!Utils.confirm(`Delete this ${this.currentType}?`)) return;

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
            window.app.updateStatus(`Deleted ${this.currentType}`);
        }
    }

    /**
     * Change edge endpoint (source or target)
     */
    changeEdgeEndpoint(end, newNodeId) {
        const edge = this.graph.getEdge(this.currentSelection);
        if (!edge) return;

        if (newNodeId === '') {
            // Disconnect: create free end
            const node = end === 'source' ? 
                (typeof edge.source === 'object' ? edge.source : this.graph.getNode(edge.source)) :
                (typeof edge.target === 'object' ? edge.target : this.graph.getNode(edge.target));
            
            if (node) {
                this.graph.breakEdge(edge.id, end, node.x, node.y);
            }
        } else {
            // Connect to node
            this.graph.changeEdgeEndpoint(edge.id, end, newNodeId);
        }

        this.showEdgeProperties(this.currentSelection);
        this.renderer.render();

        if (window.app) {
            window.app.saveState();
        }
    }

    /**
     * Feature 10: Break edge into 2 pieces with a new node in the middle
     */
    breakEdgeWithNodes() {
        const edge = this.graph.getEdge(this.currentSelection);
        if (!edge) return;

        const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
        const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;

        if (!sourceId || !targetId) {
            alert('Cannot break an edge that already has a free end.');
            return;
        }

        const sourceNode = this.graph.getNode(sourceId);
        const targetNode = this.graph.getNode(targetId);

        if (!sourceNode || !targetNode) {
            alert('Cannot find connected nodes.');
            return;
        }

        // Calculate midpoint
        const midX = (sourceNode.x + targetNode.x) / 2;
        const midY = (sourceNode.y + targetNode.y) / 2;

        // Create new node at midpoint
        const newNodeId = `mid_${Date.now()}`;
        const newNode = this.graph.addNode({
            id: newNodeId,
            properties: {
                description: `Created by breaking edge ${edge.id}`,
                color: '#9b59b6'
            }
        });

        newNode.x = midX;
        newNode.y = midY;
        newNode.fx = midX;
        newNode.fy = midY;

        // Create two new edges - FIXED: Using correct parameter format
        const edge1Id = `${edge.id}_1`;
        const edge2Id = `${edge.id}_2`;

        this.graph.addEdge(sourceId, newNodeId, {
            id: edge1Id,
            ...edge.properties
        });

        this.graph.addEdge(newNodeId, targetId, {
            id: edge2Id,
            ...edge.properties
        });

        // Remove original edge
        this.graph.removeEdge(edge.id);

        this.hide();
        this.renderer.render();

        if (window.app) {
            window.app.updateStats();
            window.app.saveState();
            window.app.updateStatus(`Edge broken into 2 pieces with new node: ${newNodeId}`);
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
     * UPDATED: Show modal dialog to connect current node to another node
     * Location: This method replaces the old prompt-based showConnectToNodeDialog
     */
    showConnectToNodeModal(fromNodeId) {
        const allNodeIds = this.graph.getAllNodeIds().filter(id => id !== fromNodeId);
        
        if (allNodeIds.length === 0) {
            alert('No other nodes available to connect to.');
            return;
        }

        // Create modal if it doesn't exist
        if (!this.connectModal) {
            this.connectModal = this.createConnectModal();
        }

        // Populate dropdown with available nodes
        const dropdown = this.connectModal.querySelector('#connect-node-select');
        dropdown.innerHTML = `
            <option value="">-- Select a node --</option>
            ${allNodeIds.map(id => `
                <option value="${Utils.sanitizeHtml(id)}">${Utils.sanitizeHtml(id)}</option>
            `).join('')}
            <option value="__CREATE_NEW__" style="font-weight: bold; color: var(--primary-color);">+ Create New Node</option>
        `;

        // Show the modal
        this.connectModal.classList.remove('hidden');
        dropdown.focus();
    }

    /**
     * NEW: Create the connection modal DOM element
     * Location: New helper method for modal creation
     */
    createConnectModal() {
        const modal = document.createElement('div');
        modal.id = 'connect-node-modal';
        modal.className = 'modal hidden';
        modal.style.zIndex = '2500'; // Higher than properties panel

        modal.innerHTML = `
            <div class="modal-content" style="margin-top: 80px; margin-right: 380px; min-width: 350px; max-width: 350px;">
                <div class="modal-header">
                    <h3>Connect to Node</h3>
                    <button class="modal-close" id="connect-modal-close">✕</button>
                </div>
                <div class="modal-body">
                    <div class="property-item">
                        <label class="property-label">Select node:</label>
                        <select id="connect-node-select" class="property-input" style="width: 100%;">
                            <option value="">-- Select a node --</option>
                        </select>
                        <p class="property-hint">Choose an existing node or create a new one</p>
                    </div>
                    <div class="property-item">
                        <label class="property-label">Connection direction:</label>
                        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                <input type="radio" name="connect-direction" value="target" checked style="cursor: pointer;">
                                <span>Current node → Selected node (as target)</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                <input type="radio" name="connect-direction" value="source" style="cursor: pointer;">
                                <span>Selected node → Current node (as source)</span>
                            </label>
                        </div>
                        <p class="property-hint">Choose the direction of the edge</p>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button id="connect-modal-confirm" class="modal-btn" style="flex: 1;" disabled>
                            Connect
                        </button>
                        <button id="connect-modal-cancel" class="modal-btn" style="flex: 1; background-color: var(--border-color);">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        const dropdown = modal.querySelector('#connect-node-select');
        const confirmBtn = modal.querySelector('#connect-modal-confirm');
        const cancelBtn = modal.querySelector('#connect-modal-cancel');
        const closeBtn = modal.querySelector('#connect-modal-close');

        // Enable/disable connect button based on selection
        dropdown.addEventListener('change', () => {
            confirmBtn.disabled = !dropdown.value;
        });

        // Confirm connection
        confirmBtn.addEventListener('click', () => {
            const selectedValue = dropdown.value;
            if (!selectedValue) return;

            // Get the selected direction
            const directionRadio = modal.querySelector('input[name="connect-direction"]:checked');
            const direction = directionRadio ? directionRadio.value : 'target';

            if (selectedValue === '__CREATE_NEW__') {
                this.createNewNodeAndConnect(direction);
            } else {
                this.connectToExistingNode(selectedValue, direction);
            }

            modal.classList.add('hidden');
        });

        // Cancel button
        cancelBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        // Close button
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        // Click outside to close (but not on modal content)
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });

        return modal;
    }

    /**
     * NEW: Connect to an existing node - FIXED: Using correct addEdge parameter format
     * Location: New helper method extracted from old showConnectToNodeDialog
     */
    connectToExistingNode(toNodeId, direction = 'target') {
        if (!this.graph.getNode(toNodeId)) {
            alert('Target node does not exist.');
            return;
        }

        const fromNodeId = this.currentSelection;
        
        // Determine source and target based on direction
        let sourceId, targetId, edgeId;
        if (direction === 'target') {
            // Current node → Selected node (selected is target)
            sourceId = fromNodeId;
            targetId = toNodeId;
            edgeId = `edge_${fromNodeId}_${toNodeId}`;
        } else {
            // Selected node → Current node (selected is source)
            sourceId = toNodeId;
            targetId = fromNodeId;
            edgeId = `edge_${toNodeId}_${fromNodeId}`;
        }
        
        // FIXED: Changed from passing single object to passing three parameters
        this.graph.addEdge(sourceId, targetId, {
            id: edgeId,
            type: 'connection',
            color: '#95a5a6'
        });

        this.renderer.render();
        this.showNodeProperties(fromNodeId);

        if (window.app) {
            window.app.updateStats();
            window.app.saveState();
            window.app.updateStatus(`Connected ${sourceId} → ${targetId}`);
        }
    }

    /**
     * NEW: Create a new node and connect to it - FIXED: Using correct addEdge parameter format
     * Location: New method for creating nodes from connection modal
     */
    createNewNodeAndConnect(direction = 'target') {
        const fromNode = this.graph.getNode(this.currentSelection);
        if (!fromNode) return;

        // Generate a unique ID for the new node
        let newNodeId = `node_${Date.now()}`;
        let counter = 1;
        while (this.graph.getNode(newNodeId)) {
            newNodeId = `node_${Date.now()}_${counter}`;
            counter++;
        }

        // Create new node positioned near the source node
        const offsetX = 100;
        const offsetY = 0;
        const newNode = this.graph.addNode({
            id: newNodeId,
            properties: {
                description: `Created from ${this.currentSelection}`,
                color: '#3498db'
            }
        });

        newNode.x = fromNode.x + offsetX;
        newNode.y = fromNode.y + offsetY;
        newNode.fx = newNode.x;
        newNode.fy = newNode.y;

        // Determine source and target based on direction
        let sourceId, targetId, edgeId;
        if (direction === 'target') {
            // Current node → New node (new node is target)
            sourceId = this.currentSelection;
            targetId = newNodeId;
            edgeId = `edge_${this.currentSelection}_${newNodeId}`;
        } else {
            // New node → Current node (new node is source)
            sourceId = newNodeId;
            targetId = this.currentSelection;
            edgeId = `edge_${newNodeId}_${this.currentSelection}`;
        }

        // Create the edge - FIXED: Changed from passing single object to passing three parameters
        this.graph.addEdge(sourceId, targetId, {
            id: edgeId,
            type: 'connection',
            color: '#95a5a6'
        });

        this.renderer.render();
        this.showNodeProperties(this.currentSelection);

        if (window.app) {
            window.app.updateStats();
            window.app.saveState();
            window.app.updateStatus(`Created new node ${newNodeId} and connected ${sourceId} → ${targetId}`);
        }
    }
}

// Export
window.PropertiesPanel = PropertiesPanel;
