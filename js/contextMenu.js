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

        // FIXED: Attach event listeners using data-action attribute instead of forEach index
        this.menu.querySelectorAll('.context-menu-item').forEach((button) => {
            if (!button.classList.contains('disabled')) {
                button.addEventListener('click', () => {
                    // Get the actual index from data-action attribute
                    const actionIndex = parseInt(button.getAttribute('data-action'));
                    const menuItem = items[actionIndex];
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
     * Toggle pin position
     */
    togglePin(node) {
        if (node.fx !== null && node.fy !== null) {
            this.app.renderer.unpinNode(node.id);
            this.app.updateStatus(`Unpinned: ${node.id}`);
        } else {
            this.app.renderer.pinNode(node.id);
            this.app.updateStatus(`Pinned: ${node.id}`);
        }
    }

    /**
     * Start connecting from a node
     */
    startConnectFrom(node) {
        this.app.propertiesPanel.showConnectToNodeModal(node.id);
    }

    /**
     * Delete node
     */
    deleteNode(node) {
        if (!Utils.confirm(`Delete node "${node.name || node.id}"?`)) return;

        this.app.graph.removeNode(node.id);
        this.app.renderer.clearSelection();
        this.app.propertiesPanel.hide();
        this.app.renderer.render();
        this.app.updateStats();
        this.app.saveState();
        this.app.updateStatus(`Deleted node: ${node.name || node.id}`);
    }

    /**
     * Reverse edge direction
     */
    reverseEdge(edge) {
        const graphEdge = this.app.graph.getEdge(edge.id);
        if (!graphEdge) return;

        // Swap source and target
        const temp = graphEdge.source;
        graphEdge.source = graphEdge.target;
        graphEdge.target = temp;

        // Also swap any half-edge coordinates
        if (graphEdge.sourceX !== undefined || graphEdge.targetX !== undefined) {
            const tempX = graphEdge.sourceX;
            const tempY = graphEdge.sourceY;
            graphEdge.sourceX = graphEdge.targetX;
            graphEdge.sourceY = graphEdge.targetY;
            graphEdge.targetX = tempX;
            graphEdge.targetY = tempY;
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
		const rect = svgElement.getBoundingClientRect();
		
		// Convert click position to SVG coordinates
		const transform = this.app.renderer.currentTransform;
		const x = (event.clientX - rect.left - transform.x) / transform.k;
		const y = (event.clientY - rect.top - transform.y) / transform.k;

		this.app.addNode(x, y);
	}
}

// Export
window.ContextMenuManager = ContextMenuManager;