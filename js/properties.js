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
            <div class="property-item">
				<label class="property-label">Name</label>
				<input type="text" class="property-input" id="prop-node-name" value="${Utils.sanitizeHtml(node.name || node.id)}">
				<p class="property-hint">Press Enter to save (will regenerate ID)</p>
			</div>

			<div class="property-item">
				<label class="property-label">Description</label>
				<textarea class="property-textarea" id="prop-description">${Utils.sanitizeHtml(node.description || '')}</textarea>
			</div>

			<div class="property-item">
				<label class="property-label">Color (Feature 8: Palette)</label>
                    <div class="color-palette">
                        ${this.colorPalette.map(color => `
                            <button class="color-swatch ${node.color === color ? 'selected' : ''}" 
                                    data-color="${color}" 
                                    style="background-color: ${color};"
                                    title="${color}">
                            </button>
                        `).join('')}
                    </div>
                    <input type="color" class="property-input" id="prop-color" value="${node.color || '#3498db'}">
                </div>
				
				<div class="property-item">
					<label class="property-label">Icon (Emoji)</label>
					<div class="icon-palette">
						<button class="icon-swatch ${!node.icon || node.icon === '' ? 'active' : ''}" 
								data-icon="" 
								title="No icon (filled circle)"
								style="background-color: ${node.color || '#3498db'}; border-radius: 50%;">
						</button>
						<button class="icon-swatch ${node.icon === '📊' ? 'active' : ''}" 
								data-icon="📊" 
								title="Chart">
							📊
						</button>
						<button class="icon-swatch ${node.icon === '📁' ? 'active' : ''}" 
								data-icon="📁" 
								title="Folder">
							📁
						</button>
						<button class="icon-swatch ${node.icon === '💡' ? 'active' : ''}" 
								data-icon="💡" 
								title="Idea">
							💡
						</button>
						<button class="icon-swatch ${node.icon === '🔧' ? 'active' : ''}" 
								data-icon="🔧" 
								title="Tool">
							🔧
						</button>
						<button class="icon-swatch ${node.icon === '⚙️' ? 'active' : ''}" 
								data-icon="⚙️" 
								title="Settings">
							⚙️
						</button>
						<button class="icon-swatch ${node.icon === '📝' ? 'active' : ''}" 
								data-icon="📝" 
								title="Document">
							📝
						</button>
						<button class="icon-swatch ${node.icon === '🎯' ? 'active' : ''}" 
								data-icon="🎯" 
								title="Target">
							🎯
						</button>
						<button class="icon-swatch ${node.icon === '🔍' ? 'active' : ''}" 
								data-icon="🔍" 
								title="Search">
							🔍
						</button>
						<button class="icon-swatch ${node.icon === '🚀' ? 'active' : ''}" 
								data-icon="🚀" 
								title="Rocket">
							🚀
						</button>
						<button class="icon-swatch ${node.icon === '🏢' ? 'active' : ''}" 
								data-icon="🏢" 
								title="Building">
							🏢
						</button>
						<button class="icon-swatch icon-more-btn" 
								title="More icons...">
							⋯
						</button>
					</div>
					<input type="text" class="property-input" id="prop-icon" 
						   value="${Utils.sanitizeHtml(node.icon || '')}" 
						   placeholder="Or enter any emoji" 
						   maxlength="4"
						   style="margin-top: 8px;">
					<p class="property-hint">Click palette, "More icons..." button, or type emoji</p>
				</div>

                <div class="property-item">
                    <label class="property-label">Size</label>
                    <input type="number" class="property-input" id="prop-size" value="${node.size || 10}" min="5" max="30">
                </div>

                <div class="property-item">
					<label class="property-label">Category</label>
					<input type="text" class="property-input" id="prop-category" list="category-suggestions" value="${Utils.sanitizeHtml(node.category || '')}">
					<datalist id="category-suggestions">
						<option value="Project">
						<option value="Task">
						<option value="Note">
						<option value="Document">
						<option value="Person">
						<option value="Organization">
						<option value="Concept">
						<option value="Resource">
						<option value="Event">
						<option value="Goal">
						<option value="Field">
						<option value="Algorithm">
						<option value="Application">
						<option value="Reference">
						<option value="Implementation">
						<option value="Requirement">
						<option value="Process">
						<option value="Evidence">
						<option value="Decision">
						<option value="Risk">
					</datalist>
				</div>

                <div class="property-item">
                    <label class="property-label">Sub-Category</label>
                    <input type="text" class="property-input" id="prop-subcat" value="${Utils.sanitizeHtml(node.subCat || '')}">
                </div>
                
                <div class="property-item">
                    <label class="property-label">Priority (Feature 3)</label>
                    <select class="property-input" id="prop-priority">
                        <option value="Low" ${node.priority === 'Low' ? 'selected' : ''}>Low</option>
                        <option value="Medium" ${node.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                        <option value="High" ${node.priority === 'High' ? 'selected' : ''}>High</option>
                    </select>
                </div>

                <div class="property-item">
                    <label class="property-label">Deadline (Feature 3)</label>
                    <input type="date" class="property-input" id="prop-deadline" value="${node.deadline || ''}">
                </div>

                <div class="property-item">
                    <label class="property-label">Link 1</label>
                    <div class="link-input-group">
                        <input type="text" class="property-input link-input" id="prop-link1" value="${Utils.sanitizeHtml(node.link1 || '')}" placeholder="https:// or file path">
                        <button class="btn-link-action" data-link="link1" data-action="open" title="Open link" ${!node.link1 ? 'disabled' : ''}>🔗</button>
                    </div>
                    ${node.link1?.startsWith('image://') ? `
                        <div class="image-preview-container">
                            <img class="image-thumbnail" data-image-id="${node.link1.replace('image://', '')}" src="" alt="Loading...">
                            <button class="btn-preview-image" data-image-id="${node.link1.replace('image://', '')}" title="View full size">👁️ Preview</button>
                        </div>
                    ` : ''}
                </div>

                <div class="property-item">
                    <label class="property-label">Link 2</label>
                    <div class="link-input-group">
                        <input type="text" class="property-input link-input" id="prop-link2" value="${Utils.sanitizeHtml(node.link2 || '')}" placeholder="https:// or file path">
                        <button class="btn-link-action" data-link="link2" data-action="open" title="Open link" ${!node.link2 ? 'disabled' : ''}>🔗</button>
                    </div>
                    ${node.link2?.startsWith('image://') ? `
                        <div class="image-preview-container">
                            <img class="image-thumbnail" data-image-id="${node.link2.replace('image://', '')}" src="" alt="Loading...">
                            <button class="btn-preview-image" data-image-id="${node.link2.replace('image://', '')}" title="View full size">👁️ Preview</button>
                        </div>
                    ` : ''}
                </div>

                <div class="property-item">
                    <label class="property-label">Link 3</label>
                    <div class="link-input-group">
                        <input type="text" class="property-input link-input" id="prop-link3" value="${Utils.sanitizeHtml(node.link3 || '')}" placeholder="https:// or file path">
                        <button class="btn-link-action" data-link="link3" data-action="open" title="Open link" ${!node.link3 ? 'disabled' : ''}>🔗</button>
                    </div>
                    ${node.link3?.startsWith('image://') ? `
                        <div class="image-preview-container">
                            <img class="image-thumbnail" data-image-id="${node.link3.replace('image://', '')}" src="" alt="Loading...">
                            <button class="btn-preview-image" data-image-id="${node.link3.replace('image://', '')}" title="View full size">👁️ Preview</button>
                        </div>
                    ` : ''}
                </div>

                <div class="property-item">
                    <label class="property-label">Link 4</label>
                    <div class="link-input-group">
                        <input type="text" class="property-input link-input" id="prop-link4" value="${Utils.sanitizeHtml(node.link4 || '')}" placeholder="https:// or file path">
                        <button class="btn-link-action" data-link="link4" data-action="open" title="Open link" ${!node.link4 ? 'disabled' : ''}>🔗</button>
                    </div>
                    ${node.link4?.startsWith('image://') ? `
                        <div class="image-preview-container">
                            <img class="image-thumbnail" data-image-id="${node.link4.replace('image://', '')}" src="" alt="Loading...">
                            <button class="btn-preview-image" data-image-id="${node.link4.replace('image://', '')}" title="View full size">👁️ Preview</button>
                        </div>
                    ` : ''}
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
                    ${this.renderCustomProperties(node)}
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
        const allRelationships = this.graph.getAllEdgeRelationships();

        const html = `
            <div class="property-group">
                <div class="property-group-title">Edge Information</div>
                
                <div class="property-item">
					<label class="property-label">Relationship</label>
					<input type="text" class="property-input" id="prop-relationship" 
						   value="${Utils.sanitizeHtml(edge.relationship || '')}" 
						   list="relationship-list" 
						   placeholder="e.g., parent-child, implementation">
					<datalist id="relationship-list">
						${allRelationships.map(rel => `<option value="${Utils.sanitizeHtml(rel)}">`).join('')}
					</datalist>
				</div>

				<div class="property-item">
					<label class="property-label">Description</label>
					<textarea class="property-textarea" id="prop-description">${Utils.sanitizeHtml(edge.description || '')}</textarea>
				</div>

				<div class="property-item">
					<label class="property-label">Target</label>
					<select class="property-input" id="prop-target">
						<option value="">${targetId ? '(Disconnect)' : '(Free End)'}</option>
						${allNodeIds.map(id => {
							const node = this.graph.getNode(id);
							const displayName = node ? (node.name || id) : id;
							return `<option value="${Utils.sanitizeHtml(id)}" ${id === targetId ? 'selected' : ''}>${Utils.sanitizeHtml(displayName)}</option>`;
						}).join('')}
					</select>
				</div>

				<div class="property-item">
					<label class="property-label">Source</label>
					<select class="property-input" id="prop-source">
						<option value="">${sourceId ? '(Disconnect)' : '(Free End)'}</option>
						${allNodeIds.map(id => {
							const node = this.graph.getNode(id);
							const displayName = node ? (node.name || id) : id;
							return `<option value="${Utils.sanitizeHtml(id)}" ${id === sourceId ? 'selected' : ''}>${Utils.sanitizeHtml(displayName)}</option>`;
						}).join('')}
					</select>
				</div>

				<div class="property-item">
					<label class="property-label">Name</label>
					<input type="text" class="property-input" id="prop-edge-name" value="${Utils.sanitizeHtml(edge.name || edge.id)}">
					<p class="property-hint">Press Enter to save (will regenerate ID)</p>
				</div>

				<div class="property-item">
					<label class="property-label">Color</label>
					<input type="color" class="property-input" id="prop-color" value="${edge.color || '#95a5a6'}">
				</div>

				<div class="property-item">
					<label class="property-label">Weight</label>
					<input type="number" class="property-input" id="prop-weight" value="${edge.weight || 1}" min="0.1" step="0.1">
				</div>

				<div class="property-item">
					<label class="property-label">
						<input type="checkbox" id="prop-directed" ${edge.directed ? 'checked' : ''}>
						<span>Show arrow direction</span>
					</label>
				</div>
            </div>

            <div class="property-group">
                <div class="property-group-title">Custom Properties</div>
                <div id="custom-properties-container">
                    ${this.renderCustomProperties(edge)}
                </div>
                <button class="btn-add-property" id="btn-add-custom-property">+ Add Property</button>
            </div>

            <div class="property-actions">
                <button class="btn-secondary" id="btn-reverse-edge" style="margin-bottom: 10px;">
                    ↔️ Reverse Direction
                </button>
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
    renderCustomProperties(nodeOrEdge) {
        const standardProps = ['id', 'name', 'x', 'y', 'fx', 'fy', 'vx', 'vy', 'index',
                               'source', 'target', 'sourceX', 'sourceY', 'targetX', 'targetY',
                               'color', 'size', 'description', 'relationship', 'weight', 'directed', 
                               'category', 'subCat', 'link1', 'link2', 'link3', 'link4',
                               'priority', 'deadline', 'userDate', 'createdDate', 'modifiedDate',
                               'freeSourceX', 'freeSourceY', 'freeTargetX', 'freeTargetY', 'icon'];
        const customProps = Object.entries(nodeOrEdge).filter(([key]) => 
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
     * UPDATED: Shows Source (source) →(relationship)→ Target (target) format
     */
    renderNodeConnections(nodeId) {
        const edges = this.getNodeEdges(nodeId);

        if (edges.length === 0) {
            return '<p style="color: var(--text-secondary); font-size: 13px;">No connections</p>';
        }

        return edges.map(edge => {
            const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
            const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
            
            // Get source node display name
            let sourceDisplayName = '(Free End)';
            if (sourceId) {
                const sourceNode = this.graph.getNode(sourceId);
                sourceDisplayName = sourceNode ? (sourceNode.name || sourceId) : sourceId;
            }
            
            // Get target node display name
            let targetDisplayName = '(Free End)';
            if (targetId) {
                const targetNode = this.graph.getNode(targetId);
                targetDisplayName = targetNode ? (targetNode.name || targetId) : targetId;
            }
            
            // Determine which node is "other" for the data attribute
            const otherNodeId = sourceId === nodeId ? targetId : sourceId;
            
            // Build the relationship display
            const relationshipText = edge.relationship ? Utils.sanitizeHtml(edge.relationship) : '';
            const arrowDisplay = relationshipText 
                ? `→${relationshipText}→` 
                : '→';
            
            return `
                <div class="connection-item" data-edge-id="${Utils.sanitizeHtml(edge.id)}" data-node-id="${Utils.sanitizeHtml(otherNodeId)}">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px;">
                        <span class="connection-text" style="flex: 1; line-height: 1.4;">
                            <span style="font-weight: 600; color: var(--text-primary);">${Utils.sanitizeHtml(sourceDisplayName)}</span>
                            <span style="color: var(--primary-color); margin: 0 4px; font-weight: 500;"> ${arrowDisplay} </span>
                            <span style="font-weight: 600; color: var(--text-primary);">${Utils.sanitizeHtml(targetDisplayName)}</span>
                        </span>
                        <div class="connection-actions">
                            <button class="btn-toggle-inline-edit" title="Edit connection">✎</button>
                            <button class="btn-view-edge-details" title="View edge details">⋯</button>
                            <button class="btn-delete-connection" title="Delete connection">✕</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Attach property handlers to current panel
     */
    attachPropertyHandlers() {
        // Node name editing
        const nodeNameInput = document.getElementById('prop-node-name');
        if (nodeNameInput) {
            nodeNameInput.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter') {
                    await this.renameNode(e.target.value.trim());
                }
            });
        }

        // Edge name editing
        const edgeNameInput = document.getElementById('prop-edge-name');
        if (edgeNameInput) {
            edgeNameInput.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter') {
                    await this.renameEdge(e.target.value.trim());
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
		
		// Icon palette
		const iconSwatches = document.querySelectorAll('.icon-swatch');
		iconSwatches.forEach(swatch => {
			swatch.addEventListener('click', (e) => {
				const icon = e.target.dataset.icon;
				this.updateProperty('icon', icon);
				document.getElementById('prop-icon').value = icon;
				
				// Update active state
				iconSwatches.forEach(s => s.classList.remove('active'));
				e.target.classList.add('active');
			});
		});

		// Icon input field
		const iconInput = document.getElementById('prop-icon');
		if (iconInput) {
			iconInput.addEventListener('input', (e) => {
				const icon = e.target.value.trim();
				this.updateProperty('icon', icon);
				
				// Update palette selection
				iconSwatches.forEach(swatch => {
					swatch.classList.toggle('active', swatch.dataset.icon === icon);
				});
			});
		}
		// More icons button
		const moreIconsBtn = document.querySelector('.icon-more-btn');
		if (moreIconsBtn) {
			moreIconsBtn.addEventListener('click', () => {
				this.showIconPickerModal();
			});
		}

        // Standard properties for nodes
		const nodePropertyInputs = ['prop-color', 'prop-size', 'prop-icon', 'prop-description', 
									'prop-category', 'prop-subcat', 'prop-priority', 
									'prop-deadline', 'prop-link1', 'prop-link2', 
									'prop-link3', 'prop-link4'];

		nodePropertyInputs.forEach(id => {
			const input = document.getElementById(id);
			if (input) {
				input.addEventListener('change', (e) => {
					const key = id.replace('prop-', '').replace('subcat', 'subCat');
					let value = e.target.type === 'number' ? 
						parseFloat(e.target.value) : e.target.value;
					
					// Validate links before saving
					if (key.startsWith('link')) {
						const validation = this.validateUrl(value);
						
						if (!validation.valid) {
							alert(validation.error);
							// Restore previous value
							const node = this.graph.getNode(this.currentSelection);
							if (node) {
								e.target.value = node[key] || '';
							}
							return; // Don't save invalid URL
						}
					}
					
					this.updateProperty(key, value);
					
					// Update open button state for links
					if (key.startsWith('link')) {
						const openBtn = document.querySelector(`button[data-link="${key}"][data-action="open"]`);
						if (openBtn) {
							openBtn.disabled = !value;
						}
					}
				});
			}
		});

        // Standard properties for edges
        const edgePropertyInputs = ['prop-color', 'prop-weight', 'prop-description', 
                                    'prop-relationship', 'prop-source', 'prop-target'];
        
        edgePropertyInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', (e) => {
                    const key = id.replace('prop-', '');
                    const value = e.target.type === 'number' ? 
                        parseFloat(e.target.value) : e.target.value;
                    this.updateProperty(key, value);
                });
            }
        });
		
		// Special handler for relationship input - update on Enter key
		const relationshipInput = document.getElementById('prop-relationship');
		if (relationshipInput) {
			relationshipInput.addEventListener('keypress', (e) => {
				if (e.key === 'Enter') {
					e.preventDefault();
					const newValue = e.target.value.trim();
					this.updateProperty('relationship', newValue);
					// Force immediate re-render to show new label
					this.renderer.render();
					// Update the edge display name in properties panel if needed
					if (this.currentType === 'edge') {
						const edge = this.graph.getEdge(this.currentSelection);
						if (edge && window.app) {
							window.app.updateStatus(`Updated relationship: ${newValue || '(none)'}`);
						}
					}
				}
			});
		}

        // Directed checkbox
        const directedCheckbox = document.getElementById('prop-directed');
        if (directedCheckbox) {
            directedCheckbox.addEventListener('change', (e) => {
                this.updateProperty('directed', e.target.checked);
            });
        }

		// Link buttons (open/copy)
        const linkActionBtns = document.querySelectorAll('.btn-link-action');
        linkActionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const linkField = e.target.dataset.link;
                const action = e.target.dataset.action;
                this.handleLinkAction(linkField, action);
            });
        });

        // Image preview handlers
        this.loadImageThumbnails();
        
        const previewBtns = document.querySelectorAll('.btn-preview-image');
        previewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const imageId = e.target.dataset.imageId;
                this.previewFullImage(imageId);
            });
        });
		
		// Image thumbnail click handlers (show full preview)
		const thumbnails = document.querySelectorAll('.image-thumbnail');
		thumbnails.forEach(img => {
			img.style.cursor = 'pointer';
			img.addEventListener('click', async (e) => {
				const imageId = e.target.dataset.imageId;
				if (imageId && window.app && window.app.imageManager) {
					const dataUrl = await window.app.imageManager.getImage(imageId);
					if (dataUrl) {
						this.showImageModal(dataUrl);
					}
				}
			});
		});

        // Custom properties
        const customProps = document.querySelectorAll('.custom-property-value');
		
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
                }
            });
        });

        // Remove property buttons
        const removeButtons = document.querySelectorAll('.btn-remove-property');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const propertyDiv = e.target.closest('.custom-property');
                const key = propertyDiv.dataset.key;
                if (confirm(`Remove property "${key}"?`)) {
                    this.removeProperty(key);
                }
            });
        });

        // Add custom property button
        const addPropertyBtn = document.getElementById('btn-add-custom-property');
        if (addPropertyBtn) {
            addPropertyBtn.addEventListener('click', () => {
                this.addCustomProperty();
            });
        }

        // Delete node button
        const deleteNodeBtn = document.getElementById('btn-delete-node');
        if (deleteNodeBtn) {
            deleteNodeBtn.addEventListener('click', () => {
                this.deleteSelectedNode();
            });
        }

        // Delete edge button
        const deleteEdgeBtn = document.getElementById('btn-delete-edge');
        if (deleteEdgeBtn) {
            deleteEdgeBtn.addEventListener('click', () => {
                this.deleteSelectedEdge();
            });
        }

        // Reverse edge button
        const reverseEdgeBtn = document.getElementById('btn-reverse-edge');
        if (reverseEdgeBtn) {
            reverseEdgeBtn.addEventListener('click', () => {
                this.reverseEdgeDirection();
            });
        }

        // Break edge button
        const breakEdgeBtn = document.getElementById('btn-break-edge');
        if (breakEdgeBtn) {
            breakEdgeBtn.addEventListener('click', () => {
                this.breakEdgeWithNodes();
            });
        }

        // Connect to node button
        const connectBtn = document.getElementById('btn-connect-to-node');
        if (connectBtn) {
            connectBtn.addEventListener('click', () => {
                this.showConnectToNodeModal(this.currentSelection);
            });
        }

        // Connection action buttons
        const viewDetailsButtons = document.querySelectorAll('.btn-view-edge-details');
        viewDetailsButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const connectionItem = e.target.closest('.connection-item');
                const edgeId = connectionItem.dataset.edgeId;
                this.showEdgeProperties(edgeId);
            });
        });

        const deleteConnectionButtons = document.querySelectorAll('.btn-delete-connection');
        deleteConnectionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const connectionItem = e.target.closest('.connection-item');
                const edgeId = connectionItem.dataset.edgeId;
                if (confirm('Delete this connection?')) {
                    this.graph.removeEdge(edgeId);
                    this.showNodeProperties(this.currentSelection);
                    this.renderer.render();
                    if (window.app) {
                        window.app.saveState();
                        window.app.updateStatus('Connection deleted');
                    }
                }
            });
        });

        const toggleInlineEditButtons = document.querySelectorAll('.btn-toggle-inline-edit');
        toggleInlineEditButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const connectionItem = e.target.closest('.connection-item');
                const edgeId = connectionItem.dataset.edgeId;
                const otherNodeId = connectionItem.dataset.nodeId;
                this.toggleConnectionInlineEdit(edgeId, otherNodeId);
            });
        });
    }
	
	/**
     * Handle link action (open or copy)
     */
    async handleLinkAction(linkField, action) {
        let node;
        if (this.currentType === 'node') {
            node = this.graph.getNode(this.currentSelection);
        }
        
        if (!node) return;
        
        const linkValue = node[linkField];
        if (!linkValue) return;

        // ADD THIS: Handle image links
        if (linkValue.startsWith('image://')) {
            const imageId = linkValue.replace('image://', '');
            await this.previewFullImage(imageId);
            return;
        }

        // Existing code for regular links continues...
        if (action === 'open') {
            this.openLink(linkField);
        }
	}
	
	
    /**
	 * NEW: Open link in new window (with security validation)
	 */
	openLink(linkKey) {
		const input = document.getElementById(`prop-${linkKey}`);
		if (!input) return;

		const link = input.value.trim();
		if (!link) {
			alert('No link to open');
			return;
		}

		// Security validation: Block dangerous protocols
		const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
		const lowerLink = link.toLowerCase();
		
		for (const protocol of dangerousProtocols) {
			if (lowerLink.startsWith(protocol)) {
				alert(`Security Error: "${protocol}" URLs are not allowed for safety reasons.\n\nPlease use http://, https://, or file paths only.`);
				return;
			}
		}

		// Allow http, https, and relative paths
		try {
			// Open in new window/tab
			window.open(link, '_blank', 'noopener,noreferrer');
		} catch (error) {
			alert(`Could not open link: ${error.message}`);
		}
	}
	
	/**
	 * Validate URL for security (blocks dangerous protocols)
	 * @param {string} url - URL to validate
	 * @returns {Object} {valid: boolean, error: string}
	 */
	validateUrl(url) {
		if (!url || url.trim() === '') {
			return { valid: true, error: '' }; // Empty is OK
		}

		const trimmedUrl = url.trim();
		const lowerUrl = trimmedUrl.toLowerCase();

		// Security: Block dangerous protocols
		const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'about:'];
		
		for (const protocol of dangerousProtocols) {
			if (lowerUrl.startsWith(protocol)) {
				return {
					valid: false,
					error: `Security Error: "${protocol}" URLs are not allowed.\n\nAllowed: http://, https://, or file paths (e.g., /docs/file.pdf)`
				};
			}
		}

		// Additional check: detect encoded attempts to bypass
		if (lowerUrl.includes('%6a%61%76%61%73%63%72%69%70%74') || // javascript
			lowerUrl.includes('%64%61%74%61') || // data
			lowerUrl.includes('&#106;&#97;&#118;&#97;')) { // HTML entity encoded javascript
			return {
				valid: false,
				error: 'Security Error: Encoded dangerous protocols are not allowed.'
			};
		}

		return { valid: true, error: '' };
	}

    /**
     * Rename a node
     */
    async renameNode(newName) {
        if (!newName) return;

        const oldId = this.currentSelection;
        
        try {
            await this.graph.renameNode(oldId, newName);
            
            this.currentSelection = await Utils.generateSHA256(newName);
            this.showNodeProperties(this.currentSelection);
            this.renderer.render();
            
            if (window.app) {
                window.app.saveState();
                window.app.updateStatus(`Renamed node to: ${newName}`);
            }
        } catch (error) {
            alert(error.message);
        }
    }

    /**
     * Rename an edge
     */
    async renameEdge(newName) {
        if (!newName) return;

        const oldId = this.currentSelection;
        
        try {
            await this.graph.renameEdge(oldId, newName);
            
            this.currentSelection = await Utils.generateSHA256(newName);
            this.showEdgeProperties(this.currentSelection);
            this.renderer.render();
            
            if (window.app) {
                window.app.saveState();
                window.app.updateStatus(`Renamed edge to: ${newName}`);
            }
        } catch (error) {
            alert(error.message);
        }
    }

    /**
     * Update a property
     */
    updateProperty(key, value) {
        if (this.currentType === 'node') {
            const node = this.graph.getNode(this.currentSelection);
            if (!node) return;
            node[key] = value;
            node.modifiedDate = new Date().toISOString();
			// NEW: Remember color/icon for next node
			if (window.app) {
				if (key === 'color') {
					window.app.lastNodeColor = value;
				} else if (key === 'icon') {
					window.app.lastNodeIcon = value;
				}
			}
        } else if (this.currentType === 'edge') {
            const edge = this.graph.getEdge(this.currentSelection);
            if (!edge) return;
            edge[key] = value;
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
            delete node[oldKey];
            node[newKey] = value;
            node.modifiedDate = new Date().toISOString();
        } else if (this.currentType === 'edge') {
            const edge = this.graph.getEdge(this.currentSelection);
            if (!edge) return;
            delete edge[oldKey];
            edge[newKey] = value;
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
            delete node[key];
            node.modifiedDate = new Date().toISOString();
            this.showNodeProperties(this.currentSelection);
        } else if (this.currentType === 'edge') {
            const edge = this.graph.getEdge(this.currentSelection);
            if (!edge) return;
            delete edge[key];
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

        if (this.currentType === 'node') {
            const node = this.graph.getNode(this.currentSelection);
            if (!node) return;
            node[key] = value || '';
            node.modifiedDate = new Date().toISOString();
            this.showNodeProperties(this.currentSelection);
        } else if (this.currentType === 'edge') {
            const edge = this.graph.getEdge(this.currentSelection);
            if (!edge) return;
            edge[key] = value || '';
            this.showEdgeProperties(this.currentSelection);
        }

        this.graph.updateModifiedDate();
        this.renderer.render();
        
        if (window.app) {
            window.app.saveState();
        }
    }

    /**
     * Delete selected node
     */
    deleteSelectedNode() {
        if (!confirm('Delete this node and all its connections?')) return;

        this.graph.removeNode(this.currentSelection);
        this.hide();
        this.renderer.clearSelection();
        this.renderer.render();
        
        if (window.app) {
            window.app.saveState();
            window.app.updateStats();
            window.app.updateStatus('Node deleted');
        }
    }

    /**
     * Delete selected edge
     */
    deleteSelectedEdge() {
        if (!confirm('Delete this edge?')) return;

        this.graph.removeEdge(this.currentSelection);
        this.hide();
        this.renderer.clearSelection();
        this.renderer.render();
        
        if (window.app) {
            window.app.saveState();
            window.app.updateStats();
            window.app.updateStatus('Edge deleted');
        }
    }

    /**
     * Reverse edge direction
     */
    reverseEdgeDirection() {
        const edge = this.graph.getEdge(this.currentSelection);
        if (!edge) return;

        const tempSource = edge.source;
        edge.source = edge.target;
        edge.target = tempSource;

        this.showEdgeProperties(this.currentSelection);
        this.renderer.render();

        if (window.app) {
            window.app.saveState();
            window.app.updateStatus('Reversed edge direction');
        }
    }

    /**
     * Break edge with intermediate node
     */
    async breakEdgeWithNodes() {
        const edge = this.graph.getEdge(this.currentSelection);
        if (!edge) return;

        const sourceNode = typeof edge.source === 'object' ? edge.source : this.graph.getNode(edge.source);
        const targetNode = typeof edge.target === 'object' ? edge.target : this.graph.getNode(edge.target);

        if (!sourceNode || !targetNode) {
            alert('Cannot break edge with free ends');
            return;
        }

        const x = (sourceNode.x + targetNode.x) / 2;
        const y = (sourceNode.y + targetNode.y) / 2;

        const result = await this.graph.breakEdgeWithNode(this.currentSelection, x, y);

        if (result) {
            this.hide();
            this.renderer.render();

            if (window.app) {
                window.app.saveState();
                window.app.updateStats();
                window.app.updateStatus('Edge broken into 2 pieces');
            }
        }
    }

    /**
     * Toggle inline editing for connection
     */
    toggleConnectionInlineEdit(edgeId, otherNodeId) {
        const connectionItem = document.querySelector(`.connection-item[data-edge-id="${edgeId}"]`);
        if (!connectionItem) return;

        const existingEdit = connectionItem.querySelector('.connection-inline-edit');
        if (existingEdit) {
            existingEdit.remove();
            this.pendingInlineEdit = null;
            return;
        }

        const edge = this.graph.getEdge(edgeId);
        if (!edge) return;

        const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
        const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
        const isSource = sourceId === this.currentSelection;
        const currentEnd = isSource ? 'target' : 'source';
        const currentDirection = isSource ? '→' : '←';

        const allNodeIds = this.graph.getAllNodeIds();
        const allRelationships = this.graph.getAllEdgeRelationships();

        const inlineEditDiv = document.createElement('div');
        inlineEditDiv.className = 'connection-inline-edit';
        inlineEditDiv.innerHTML = `
            <div class="inline-edit-controls">
                <div class="inline-edit-row">
                    <label class="inline-edit-label">Node:</label>
                    <select class="inline-edit-select" data-field="node">
                        <option value="">(Free End)</option>
                        ${allNodeIds.map(id => {
                            const node = this.graph.getNode(id);
                            const displayName = node ? (node.name || id) : id;
                            return `<option value="${Utils.sanitizeHtml(id)}" ${id === otherNodeId ? 'selected' : ''}>${Utils.sanitizeHtml(displayName)}</option>`;
                        }).join('')}
                    </select>
                </div>
                <div class="inline-edit-row">
                    <label class="inline-edit-label">Direction:</label>
                    <select class="inline-edit-select" data-field="direction">
                        <option value="→" ${currentDirection === '→' ? 'selected' : ''}>→ (current node to target)</option>
                        <option value="←" ${currentDirection === '←' ? 'selected' : ''}>← (source to current node)</option>
                    </select>
                </div>
                <div class="inline-edit-row">
                    <label class="inline-edit-label">Relationship:</label>
                    <input type="text" class="inline-edit-input" data-field="relationship" 
                           value="${Utils.sanitizeHtml(edge.relationship || '')}" 
                           list="inline-relationships-${edgeId}" 
                           placeholder="Optional">
                    <datalist id="inline-relationships-${edgeId}">
                        ${allRelationships.map(rel => `<option value="${Utils.sanitizeHtml(rel)}">`).join('')}
                    </datalist>
                </div>
                <div class="inline-edit-actions">
                    <button class="btn-inline-save" data-edge-id="${Utils.sanitizeHtml(edgeId)}">
                        ✓ Save
                    </button>
                    <button class="btn-inline-cancel">
                        ✕ Cancel
                    </button>
                </div>
            </div>
        `;

        connectionItem.appendChild(inlineEditDiv);

        this.pendingInlineEdit = {
            edgeId: edgeId,
            currentEnd: currentEnd,
            connectionItem: connectionItem
        };

        const saveBtn = inlineEditDiv.querySelector('.btn-inline-save');
        const cancelBtn = inlineEditDiv.querySelector('.btn-inline-cancel');

        saveBtn.addEventListener('click', () => {
            this.saveConnectionInlineEdit(inlineEditDiv);
        });

        cancelBtn.addEventListener('click', () => {
            this.cancelConnectionInlineEdit(inlineEditDiv);
        });
    }

    /**
     * Save connection inline edit
     */
    saveConnectionInlineEdit(inlineEditDiv) {
        if (!this.pendingInlineEdit) return;

        const { edgeId, currentEnd, connectionItem } = this.pendingInlineEdit;
        const edge = this.graph.getEdge(edgeId);
        if (!edge) return;

        const nodeSelect = inlineEditDiv.querySelector('[data-field="node"]');
        const directionSelect = inlineEditDiv.querySelector('[data-field="direction"]');
        const relationshipInput = inlineEditDiv.querySelector('[data-field="relationship"]');

        const newNodeId = nodeSelect.value;
        const newDirection = directionSelect.value;
        const newRelationship = relationshipInput.value.trim();

        const currentSourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
        const currentTargetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
        const isCurrentlySource = currentSourceId === this.currentSelection;

        let needsDirectionSwap = false;
        if (isCurrentlySource && newDirection === '←') {
            needsDirectionSwap = true;
        } else if (!isCurrentlySource && newDirection === '→') {
            needsDirectionSwap = true;
        }

        if (needsDirectionSwap) {
            const tempSource = edge.source;
            edge.source = edge.target;
            edge.target = tempSource;
        }

        const endToChange = (newDirection === '→') ? 'target' : 'source';
        if (newNodeId === '') {
            const node = this.graph.getNode(this.currentSelection);
            if (node) {
                this.graph.breakEdge(edgeId, endToChange, node.x + 50, node.y);
            }
        } else {
            this.graph.changeEdgeEndpoint(edgeId, endToChange, newNodeId);
        }

        if (newRelationship !== edge.relationship) {
            edge.relationship = newRelationship;
        }

        inlineEditDiv.remove();
        this.pendingInlineEdit = null;

        this.renderer.render();
        this.showNodeProperties(this.currentSelection);

        if (window.app) {
            window.app.saveState();
            window.app.updateStatus(`Updated connection`);
        }
    }

    /**
     * Cancel connection inline edit
     */
    cancelConnectionInlineEdit(inlineEditDiv) {
        inlineEditDiv.remove();
        this.pendingInlineEdit = null;
    }

    /**
	 * Show modal dialog to connect current node to another node
	 */
	showConnectToNodeModal(fromNodeId) {
		const allNodeIds = this.graph.getAllNodeIds().filter(id => id !== fromNodeId);
		
		if (allNodeIds.length === 0) {
			alert('No other nodes available to connect to.');
			return;
		}

		// Create modal
		const modal = document.createElement('div');
		modal.className = 'modal-overlay';
		modal.innerHTML = `
			<div class="modal-content">
				<h3>Connect to Node</h3>
				<div class="form-group">
					<label>Target Node:</label>
					<select id="connect-target-node" class="property-input">
						${allNodeIds.map(id => {
							const node = this.graph.getNode(id);
							const displayName = node ? (node.name || id) : id;
							return `<option value="${Utils.sanitizeHtml(id)}">${Utils.sanitizeHtml(displayName)}</option>`;
						}).join('')}
					</select>
				</div>
				<div class="form-group">
					<label>Direction:</label>
					<div class="direction-radio-group">
						<label class="radio-option">
							<input type="radio" name="connection-direction" value="outgoing" checked>
							<span>→ Outgoing (from this node)</span>
						</label>
						<label class="radio-option">
							<input type="radio" name="connection-direction" value="incoming">
							<span>← Incoming (to this node)</span>
						</label>
					</div>
				</div>
				<div class="form-group">
					<label>Relationship (optional):</label>
					<input type="text" id="connect-relationship" class="property-input" placeholder="e.g., depends on, leads to, part of...">
				</div>
				<div class="modal-actions">
					<button class="btn-primary" id="btn-confirm-connect">Connect</button>
					<button class="btn-secondary" id="btn-cancel-connect">Cancel</button>
				</div>
			</div>
		`;

		document.body.appendChild(modal);

		const confirmBtn = modal.querySelector('#btn-confirm-connect');
		const cancelBtn = modal.querySelector('#btn-cancel-connect');
		const targetSelect = modal.querySelector('#connect-target-node');
		const relationshipInput = modal.querySelector('#connect-relationship');

		confirmBtn.addEventListener('click', async () => {
			const targetId = targetSelect.value;
			const directionRadio = modal.querySelector('input[name="connection-direction"]:checked');
			const direction = directionRadio ? directionRadio.value : 'outgoing';
			const relationship = relationshipInput.value.trim();
			
			if (targetId) {
				const timestamp = Date.now();
				const edgeName = `edge_${timestamp}`;
				
				// Determine source and target based on direction
				let sourceId, targetNodeId;
				if (direction === 'outgoing') {
					// → : From current node to selected node
					sourceId = fromNodeId;
					targetNodeId = targetId;
				} else {
					// ← : From selected node to current node
					sourceId = targetId;
					targetNodeId = fromNodeId;
				}
				
				// Create edge object with optional relationship
				const edgeData = {
					name: edgeName,
					source: sourceId,
					target: targetNodeId,
					directed: true
				};
				
				// Add relationship if provided
				if (relationship) {
					edgeData.relationship = relationship;
				}
				
				await this.graph.addEdge(edgeData);

				this.renderer.render();
				this.showNodeProperties(fromNodeId);

				if (window.app) {
					window.app.saveState();
					window.app.updateStats();
					window.app.updateStatus('Connected nodes');
				}
			}
			document.body.removeChild(modal);
		});

		cancelBtn.addEventListener('click', () => {
			document.body.removeChild(modal);
		});

		modal.addEventListener('click', (e) => {
			if (e.target === modal) {
				document.body.removeChild(modal);
			}
		});
	}
	
	/**
	 * Show comprehensive icon picker modal
	 */
	showIconPickerModal() {
		const modal = document.createElement('div');
		modal.className = 'modal-overlay';
		modal.innerHTML = `
			<div class="modal-content icon-picker-modal">
				<div class="modal-header">
					<h3>Choose an Icon</h3>
					<button class="modal-close">✕</button>
				</div>
				<div class="modal-body">
					<div class="icon-picker-search">
						<input type="text" id="icon-search" class="property-input" placeholder="Search icons..." autocomplete="off">
					</div>
					
					<div class="icon-picker-categories">
						<button class="icon-category-btn active" data-category="common">Common</button>
						<button class="icon-category-btn" data-category="objects">Objects</button>
						<button class="icon-category-btn" data-category="symbols">Symbols</button>
						<button class="icon-category-btn" data-category="nature">Nature</button>
						<button class="icon-category-btn" data-category="travel">Travel</button>
						<button class="icon-category-btn" data-category="activities">Activities</button>
					</div>
					
					<div class="icon-picker-grid" id="icon-picker-grid">
						<!-- Will be populated dynamically -->
					</div>
				</div>
			</div>
		`;
		
		document.body.appendChild(modal);
		
		// Icon categories
		const iconCategories = {
			common: ['📊', '📁', '💡', '🔧', '⚙️', '📝', '🎯', '🔍', '🚀', '🏢', '👤', '📱', '💻', '🖥️', '⌨️', '🖱️', '🖨️', '📷', '📹', '📞', '☎️', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💾', '💿', '📀', '🎮', '🕹️', '🎰'],
			objects: ['📦', '📫', '📪', '📬', '📭', '📮', '🗳️', '✏️', '✒️', '🖊️', '🖋️', '🖍️', '📐', '📏', '📌', '📍', '✂️', '🗃️', '🗄️', '🗑️', '🔒', '🔓', '🔐', '🔑', '🗝️', '🔨', '⛏️', '⚒️', '🛠️', '🗡️', '⚔️', '🔫', '🏹', '🛡️', '🔧', '🔩', '⚙️', '🗜️', '⚖️', '🔗', '⛓️', '🧰', '🧲', '⚗️'],
			symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '⭐', '🌟', '✨', '⚡', '🔥', '💫', '💥', '💢', '💦', '💨', '🕳️', '💬', '👁️', '🗨️', '🗯️', '💭', '💤', '✔️', '✅', '✖️', '❌', '❎', '➕', '➖', '➗', '♾️'],
			nature: ['🌱', '🌿', '🍀', '🎋', '🎍', '🌾', '🌵', '🌴', '🌳', '🌲', '🌰', '🎃', '🍄', '🌹', '🌺', '🌻', '🌼', '🌷', '🌸', '💐', '🏵️', '🥀', '☘️', '🌊', '💧', '💦', '🌈', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '🌪️', '🌫️', '☔'],
			travel: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🚁'],
			activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '⛳', '🏹', '🎣', '🥊', '🥋', '🎽', '⛸️', '🥌', '🛷', '🎿', '⛷️', '🏂', '🏋️', '🤼', '🤸', '🤺', '⛹️', '🤾', '🏌️', '🏇', '🧘', '🏊', '🤽', '🚣', '🧗', '🚴', '🚵', '🎪']
		};
		
		const grid = document.getElementById('icon-picker-grid');
		const searchInput = document.getElementById('icon-search');
		const categoryBtns = modal.querySelectorAll('.icon-category-btn');
		
		// Function to render icons
		const renderIcons = (icons) => {
			grid.innerHTML = icons.map(icon => `
				<button class="icon-picker-item" data-icon="${icon}" title="${icon}">
					${icon}
				</button>
			`).join('');
			
			// Attach click handlers
			grid.querySelectorAll('.icon-picker-item').forEach(btn => {
				btn.addEventListener('click', () => {
					const selectedIcon = btn.dataset.icon;
					this.updateProperty('icon', selectedIcon);
					document.getElementById('prop-icon').value = selectedIcon;
					
					// Update palette selection
					document.querySelectorAll('.icon-swatch').forEach(swatch => {
						swatch.classList.toggle('active', swatch.dataset.icon === selectedIcon);
					});
					
					document.body.removeChild(modal);
				});
			});
		};
		
		// Initial render - common category
		renderIcons(iconCategories.common);
		
		// Category switching
		categoryBtns.forEach(btn => {
			btn.addEventListener('click', () => {
				categoryBtns.forEach(b => b.classList.remove('active'));
				btn.classList.add('active');
				
				const category = btn.dataset.category;
				renderIcons(iconCategories[category]);
				searchInput.value = '';
			});
		});
		
		// Search functionality
		searchInput.addEventListener('input', (e) => {
			const query = e.target.value.toLowerCase().trim();
			
			if (!query) {
				// Show current category
				const activeCategory = modal.querySelector('.icon-category-btn.active').dataset.category;
				renderIcons(iconCategories[activeCategory]);
				return;
			}
			
			// Search across all categories
			const allIcons = Object.values(iconCategories).flat();
			const filtered = allIcons.filter(icon => {
				// You could add emoji names here for better search
				return icon.includes(query);
			});
			
			renderIcons(filtered.length > 0 ? filtered : ['❌ No results']);
		});
		
		// Close modal
		const closeBtn = modal.querySelector('.modal-close');
		closeBtn.addEventListener('click', () => {
			document.body.removeChild(modal);
		});
		
		modal.addEventListener('click', (e) => {
			if (e.target === modal) {
				document.body.removeChild(modal);
			}
		});
	}
	
	/**
     * Load image thumbnails
     */
    async loadImageThumbnails() {
        const thumbnails = document.querySelectorAll('.image-thumbnail');
        
        for (const thumbnail of thumbnails) {
            const imageId = thumbnail.dataset.imageId;
            try {
                const dataUrl = await window.app.imageManager.getImage(imageId);
                if (dataUrl) {
                    thumbnail.src = dataUrl;
                    thumbnail.alt = 'Image preview';
                } else {
                    thumbnail.alt = 'Image not found';
                    thumbnail.style.display = 'none';
                }
            } catch (error) {
                console.error('Error loading thumbnail:', error);
                thumbnail.alt = 'Error loading image';
            }
        }
    }

    /**
     * Preview full size image
     */
    async previewFullImage(imageId) {
        try {
            const dataUrl = await window.app.imageManager.getImage(imageId);
            if (dataUrl) {
                // Open in new tab
                const newTab = window.open();
                newTab.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Image Preview</title>
                        <style>
                            body { margin: 0; display: flex; justify-content: center; align-items: center; 
                                   min-height: 100vh; background: #2c3e50; }
                            img { max-width: 95%; max-height: 95vh; box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
                        </style>
                    </head>
                    <body>
                        <img src="${dataUrl}" alt="Full size preview">
                    </body>
                    </html>
                `);
            } else {
                alert('Image not found');
            }
        } catch (error) {
            console.error('Error previewing image:', error);
            alert('Error loading image');
        }
    }
	
	
	/**
	 * Show image in modal popup
	 */
	showImageModal(dataUrl) {
		// Create modal overlay
		const modal = document.createElement('div');
		modal.className = 'image-modal-overlay';
		modal.innerHTML = `
			<div class="image-modal-content">
				<button class="image-modal-close">✕</button>
				<img src="${dataUrl}" alt="Full size preview">
			</div>
		`;
		
		document.body.appendChild(modal);
		
		// Close button handler
		const closeBtn = modal.querySelector('.image-modal-close');
		closeBtn.addEventListener('click', () => {
			modal.remove();
		});
		
		// Click outside to close
		modal.addEventListener('click', (e) => {
			if (e.target === modal) {
				modal.remove();
			}
		});
		
		// Escape key to close
		const escapeHandler = (e) => {
			if (e.key === 'Escape') {
				modal.remove();
				document.removeEventListener('keydown', escapeHandler);
			}
		};
		document.addEventListener('keydown', escapeHandler);
	}
}

// Export for use in other modules
window.PropertiesPanel = PropertiesPanel;