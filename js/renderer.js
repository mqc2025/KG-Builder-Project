// Graph Renderer using D3.js

class Renderer {
    constructor(svgElement, graph) {
        this.svg = d3.select(svgElement);
        this.graph = graph;
        this.width = svgElement.clientWidth;
        this.height = svgElement.clientHeight;
        
        // Create main group for zooming/panning
        this.g = this.svg.append('g');
        
        // Create groups for edges and nodes (order matters for layering)
        this.edgeGroup = this.g.append('g').attr('class', 'edges');
        this.nodeGroup = this.g.append('g').attr('class', 'nodes');
        
        // Feature 3: Freeze state
        this.isFrozen = false;
		// Auto-freeze timer
		this.autoFreezeTimer = null;
		this.autoFreezeDelay = 10000; // 10 seconds
        
        // Initialize zoom behavior
        this.zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                this.g.attr('transform', event.transform);
                this.currentTransform = event.transform;
                this.updateZoomStatus();
                // Feature 9: Update font sizes relative to zoom
                this.updateFontSizes();
				this.updatePositions();
            })
            .filter(function(event) {
                // Disable zoom on double-click
                // Allow all other zoom interactions (wheel, pinch, drag)
                return event.type !== 'dblclick';
            });
        
        this.svg.call(this.zoom);
        this.currentTransform = d3.zoomIdentity;
        
        // Initialize force simulation
        this.simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id(d => d.id).distance(100).strength(0.5))
            .force('charge', d3.forceManyBody().strength(-200))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2).strength(0.1))
            .force('collision', d3.forceCollide().radius(30))
            .force('x', d3.forceX(this.width / 2).strength(0.05))
            .force('y', d3.forceY(this.height / 2).strength(0.05))
            .alphaDecay(0.02)
            .velocityDecay(0.4);
        
        // Feature 4: Add world boundary force
        this.updateBoundaryForce();
        
        // Event handlers
        this.onNodeClick = null;
        this.onEdgeClick = null;
        this.onCanvasClick = null;
        this.onNodeDragEnd = null;
        this.onNodeContextMenu = null;
        this.onEdgeContextMenu = null;
        this.onCanvasContextMenu = null;
		// Setup canvas event handlers immediately
		this.setupCanvasEventHandlers();
        
        // Selection tracking
        this.selectedNodes = new Set();
        this.selectedEdges = new Set();
        
        // Highlighted elements (for search/path)
        this.highlightedNodes = new Set();
        this.highlightedEdges = new Set();
        
        // Distance-based dimming state
        this.dimmedNodes = new Set();
        this.dimmedEdges = new Set();
        this.isDimmingActive = false;
		
		// Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }

	/**
	 * Feature 3: Freeze simulation
	 */
	freezeSimulation() {
		this.isFrozen = true;
		this.simulation.stop();
		this.clearAutoFreezeTimer();
		this.updateSimulationStatus();
		// Update minimap when frozen
		this.updateMinimap();
	}

	/**
	 * Feature 3: Unfreeze simulation
	 */
	unfreezeSimulation() {
		this.isFrozen = false;
		this.simulation.alpha(0.3).restart();
		this.startAutoFreezeTimer();
		this.updateSimulationStatus();
	}

    /**
     * Feature 3: Toggle freeze state
     */
    toggleFreeze() {
        if (this.isFrozen) {
            this.unfreezeSimulation();
        } else {
            this.freezeSimulation();
        }
    }

    /**
     * Feature 3: Update simulation status in UI
     */
    updateSimulationStatus() {
        const statusElem = document.getElementById('status-simulation');
        if (statusElem) {
            statusElem.textContent = `Simulation: ${this.isFrozen ? 'Frozen' : 'Active'}`;
        }
    }
	
	/**
	 * Start auto-freeze timer (10 seconds)
	 */
	startAutoFreezeTimer() {
		this.clearAutoFreezeTimer();
		this.autoFreezeTimer = setTimeout(() => {
			if (!this.isFrozen) {
				this.freezeSimulation();
				this.updateSimulationStatus();
				// Update freeze button UI if app exists
				if (window.app) {
					const freezeBtn = document.getElementById('btn-freeze');
					if (freezeBtn) {
						freezeBtn.classList.add('active');
						freezeBtn.title = 'Unfreeze Simulation (F)';
					}
					window.app.updateStatus('Simulation auto-frozen after 10 seconds');
				}
			}
		}, this.autoFreezeDelay);
	}

	/**
	 * Clear auto-freeze timer
	 */
	clearAutoFreezeTimer() {
		if (this.autoFreezeTimer) {
			clearTimeout(this.autoFreezeTimer);
			this.autoFreezeTimer = null;
		}
	}


    /**
     * Feature 4: Update world boundary force
     */
    updateBoundaryForce() {
        const boundary = this.graph.settings.worldBoundary;
        
        if (boundary.enabled) {
            this.simulation.force('boundary', alpha => {
                this.graph.nodes.forEach(node => {
                    if (node.x < boundary.minX) {
                        node.vx += (boundary.minX - node.x) * alpha * 0.1;
                    }
                    if (node.x > boundary.maxX) {
                        node.vx += (boundary.maxX - node.x) * alpha * 0.1;
                    }
                    if (node.y < boundary.minY) {
                        node.vy += (boundary.minY - node.y) * alpha * 0.1;
                    }
                    if (node.y > boundary.maxY) {
                        node.vy += (boundary.maxY - node.y) * alpha * 0.1;
                    }
                });
            });
        } else {
            this.simulation.force('boundary', null);
        }
    }
	/**
	 * Update force strength
	 * @param {number} strength - Charge force strength (negative value, e.g., -200)
	 */
	updateForceStrength(strength) {
		// Update charge force with new strength
		this.simulation.force('charge', d3.forceManyBody().strength(-strength));
		
		// Restart simulation if not frozen
		if (!this.isFrozen) {
			this.simulation.alpha(0.1).restart();
			this.startAutoFreezeTimer();
		}
	}

    /**
     * Feature 9: Update font sizes relative to zoom
     */
    updateFontSizes() {
        const scale = this.currentTransform.k;
        const nodeLabelSize = this.graph.settings.nodeLabelSize;
        const edgeLabelSize = this.graph.settings.edgeLabelSize;
        
        // Scale inversely so text stays readable at all zoom levels
        const nodeSize = nodeLabelSize / scale;
        const edgeSize = edgeLabelSize / scale;
        
        this.nodeGroup.selectAll('.node-label')
            .style('font-size', `${nodeSize}px`);
        
        this.edgeGroup.selectAll('.edge-label')
            .style('font-size', `${edgeSize}px`);
    }

    /**
     * Render the graph
     */
    render() {
        const nodes = this.graph.nodes;
        const edges = this.graph.edges;

        // Initialize node positions at center if they don't exist
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        nodes.forEach(node => {
            if (node.x === undefined || node.y === undefined) {
                // Add small random offset to prevent exact overlap
                node.x = centerX + (Math.random() - 0.5) * 100;
                node.y = centerY + (Math.random() - 0.5) * 100;
            }
        });

        // Prepare edge data for D3
        const edgeData = edges.map(e => ({
            ...e,
            source: e.source,
            target: e.target
        }));

        // Update simulation
        this.simulation.nodes(nodes);
        this.simulation.force('link').links(edgeData);
        
        this.simulation.tick();
		// Feature 3: Only restart if not frozen
			if (!this.isFrozen) {
				this.simulation.alpha(0.3).restart();
				this.startAutoFreezeTimer();
			}

        // Render edges
        this.renderEdges(edgeData);

        // Render nodes
        this.renderNodes(nodes);

        // Update simulation on tick
        this.simulation.on('tick', () => {
            this.updatePositions();
        });
        
        // Feature 9: Update font sizes
        this.updateFontSizes();
        
        // Update minimap after initial render
        this.updateMinimap();
    }

    /**
     * Render edges
    */
    renderEdges(edgeData) {
		const self = this;

		// Bind data
		const edges = this.edgeGroup
			.selectAll('.edge')
			.data(edgeData, d => d.id);

		// Remove old edges
		edges.exit().remove();

		// Add new edges
		const edgesEnter = edges.enter()
			.append('g')
			.attr('class', 'edge');

		// Add path for edge
		edgesEnter.append('path')
			.attr('stroke', d => d.color || '#95a5a6')
			.attr('stroke-width', 2)
			.attr('fill', 'none')
			.attr('marker-end', d => d.directed ? 'url(#arrowhead)' : '')
			// Feature 10: Half-edges have dashed stroke
			.attr('stroke-dasharray', d => (!d.source || !d.target) ? '5,5' : 'none');

		// Add invisible wider path for easier clicking
		edgesEnter.append('path')
			.attr('class', 'edge-clickable')
			.attr('stroke', 'transparent')
			.attr('stroke-width', 10)
			.attr('fill', 'none')
			.style('cursor', 'pointer')
			.style('pointer-events', 'stroke');
			
		// Add edge label showing type or ID
		edgesEnter.append('text')
			.attr('class', 'edge-label')
			.attr('text-anchor', 'middle')
			.attr('dy', -5)
			.style('fill', '#7f8c8d')
			.style('font-weight', '600')
			.style('pointer-events', 'none')
			.style('user-select', 'none')
			.text(d => d.relationship || '')
			// FIX: Initialize label position immediately to prevent jump
			.each(function(d) {
				const source = typeof d.source === 'object' ? d.source : { x: d.sourceX || 0, y: d.sourceY || 0 };
				const target = typeof d.target === 'object' ? d.target : { x: d.targetX || 0, y: d.targetY || 0 };
				
				const midX = (source.x + target.x) / 2;
				const midY = (source.y + target.y) / 2;
				
				const dx = target.x - source.x;
				const dy = target.y - source.y;
				const angle = Math.atan2(dy, dx) * 180 / Math.PI;
				const textAngle = angle > 90 || angle < -90 ? angle + 180 : angle;
				
				d3.select(this)
					.attr('x', midX)
					.attr('y', midY)
					.attr('transform', `rotate(${textAngle}, ${midX}, ${midY})`);
			});
		
		// Merge and update
		const edgesMerge = edges.merge(edgesEnter);

		edgesMerge.select('path:first-child')
			.attr('stroke', d => d.color || '#95a5a6')
			.attr('stroke-dasharray', d => (!d.source || !d.target) ? '5,5' : 'none')
			.classed('selected', d => this.selectedEdges.has(d.id))
			.classed('highlighted', d => this.highlightedEdges.has(d.id))
			.classed('path-highlight', d => this.highlightedEdges.has(d.id));
		// UPDATE: Also update edge label text when edges are updated
		edgesMerge.select('.edge-label')
			.text(d => d.relationship || '');	

		// Click handler on invisible path
		edgesMerge.select('.edge-clickable')
			.on('click', function(event, d) {
				event.stopPropagation();
				if (self.onEdgeClick) {
					self.onEdgeClick(d);
				}
			})
			.on('contextmenu', function(event, d) {
				event.preventDefault();
				event.stopPropagation();
				if (self.onEdgeContextMenu) {
					self.onEdgeContextMenu(d, event);
				}
			});
		
		// Hover effects
		edgesMerge.select('path:last-child')
			.on('mouseenter', function(event, d) {
				d3.select(this.parentNode).select('path:first-child')
					.attr('stroke-width', 3)
					.style('filter', 'drop-shadow(0 0 2px rgba(52, 152, 219, 0.6))');
			})
			.on('mouseleave', function(event, d) {
				if (!self.selectedEdges.has(d.id)) {
					d3.select(this.parentNode).select('path:first-child')
						.attr('stroke-width', 2)
						.style('filter', 'none');
				}
			});

		// Define arrowhead marker
		this.defineArrowhead();
	}

    /**
     * Define arrowhead marker for directed edges
     */
    defineArrowhead() {
        if (this.svg.select('defs').empty()) {
            const defs = this.svg.append('defs');
            
            defs.append('marker')
                .attr('id', 'arrowhead')
                .attr('viewBox', '-10 -5 10 10')
                .attr('refX', 15)
                .attr('refY', 0)
                .attr('markerWidth', 6)
                .attr('markerHeight', 6)
                .attr('orient', 'auto')
                .append('path')
                .attr('d', 'M-10,-5 L0,0 L-10,5')
                .attr('fill', '#95a5a6');
        }
    }

    /**
     * Render nodes
     * MODIFIED: Added icon support with larger size (4x multiplier)
     */
    renderNodes(nodeData) {
        const self = this;

        // Bind data
        const nodes = this.nodeGroup
            .selectAll('.node')
            .data(nodeData, d => d.id);

        // Remove old nodes
        nodes.exit().remove();

        // Add new nodes
        const nodesEnter = nodes.enter()
            .append('g')
            .attr('class', 'node')
            .call(this.createDragBehavior());

        // NEW: Add circle OR icon based on node.icon property
        nodesEnter.each(function(d) {
            const nodeGroup = d3.select(this);
            
            if (d.icon && d.icon.trim() !== '') {
                // Render icon (emoji) - CHANGED: multiplier from 2 to 4
                nodeGroup.append('text')
                    .attr('class', 'node-icon')
                    .attr('text-anchor', 'middle')
                    .attr('dy', '0.35em')
                    .style('font-size', d => `${(d.size || 10) * 2}px`) // CHANGED
                    .style('cursor', 'pointer')
                    .style('user-select', 'none')
                    .text(d.icon);
                
                // Add invisible circle for selection/hover (same size as icon)
                nodeGroup.append('circle')
                    .attr('class', 'node-hitbox')
                    .attr('r', d => (d.size || 10) * 1.5)
                    .attr('fill', 'transparent')
                    .attr('stroke', 'transparent')
                    .attr('stroke-width', 0);
            } else {
                // Render traditional circle (fallback)
                nodeGroup.append('circle')
                    .attr('r', d => d.size || 10)
                    .attr('fill', d => d.color || '#3498db');
            }
        });

        // Add label (below icon or circle)
        nodesEnter.append('text')
            .attr('class', 'node-label')
            .attr('dy', d => {
                // Position label further down if icon exists - CHANGED: adjusted for larger icons
                return d.icon && d.icon.trim() !== '' ? (d.size || 10) * 3 : -15;
            })
            .attr('text-anchor', 'middle')
            .style('fill', '#2c3e50')
            .style('font-weight', '600')
            .text(d => d.name || d.id);

        // Merge and update
		const nodesMerge = nodes.merge(nodesEnter);

		// Update visual elements
		nodesMerge.each(function(d) {
			const nodeGroup = d3.select(this);
			
			// Update icon if it exists
			const iconElement = nodeGroup.select('.node-icon');
			const hitboxElement = nodeGroup.select('.node-hitbox');
			
			if (d.icon && d.icon.trim() !== '') {
				if (iconElement.empty()) {
					// Icon was just added, need to reconstruct
					nodeGroup.select('circle:not(.node-hitbox)').remove();
					
					// Add icon text
					nodeGroup.append('text')
						.attr('class', 'node-icon')
						.attr('text-anchor', 'middle')
						.attr('dy', '0.35em')
						.style('font-size', `${(d.size || 10) * 2}px`)
						.style('cursor', 'pointer')
						.style('user-select', 'none')
						.text(d.icon);
					
					// FIX: Add hitbox circle for click handling
					nodeGroup.append('circle')
						.attr('class', 'node-hitbox')
						.attr('r', (d.size || 10) * 1.5)
						.attr('fill', 'transparent')
						.attr('stroke', 'transparent')
						.attr('stroke-width', 0)
						.style('pointer-events', 'all');
				} else {
					// Update existing icon
					iconElement
						.style('font-size', `${(d.size || 10) * 2}px`)
						.text(d.icon);
					
					// Update hitbox size
					if (!hitboxElement.empty()) {
						hitboxElement.attr('r', (d.size || 10) * 1.5);
					}
				}
			} else {
				// No icon, ensure circle exists
				if (iconElement.size() > 0) {
					// Had icon before, switch to circle
					iconElement.remove();
					nodeGroup.select('.node-hitbox').remove();
					nodeGroup.insert('circle', ':first-child')
						.attr('r', d.size || 10)
						.attr('fill', d.color || '#3498db');
				} else {
					// Update existing circle
					nodeGroup.select('circle:not(.node-hitbox)')
						.attr('r', d.size || 10)
						.attr('fill', d.color || '#3498db');
				}
			}
			
			// Update label position
			nodeGroup.select('.node-label')
				.attr('dy', d.icon && d.icon.trim() !== '' ? (d.size || 10) * 3 : -15)
				.text(d.name || d.id);
		});

        // Apply selection/highlight classes
        nodesMerge.select('circle:not(.node-hitbox)')
            .classed('selected', d => this.selectedNodes.has(d.id))
            .classed('highlighted', d => this.highlightedNodes.has(d.id))
            .classed('path-highlight', d => this.highlightedNodes.has(d.id));

        // Click handler
        nodesMerge.on('click', function(event, d) {
            event.stopPropagation();
            if (self.onNodeClick) {
                self.onNodeClick(d);
            }
        });
        
        // Context menu handler
        nodesMerge.on('contextmenu', function(event, d) {
            event.preventDefault();
            event.stopPropagation();
            if (self.onNodeContextMenu) {
                self.onNodeContextMenu(d, event);
            }
        });
    }

    /**
     * Create drag behavior for nodes
     */
    createDragBehavior() {
        const self = this;

        function dragstarted(event, d) {
            if (!event.active && !self.isFrozen) self.simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
			d.fx = event.x;
			d.fy = event.y;
			
			// Update visual position immediately, even when frozen
			if (self.isFrozen) {
				d.x = event.x;
				d.y = event.y;
				self.updatePositions();
			}
		}

        function dragended(event, d) {
			if (!event.active && !self.isFrozen) {
				self.simulation.alphaTarget(0);
			}
			
			// Only restart simulation if not frozen
			if (!self.isFrozen) {
				self.simulation.alpha(0.3).restart();
				self.startAutoFreezeTimer();
			} else {
				// Update minimap when dragging while frozen
				self.updateMinimap();
			}
			
			if (self.onNodeDragEnd) {
				self.onNodeDragEnd(d);
			}
		}

        return d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended);
    }

    /**
     * Pin a single node at its current position
     * FIX: Added missing method
     */
    pinNode(nodeId) {
        const node = this.graph.nodes.find(n => n.id === nodeId);
        if (node) {
            node.fx = node.x;
            node.fy = node.y;
        }
    }

    /**
	 * Unpin a node (allow it to move freely again)
	 */
	unpinNode(nodeId) {
		const node = this.graph.nodes.find(n => n.id === nodeId);
		if (node) {
			node.fx = null;
			node.fy = null;
			
			// Add a small "giggle" effect - random velocity
			node.vx = (Math.random() - 0.5) * 20;
			node.vy = (Math.random() - 0.5) * 20;
			
			if (!this.isFrozen) {
				this.simulation.alpha(0.3).restart();
			}
		}
	}

    /**
     * Pin all nodes at their current positions
     */
    pinAllNodes() {
        this.graph.nodes.forEach(node => {
            node.fx = node.x;
            node.fy = node.y;
        });
    }

    /**
     * Unpin all nodes
     */
    unpinAllNodes() {
        this.graph.nodes.forEach(node => {
            node.fx = null;
            node.fy = null;
        });
    }

    /**
     * Update node and edge positions on simulation tick
     * MODIFIED: Removed positioning code for break buttons
     */
    updatePositions() {
        const self = this;
        
        this.nodeGroup.selectAll('.node')
            .attr('transform', d => `translate(${d.x},${d.y})`);

        this.edgeGroup.selectAll('.edge').each(function(d) {
            const path = self.calculateEdgePath(d);
            d3.select(this).selectAll('path')
                .attr('d', path);
            
            // Update edge label position
            const source = typeof d.source === 'object' ? d.source : { x: d.sourceX || 0, y: d.sourceY || 0 };
            const target = typeof d.target === 'object' ? d.target : { x: d.targetX || 0, y: d.targetY || 0 };
            
            const midX = (source.x + target.x) / 2;
            const midY = (source.y + target.y) / 2;
            
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            
            // Rotate text to be readable (don't flip upside down)
            const textAngle = angle > 90 || angle < -90 ? angle + 180 : angle;
            
            d3.select(this).select('.edge-label')
                .attr('x', midX)
                .attr('y', midY)
                .attr('transform', `rotate(${textAngle}, ${midX}, ${midY})`);
        });
        
        // Update minimap viewport (not full redraw, just viewport position)
        this.updateMinimapViewport();
    }

    /**
     * Calculate edge path (straight or curved for multiple edges)
     */
    calculateEdgePath(edge) {
        let sourceX, sourceY, targetX, targetY;
        
        // Feature 10: Handle half-edges
        if (typeof edge.source === 'object' && edge.source !== null) {
            const angle = edge.target ? 
                Math.atan2((edge.target.y || edge.targetY || 0) - edge.source.y, (edge.target.x || edge.targetX || 0) - edge.source.x) : 0;
            const sourceRadius = edge.source.size || 10;
            sourceX = edge.source.x + Math.cos(angle) * sourceRadius;
            sourceY = edge.source.y + Math.sin(angle) * sourceRadius;
        } else {
            // Free source end
            sourceX = edge.sourceX || 0;
            sourceY = edge.sourceY || 0;
        }
        
        if (typeof edge.target === 'object' && edge.target !== null) {
            const angle = edge.source ? 
                Math.atan2(edge.target.y - (edge.source.y || edge.sourceY || 0), edge.target.x - (edge.source.x || edge.sourceX || 0)) : 0;
            const targetRadius = edge.target.size || 10;
            targetX = edge.target.x - Math.cos(angle) * (targetRadius + 5);
            targetY = edge.target.y - Math.sin(angle) * (targetRadius + 5);
        } else {
            // Free target end
            targetX = edge.targetX || 0;
            targetY = edge.targetY || 0;
        }

        return `M${sourceX},${sourceY} L${targetX},${targetY}`;
    }

    /**
     * Select nodes
     */
    selectNodes(nodeIds) {
        this.selectedNodes = new Set(nodeIds);
        this.updateSelection();
    }

    /**
     * Select edges
     */
    selectEdges(edgeIds) {
        this.selectedEdges = new Set(edgeIds);
        this.updateSelection();
    }

    /**
     * Clear selection
     */
    clearSelection() {
        this.selectedNodes.clear();
        this.selectedEdges.clear();
        this.updateSelection();
    }

    /**
     * Update selection styling
     */
    updateSelection() {
		// Update node selection
		this.nodeGroup.selectAll('.node')
			.classed('selected', d => this.selectedNodes.has(d.id))
			.select('circle')
			.classed('selected', d => this.selectedNodes.has(d.id));

		// Update edge selection - apply to entire edge group
		this.edgeGroup.selectAll('.edge')
			.classed('selected', d => this.selectedEdges.has(d.id))
			.select('path:first-child')
			.classed('selected', d => this.selectedEdges.has(d.id));
	}

    /**
     * Highlight nodes (for search/path)
     */
    highlightNodes(nodeIds) {
        this.highlightedNodes = new Set(nodeIds);
        this.updateHighlight();
    }

    /**
     * Highlight edges
     */
    highlightEdges(edgeIds) {
        this.highlightedEdges = new Set(edgeIds);
        this.updateHighlight();
    }

    /**
     * Clear highlights
     */
    clearHighlight() {
        this.highlightedNodes.clear();
        this.highlightedEdges.clear();
        this.updateHighlight();
    }

    /**
     * Update highlight styling
     */
    updateHighlight() {
        // Apply highlight classes to the entire node group (works for both circles and icons)
        this.nodeGroup.selectAll('.node')
            .classed('highlighted', d => this.highlightedNodes.has(d.id))
            .classed('path-highlight', d => this.highlightedNodes.has(d.id));

        this.edgeGroup.selectAll('.edge path:first-child')
            .classed('highlighted', d => this.highlightedEdges.has(d.id))
            .classed('path-highlight', d => this.highlightedEdges.has(d.id));
    }

    /**
     * Reset zoom
     */
    resetZoom() {
        this.svg.transition()
            .duration(750)
            .call(this.zoom.transform, d3.zoomIdentity);
    }

    /**
     * Fit graph to view
     */
    fitToView() {
        if (this.graph.nodes.length === 0) return;

        const bounds = this.g.node().getBBox();
        const fullWidth = this.width;
        const fullHeight = this.height;
        const width = bounds.width;
        const height = bounds.height;
        const midX = bounds.x + width / 2;
        const midY = bounds.y + height / 2;

        if (width === 0 || height === 0) return;

        const scale = 0.9 / Math.max(width / fullWidth, height / fullHeight);
        const translate = [
            fullWidth / 2 - scale * midX,
            fullHeight / 2 - scale * midY
        ];

        this.svg.transition()
            .duration(750)
            .call(
                this.zoom.transform,
                d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
            );
    }

    /**
     * Update zoom status in status bar
     */
    updateZoomStatus() {
        const zoomLevel = Math.round(this.currentTransform.k * 100);
        const statusZoom = document.getElementById('status-zoom');
        if (statusZoom) {
            statusZoom.textContent = `Zoom: ${zoomLevel}%`;
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
		this.width = this.svg.node().clientWidth;
		this.height = this.svg.node().clientHeight;
		
		// Update force center
		this.simulation.force('center', d3.forceCenter(this.width / 2, this.height / 2));
		if (!this.isFrozen) {
			this.simulation.alpha(0.3).restart();
			this.startAutoFreezeTimer();
		}
		
		// Update minimap on resize
		this.updateMinimap();
	}

    /**
     * Stop simulation
     */
    stopSimulation() {
        this.simulation.stop();
    }

    /**
     * Restart simulation
     */
    restartSimulation() {
        // Always unfreeze and restart with strong alpha
        this.isFrozen = false;
        this.simulation.alpha(0.5).restart();
        this.startAutoFreezeTimer();
        this.updateSimulationStatus();
    }

    /**
     * Get current transform
     */
    getTransform() {
        return this.currentTransform;
    }

    /**
     * Set transform
     */
    setTransform(transform) {
        this.svg.call(this.zoom.transform, transform);
    }
	
	/**
	 * Setup canvas event handlers (called once during initialization)
	 */
	setupCanvasEventHandlers() {
		const self = this;
		
		// Canvas click (deselect)
		this.svg.on('click', (event) => {
			if (event.target === this.svg.node()) {
				if (self.onCanvasClick) {
					self.onCanvasClick();
				}
			}
		});
		
		// Canvas context menu
		this.svg.on('contextmenu', (event) => {
			if (event.target === this.svg.node() || event.target.tagName === 'svg' || event.target.tagName === 'SVG') {
				event.preventDefault();
				if (self.onCanvasContextMenu) {
					self.onCanvasContextMenu(event);
				}
			}
		});
	}
	
	/**
	 * Update minimap with full graph data
	 */
	updateMinimap() {
		if (window.app && window.app.minimap) {
			window.app.minimap.update(this.graph.nodes, this.graph.edges);
		}
	}
	
	/**
	 * Update only minimap viewport (lighter operation)
	 */
	updateMinimapViewport() {
		if (window.app && window.app.minimap) {
			window.app.minimap.updateViewport();
		}
	}
	
	/**
     * Apply distance-based dimming from a source node
     * @param {string} sourceNodeId - Source node ID
     * @param {number} maxDistance - Maximum distance to keep visible (default: 4)
     */
    applyDistanceDimming(sourceNodeId, maxDistance = 4) {
        // Calculate distances from source node
        const distances = Algorithms.calculateDistancesFromNode(this.graph, sourceNodeId, true, maxDistance);
        
        // Clear previous dimming state
        this.dimmedNodes.clear();
        this.dimmedEdges.clear();
        
        // Mark nodes beyond maxDistance as dimmed
        this.graph.nodes.forEach(node => {
            const distance = distances[node.id];
            if (distance === undefined || distance > maxDistance) {
                this.dimmedNodes.add(node.id);
            }
        });
        
        // Mark edges where BOTH endpoints are beyond maxDistance as dimmed
        this.graph.edges.forEach(edge => {
            const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
            const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
            
            const sourceDistance = distances[sourceId] || Infinity;
            const targetDistance = distances[targetId] || Infinity;
            
            // Dim edge if both endpoints are beyond maxDistance OR if one endpoint doesn't exist
            if ((sourceDistance > maxDistance && targetDistance > maxDistance) || 
                (!sourceId || !targetId)) {
                this.dimmedEdges.add(edge.id);
            }
        });
        
        this.isDimmingActive = true;
        this.updateDimming();
    }
    
    /**
     * Clear distance-based dimming
     */
    clearDistanceDimming() {
        this.dimmedNodes.clear();
        this.dimmedEdges.clear();
        this.isDimmingActive = false;
        this.updateDimming();
    }
    
    /**
     * Update dimming styling
     */
    updateDimming() {
        this.nodeGroup.selectAll('.node')
            .classed('dimmed', d => this.dimmedNodes.has(d.id));
        
        this.edgeGroup.selectAll('.edge')
            .classed('dimmed', d => this.dimmedEdges.has(d.id));
    }

    /**
     * Get current transform
     */
    getTransform() {
        return this.currentTransform;
    }
	
}

// Export
window.Renderer = Renderer;