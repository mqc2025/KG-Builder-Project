// Minimap Component

class Minimap {
    constructor(svgElement, mainRenderer) {
        this.svg = d3.select(svgElement);
        this.mainRenderer = mainRenderer;
        this.container = document.getElementById('minimap-container');
        this.width = 180;
        this.height = 120;
        this.scale = 1;
        
        // Create viewport indicator
        this.viewport = this.svg.append('rect')
            .attr('class', 'minimap-viewport')
            .style('pointer-events', 'all');
        
        // Groups for nodes and edges
        this.edgeGroup = this.svg.append('g').attr('class', 'minimap-edges');
        this.nodeGroup = this.svg.append('g').attr('class', 'minimap-nodes');
        
        this.setupInteraction();
    }

    /**
     * Setup interaction with minimap
     */
    setupInteraction() {
        const self = this;

        // Click to navigate
        this.svg.on('click', function(event) {
            const [x, y] = d3.pointer(event);
            self.navigateToPoint(x, y);
        });

        // Drag viewport
        const drag = d3.drag()
            .on('drag', function(event) {
                const [x, y] = [event.x, event.y];
                self.navigateToPoint(x, y);
            });

        this.viewport.call(drag);
    }

    /**
     * Navigate to a point in the minimap
     */
    navigateToPoint(x, y) {
        const mainSvg = this.mainRenderer.svg;
        const mainWidth = mainSvg.node().clientWidth;
        const mainHeight = mainSvg.node().clientHeight;

        // Convert minimap coordinates to main graph coordinates
        const graphX = (x - this.offsetX) / this.scale;
        const graphY = (y - this.offsetY) / this.scale;

        // Calculate transform to center on this point
        const k = this.mainRenderer.currentTransform.k;
        const tx = mainWidth / 2 - graphX * k;
        const ty = mainHeight / 2 - graphY * k;

        const transform = d3.zoomIdentity.translate(tx, ty).scale(k);
        
        mainSvg.transition()
            .duration(300)
            .call(this.mainRenderer.zoom.transform, transform);
    }

    /**
     * Update minimap based on main graph
     */
    update(nodes, edges) {
        if (nodes.length === 0) {
            this.container.classList.add('hidden');
            return;
        }

        this.container.classList.remove('hidden');

        // Calculate bounds of the graph
        const bounds = this.calculateBounds(nodes);
        
        // Calculate scale to fit graph in minimap
        const scaleX = this.width / (bounds.width + 40);
        const scaleY = this.height / (bounds.height + 40);
        this.scale = Math.min(scaleX, scaleY, 1);

        // Calculate offset to center graph
        this.offsetX = (this.width - bounds.width * this.scale) / 2 - bounds.minX * this.scale;
        this.offsetY = (this.height - bounds.height * this.scale) / 2 - bounds.minY * this.scale;

        // Render edges
        this.renderEdges(edges);

        // Render nodes
        this.renderNodes(nodes);

        // Update viewport indicator
        this.updateViewport();
    }

    /**
     * Calculate bounds of all nodes
     */
    calculateBounds(nodes) {
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        nodes.forEach(node => {
            if (node.x < minX) minX = node.x;
            if (node.x > maxX) maxX = node.x;
            if (node.y < minY) minY = node.y;
            if (node.y > maxY) maxY = node.y;
        });

        return {
            minX,
            minY,
            maxX,
            maxY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    /**
     * Render minimap edges
     */
    renderEdges(edges) {
        const self = this;

        const edgeElements = this.edgeGroup
            .selectAll('line')
            .data(edges, d => d.id);

        edgeElements.exit().remove();

        edgeElements.enter()
            .append('line')
            .attr('class', 'minimap-edge')
            .merge(edgeElements)
            .attr('x1', d => this.transformX(d.source.x || d.source))
            .attr('y1', d => this.transformY(d.source.y || d.source))
            .attr('x2', d => this.transformX(d.target.x || d.target))
            .attr('y2', d => this.transformY(d.target.y || d.target));
    }

    /**
     * Render minimap nodes
     */
    renderNodes(nodes) {
        const nodeElements = this.nodeGroup
            .selectAll('circle')
            .data(nodes, d => d.id);

        nodeElements.exit().remove();

        nodeElements.enter()
            .append('circle')
            .attr('class', 'minimap-node')
            .attr('r', 2)
            .merge(nodeElements)
            .attr('cx', d => this.transformX(d.x))
            .attr('cy', d => this.transformY(d.y));
    }

    /**
     * Update viewport indicator
     */
    updateViewport() {
        const mainSvg = this.mainRenderer.svg;
        const mainWidth = mainSvg.node().clientWidth;
        const mainHeight = mainSvg.node().clientHeight;
        const transform = this.mainRenderer.currentTransform;

        // Calculate visible area in graph coordinates
        const x0 = -transform.x / transform.k;
        const y0 = -transform.y / transform.k;
        const x1 = (-transform.x + mainWidth) / transform.k;
        const y1 = (-transform.y + mainHeight) / transform.k;

        // Transform to minimap coordinates
        const viewportX = this.transformX(x0);
        const viewportY = this.transformY(y0);
        const viewportWidth = this.transformX(x1) - viewportX;
        const viewportHeight = this.transformY(y1) - viewportY;

        this.viewport
            .attr('x', viewportX)
            .attr('y', viewportY)
            .attr('width', viewportWidth)
            .attr('height', viewportHeight);
    }

    /**
     * Transform X coordinate to minimap
     */
    transformX(x) {
        return x * this.scale + this.offsetX;
    }

    /**
     * Transform Y coordinate to minimap
     */
    transformY(y) {
        return y * this.scale + this.offsetY;
    }

    /**
     * Hide minimap
     */
    hide() {
        this.container.classList.add('hidden');
    }

    /**
     * Show minimap
     */
    show() {
        this.container.classList.remove('hidden');
    }
}

// Export
window.Minimap = Minimap;
