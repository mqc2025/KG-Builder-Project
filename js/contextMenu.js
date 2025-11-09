// Context Menu Manager (Feature 12)

class ContextMenuManager {
    constructor(app) {
        this.app = app;
        this.menu = document.getElementById('context-menu');
        this.currentTarget = null;
        this.currentTargetType = null; // 'node', 'edge', or 'canvas'
        
        this.setupEventListeners();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Close menu on click outside
        document.addEventListener('click', () => {
            this.hide();
        });

        // Close menu on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hide();
            }
        });

        // Prevent menu from closing when clicking inside it
        this.menu?.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    /**
     * Show node context menu
     */
    showNodeMenu(node, event) {
        this.currentTarget = node;
        this.currentTargetType = 'node';

        const menuItems = [
            {
                icon: '✎',
                label: 'Edit Properties',
                action: () => this.app.propertiesPanel.showNodeProperties(node.id)
            },
            {
                icon: '🎨',
                label: 'Change Color',
                submenu: this.getColorSubmenu(node)
            },
            {
                icon: '📌',
                label: node.fx ? 'Unpin Position' : 'Pin Position',
                action: () => this.togglePin(node)
            },
            {
                icon: '→',
                label: 'Connect To...',
                action: () => this.startConnectFrom(node)
            },
            { separator: true },
            {
                icon: '📋',
                label: 'Duplicate Node',
                action: () => this.duplicateNode(node)
            },
            {
                icon: '⊗',
                label: 'Merge with...',
                action: () => this.startMergeNode(node)
            },
            { separator: true },
            {
                icon: '🗑️',
                label: 'Delete Node',
                className: 'danger',
                action: () => this.deleteNode(node)
            }
        ];

        this.show(menuItems, event.pageX, event.pageY);
    }

    /**
     * Show edge context menu
     */
    showEdgeMenu(edge, event) {
        this.currentTarget = edge;
        this.currentTargetType = 'edge';

        const menuItems = [
            {
                icon: '✎',
                label: 'Edit Properties',
                action: () => this.app.propertiesPanel.showEdgeProperties(edge.id)
            },
            {
                icon: '↔️',
                label: 'Reverse Direction',
                action: () => this.reverseEdge(edge)
            },
            {
                icon: '✂️',
                label: 'Break at Source',
                action: () => this.app.renderer.breakEdgeAtSource(edge),
                disabled: !edge.source
            },
            {
                icon: '✂️',
                label: 'Break at Target',
                action: () => this.app.renderer.breakEdgeAtTarget(edge),
                disabled: !edge.target
            },
            { separator: true },
            {
                icon: '🗑️',
                label: 'Delete Edge',
                className: 'danger',
                action: () => this.deleteEdge(edge)
            }
        ];

        this.show(menuItems, event.pageX, event.pageY);
    }

    /**
     * Show canvas context menu
     */
    showCanvasMenu(event) {
        this.currentTarget = null;
        this.currentTargetType = 'canvas';

        const menuItems = [
            {
                icon: '⊕',
                label: 'Add Node Here',
                action: () => this.addNodeAtPosition(event)
            },
            { separator: true },
            {
                icon: '◯',
                label: 'Select All',
                action: () => this.selectAll()
            },
            {
                icon: '⊞',
                label: 'Fit to View',
                action: () => this.app.renderer.fitToView()
            },
            {
                icon: '↻',
                label: 'Reset Zoom',
                action: () => this.app.renderer.resetZoom()
            },
            { separator: true },
            {
                icon: '❄️',
                label: this.app.renderer.isFrozen ? 'Unfreeze Simulation' : 'Freeze Simulation',
                action: () => this.app.toggleFreeze()
            }
        ];

        this.show(menuItems, event.pageX, event.pageY);
    }

    /**
     * Show context menu
     */
    show(items, x, y) {
        if (!this.menu) return;

        // Build menu HTML
        const html = items.map(item => {
            if (item.separator) {
                return '<div class="context-menu-separator"></div>';
            }

            const disabled = item.disabled ? 'disabled' : '';
            const className = item.className || '';

            return `
                <button class="context-menu-item ${disabled} ${className}" data-action="${items.indexOf(item)}">
                    <span class="context-menu-icon">${item.icon}</span>
                    <span class="context-menu-label">${item.label}</span>
                    ${item.submenu ? '<span class="context-menu-arrow">▶</span>' : ''}
                </button>
            `;
        }).join('');

        this.menu.innerHTML = html;

        // Position menu
        this.menu.style.left = `${x}px`;
        this.menu.style.top = `${y}px`;

        // Show menu
        this.menu.classList.remove('hidden');

        // Attach event listeners
        this.menu.querySelectorAll('.context-menu-item').forEach((item, index) => {
            if (!item.classList.contains('disabled')) {
                item.addEventListener('click', () => {
                    const menuItem = items[index];
                    if (menuItem && menuItem.action) {
                        menuItem.action();
                        this.hide();
                    }
                });
            }
        });

        // Adjust position if menu goes off-screen
        setTimeout(() => {
            const rect = this.menu.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
                this.menu.style.left = `${x - rect.width}px`;
            }
            if (rect.bottom > window.innerHeight) {
                this.menu.style.top = `${y - rect.height}px`;
            }
        }, 0);
    }

    /**
     * Hide context menu
     */
    hide() {
        this.menu?.classList.add('hidden');
        this.currentTarget = null;
        this.currentTargetType = null;
    }

    /**
     * Get color submenu items (Feature 8)
     */
    getColorSubmenu(node) {
        const colors = [
            { color: '#3498db', name: 'Blue' },
            { color: '#2ecc71', name: 'Green' },
            { color: '#e74c3c', name: 'Red' },
            { color: '#f39c12', name: 'Orange' },
            { color: '#9b59b6', name: 'Purple' },
            { color: '#1abc9c', name: 'Teal' },
            { color: '#34495e', name: 'Dark Gray' },
            { color: '#95a5a6', name: 'Light Gray' }
        ];

        return colors.map(c => ({
            icon: '●',
            label: c.name,
            action: () => this.changeNodeColor(node, c.color)
        }));
    }

    /**
     * Toggle pin position
     */
    togglePin(node) {
        if (node.fx !== null && node.fy !== null) {
            // Unpin
            this.app.renderer.unpinNode(node.id);
            this.app.updateStatus(`Unpinned: ${node.id}`);
        } else {
            // Pin
            node.fx = node.x;
            node.fy = node.y;
            this.app.updateStatus(`Pinned: ${node.id}`);
        }
        this.app.saveState();
    }

    /**
     * Change node color (Feature 8)
     */
    changeNodeColor(node, color) {
        this.app.graph.updateNode(node.id, { color });
        this.app.renderer.render();
        this.app.saveState();
        this.app.updateStatus(`Changed color: ${node.id}`);
    }

    /**
     * Start connection from node - Shows modal dialog
     */
    startConnectFrom(node) {
        // Open the properties panel for the node first to set context
        this.app.propertiesPanel.showNodeProperties(node.id);
        
        // Then show the connect modal dialog
        this.app.propertiesPanel.showConnectToNodeModal(node.id);
        
        this.app.updateStatus(`Select node to connect to ${node.id}`);
    }

    /**
     * Duplicate node
     */
    duplicateNode(node) {
        const newId = prompt('Enter ID for duplicated node:', `${node.id}_copy`);
        if (!newId) return;

        if (this.app.graph.getNode(newId)) {
            alert('A node with this ID already exists');
            return;
        }

        const newNode = this.app.graph.addNode({
            id: newId,
            ...node.properties
        });

        // Position near original
        newNode.x = node.x + 50;
        newNode.y = node.y + 50;
        newNode.fx = newNode.x;
        newNode.fy = newNode.y;

        this.app.renderer.render();
        this.app.updateStats();
        this.app.saveState();
        this.app.updateStatus(`Duplicated node: ${newId}`);
    }

    /**
     * Start merge node process (Feature 13)
     */
    startMergeNode(node) {
        this.app.setTool('select');
        this.app.mergingNode = node.id;
        this.app.renderer.selectNodes([node.id]);
        this.app.updateStatus(`Select second node to merge with ${node.id}`);
    }

    /**
     * Delete node
     */
    deleteNode(node) {
        if (!Utils.confirm(`Delete node "${node.id}" and all connected edges?`)) return;

        this.app.graph.removeNode(node.id);
        this.app.renderer.clearSelection();
        this.app.propertiesPanel.hide();
        this.app.renderer.render();
        this.app.updateStats();
        this.app.saveState();
        this.app.updateStatus(`Deleted node: ${node.id}`);
    }

    /**
     * Reverse edge direction
     */
    reverseEdge(edge) {
        const temp = edge.source;
        edge.source = edge.target;
        edge.target = temp;

        // Also swap any half-edge coordinates
        if (edge.sourceX !== undefined || edge.targetX !== undefined) {
            const tempX = edge.sourceX;
            const tempY = edge.sourceY;
            edge.sourceX = edge.targetX;
            edge.sourceY = edge.targetY;
            edge.targetX = tempX;
            edge.targetY = tempY;
        }

        this.app.renderer.render();
        this.app.saveState();
        this.app.updateStatus('Reversed edge direction');
    }

    /**
     * Delete edge
     */
    deleteEdge(edge) {
        if (!Utils.confirm(`Delete edge "${edge.id}"?`)) return;

        this.app.graph.removeEdge(edge.id);
        this.app.renderer.clearSelection();
        this.app.propertiesPanel.hide();
        this.app.renderer.render();
        this.app.updateStats();
        this.app.saveState();
        this.app.updateStatus(`Deleted edge: ${edge.id}`);
    }

    /**
     * Add node at position
     */
    addNodeAtPosition(event) {
        const svgElement = document.getElementById('graph-canvas');
        const pt = svgElement.createSVGPoint();
        pt.x = event.clientX;
        pt.y = event.clientY;

        const transform = this.app.renderer.currentTransform;
        const x = (pt.x - transform.x) / transform.k;
        const y = (pt.y - transform.y) / transform.k;

        this.app.addNode(x, y);
    }

    /**
     * Select all nodes
     */
    selectAll() {
        const allNodeIds = this.app.graph.nodes.map(n => n.id);
        this.app.renderer.selectNodes(allNodeIds);
        this.app.updateStatus(`Selected ${allNodeIds.length} nodes`);
    }
}

// Export
window.ContextMenuManager = ContextMenuManager;