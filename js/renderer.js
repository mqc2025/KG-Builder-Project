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
        
        // Initialize zoom behavior
        this.zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                this.g.attr('transform', event.transform);
                this.currentTransform = event.transform;
                this.updateZoomStatus();
            });
        
        this.svg.call(this.zoom);
        this.currentTransform = d3.zoomIdentity;
        
        // Initialize force simulation
        this.simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id(d => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('collision', d3.forceCollide().radius(30));
        
        // Event handlers
        this.onNodeClick = null;
        this.onEdgeClick = null;
        this.onCanvasClick = null;
        this.onNodeDragEnd = null;
        
        // Selection tracking
        this.selectedNodes = new Set();
        this.selectedEdges = new Set();
        
        // Highlighted elements (for search/path)
        this.highlightedNodes = new Set();
        this.highlightedEdges = new Set();
        
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    /**
     * Render the graph
     */
    render() {
        const nodes = this.graph.nodes;
        const edges = this.graph.edges;

        // Prepare edge data for D3
        const edgeData = edges.map(e => ({
            ...e,
            source: e.source,
            target: e.target
        }));

        // Update simulation
        this.simulation.nodes(nodes);
        this.simulation.force('link').links(edgeData);
        this.simulation.alpha(0.3).restart();

        // Render edges
        this.renderEdges(edgeData);

        // Render nodes
        this.renderNodes(nodes);

        // Update simulation on tick
        this.simulation.on('tick', () => {
            this.updatePositions();
        });
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
            .attr('stroke', d => d.properties.color || '#95a5a6')
            .attr('stroke-width', 2)
            .attr('fill', 'none')
            .attr('marker-end', d => d.properties.directed ? 'url(#arrowhead)' : '');

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
			.style('font-size', '11px')  // Increased from 10px
			.style('fill', '#7f8c8d')
			.style('font-weight', '600')
			.style('pointer-events', 'none')
			.style('user-select', 'none')
			.style('background', 'white')  // ADD THIS
			.style('padding', '2px 4px')   // ADD THIS
			.text(d => d.properties.type || d.id);  // Show type first, fallback to ID
			
        // Merge and update
        const edgesMerge = edges.merge(edgesEnter);

        edgesMerge.select('path:first-child')
            .attr('stroke', d => d.properties.color || '#95a5a6')
            .classed('selected', d => this.selectedEdges.has(d.id))
            .classed('highlighted', d => this.highlightedEdges.has(d.id))
            .classed('path-highlight', d => this.highlightedEdges.has(d.id));

        // Click handler on invisible path
        edgesMerge.select('.edge-clickable') 
			.on('click', function(event, d) {
				event.stopPropagation();
				if (self.onEdgeClick) {
					self.onEdgeClick(d);
				}
			});
		
		// ADD HOVER EFFECTS
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

        // Add circle
        nodesEnter.append('circle')
            .attr('r', d => d.properties.size || 10)
            .attr('fill', d => d.properties.color || '#3498db');

        // Add label
        nodesEnter.append('text')
            .attr('dy', -15)
            .attr('text-anchor', 'middle')
            .style('fill', '#2c3e50')
            .style('font-weight', '600')
            .text(d => d.id);

        // Merge and update
        const nodesMerge = nodes.merge(nodesEnter);

        nodesMerge.select('circle')
            .attr('r', d => d.properties.size || 10)
            .attr('fill', d => d.properties.color || '#3498db')
            .classed('selected', d => this.selectedNodes.has(d.id))
            .classed('highlighted', d => this.highlightedNodes.has(d.id))
            .classed('path-highlight', d => this.highlightedNodes.has(d.id));

        nodesMerge.select('text')
            .text(d => d.id);

        // Click handler
        nodesMerge.on('click', function(event, d) {
            event.stopPropagation();
            if (self.onNodeClick) {
                self.onNodeClick(d);
            }
        });

        // Canvas click (deselect)
        this.svg.on('click', (event) => {
            if (event.target === this.svg.node()) {
                if (this.onCanvasClick) {
                    this.onCanvasClick();
                }
            }
        });
    }

    /**
     * Create drag behavior for nodes
     */
    createDragBehavior() {
        const self = this;

        function dragstarted(event, d) {
            if (!event.active) self.simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) self.simulation.alphaTarget(0);
            // Keep node fixed at dragged position
            // d.fx = null;
            // d.fy = null;
            
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
     * Update node and edge positions on simulation tick
     */
    updatePositions() {
        const self = this;
        
        this.nodeGroup.selectAll('.node')
            .attr('transform', d => `translate(${d.x},${d.y})`);

        this.edgeGroup.selectAll('.edge').each(function(d) {
    const path = self.calculateEdgePath(d);
    d3.select(this).selectAll('path')
        .attr('d', path);
    
    // Update edge label position and rotation
    const source = d.source;
    const target = d.target;
    
    if (typeof source !== 'string' && typeof target !== 'string') {
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        // Keep text upright (flip if upside down)
        const textAngle = (angle > 90 || angle < -90) ? angle + 180 : angle;
        
        d3.select(this).select('.edge-label')
            .attr('x', midX)
            .attr('y', midY)
            .attr('transform', `rotate(${textAngle}, ${midX}, ${midY})`);
    }
});
    }

    /**
     * Calculate edge path (straight or curved for multiple edges)
     */
    calculateEdgePath(edge) {
        const source = edge.source;
        const target = edge.target;
        
        if (typeof source === 'string' || typeof target === 'string') {
            return '';
        }

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const angle = Math.atan2(dy, dx);
        
        // Calculate offset for node radius
        const sourceRadius = source.properties.size || 10;
        const targetRadius = target.properties.size || 10;
        
        const sourceX = source.x + Math.cos(angle) * sourceRadius;
        const sourceY = source.y + Math.sin(angle) * sourceRadius;
        const targetX = target.x - Math.cos(angle) * (targetRadius + 5);
        const targetY = target.y - Math.sin(angle) * (targetRadius + 5);

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
        this.nodeGroup.selectAll('.node circle')
            .classed('selected', d => this.selectedNodes.has(d.id));

        this.edgeGroup.selectAll('.edge path:first-child')
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
        this.nodeGroup.selectAll('.node circle')
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
        this.simulation.alpha(0.3).restart();
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
        this.simulation.alpha(0.3).restart();
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
}

// Export
window.Renderer = Renderer;
