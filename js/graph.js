// Graph Data Model

class Graph {
    constructor() {
        this.metadata = {
            name: 'Untitled Graph',
            title: '',
            description: '',
            created: Utils.getCurrentDate(),
            modified: Utils.getCurrentDate()
        };
        this.nodes = [];
        this.edges = [];
    }

    /**
     * Add a new node to the graph
     * @param {Object} properties - Node properties
     * @returns {Object} Created node
     */
    addNode(properties = {}) {
        // Strip D3 properties before creating node
        const cleanProps = this.stripD3Properties(properties);
        
        const node = {
            id: cleanProps.id || Utils.generateId('node'),
            properties: {
                color: cleanProps.color || '#3498db',
                size: cleanProps.size || 10,
                description: cleanProps.description || '',
                ...cleanProps
            }
        };
        
        // Remove id from properties if it exists
        delete node.properties.id;
        
        this.nodes.push(node);
        this.updateModifiedDate();
        return node;
    }

    /**
     * Remove a node and its connected edges
     * @param {string} nodeId - ID of node to remove
     * @returns {boolean} Success
     */
    removeNode(nodeId) {
        const index = this.nodes.findIndex(n => n.id === nodeId);
        if (index === -1) return false;

        // Remove connected edges (handle D3 object references)
        this.edges = this.edges.filter(e => {
            const sourceId = typeof e.source === 'object' ? e.source.id : e.source;
            const targetId = typeof e.target === 'object' ? e.target.id : e.target;
            return sourceId !== nodeId && targetId !== nodeId;
        });

        this.nodes.splice(index, 1);
        this.updateModifiedDate();
        return true;
    }

    /**
     * Get node by ID
     * @param {string} nodeId - Node ID
     * @returns {Object|null} Node object
     */
    getNode(nodeId) {
        return this.nodes.find(n => n.id === nodeId) || null;
    }

    /**
     * Update node properties
     * @param {string} nodeId - Node ID
     * @param {Object} properties - Properties to update
     * @returns {boolean} Success
     */
    updateNode(nodeId, properties) {
        const node = this.getNode(nodeId);
        if (!node) return false;

        // Filter out D3 simulation properties before updating
        const cleanProperties = this.stripD3Properties(properties);
        Object.assign(node.properties, cleanProperties);
        this.updateModifiedDate();
        return true;
    }

    /**
     * Add a new edge to the graph
     * @param {string} source - Source node ID
     * @param {string} target - Target node ID
     * @param {Object} properties - Edge properties
     * @returns {Object|null} Created edge or null if invalid
     */
    addEdge(source, target, properties = {}) {
        // Validate source and target exist
        if (!this.getNode(source) || !this.getNode(target)) {
            return null;
        }

        // Check for duplicate edges (handle D3 object references)
        const exists = this.edges.some(e => {
            const sourceId = typeof e.source === 'object' ? e.source.id : e.source;
            const targetId = typeof e.target === 'object' ? e.target.id : e.target;
            return sourceId === source && targetId === target;
        });
        if (exists) return null;

        // Strip D3 properties before creating edge
        const cleanProps = this.stripD3Properties(properties);

        const edge = {
            id: cleanProps.id || Utils.generateId('edge'),
            source,
            target,
            properties: {
                description: cleanProps.description || '',
                type: cleanProps.type || 'related',
                color: cleanProps.color || '#95a5a6',
                weight: cleanProps.weight || 1,
                directed: cleanProps.directed !== undefined ? cleanProps.directed : true,
                ...cleanProps
            }
        };

        // Remove id, source, target from properties if they exist
        delete edge.properties.id;
        delete edge.properties.source;
        delete edge.properties.target;

        this.edges.push(edge);
        this.updateModifiedDate();
        return edge;
    }

    /**
     * Remove an edge
     * @param {string} edgeId - Edge ID
     * @returns {boolean} Success
     */
    removeEdge(edgeId) {
        const index = this.edges.findIndex(e => e.id === edgeId);
        if (index === -1) return false;

        this.edges.splice(index, 1);
        this.updateModifiedDate();
        return true;
    }

    /**
     * Get edge by ID
     * @param {string} edgeId - Edge ID
     * @returns {Object|null} Edge object
     */
    getEdge(edgeId) {
        return this.edges.find(e => e.id === edgeId) || null;
    }

    /**
     * Update edge properties
     * @param {string} edgeId - Edge ID
     * @param {Object} properties - Properties to update
     * @returns {boolean} Success
     */
    updateEdge(edgeId, properties) {
        const edge = this.getEdge(edgeId);
        if (!edge) return false;

        // Filter out D3 simulation properties before updating
        const cleanProperties = this.stripD3Properties(properties);
        Object.assign(edge.properties, cleanProperties);
        this.updateModifiedDate();
        return true;
    }

    /**
     * Get all edges connected to a node
     * @param {string} nodeId - Node ID
     * @returns {Array} Connected edges
     */
    getNodeEdges(nodeId) {
        return this.edges.filter(e => {
            const sourceId = typeof e.source === 'object' ? e.source.id : e.source;
            const targetId = typeof e.target === 'object' ? e.target.id : e.target;
            return sourceId === nodeId || targetId === nodeId;
        });
    }

    /**
     * Get neighbors of a node
     * @param {string} nodeId - Node ID
     * @returns {Array} Neighbor node IDs
     */
    getNeighbors(nodeId) {
        const neighbors = new Set();
        this.edges.forEach(edge => {
            // Handle both string IDs and D3 object references
            const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
            const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
            
            if (sourceId === nodeId) {
                neighbors.add(targetId);
            }
            if (targetId === nodeId && !edge.properties.directed) {
                neighbors.add(sourceId);
            }
        });
        return Array.from(neighbors);
    }

    /**
     * Clear the graph
     */
    clear() {
        this.nodes = [];
        this.edges = [];
        this.updateModifiedDate();
    }

    /**
     * Update modified date
     */
    updateModifiedDate() {
        this.metadata.modified = Utils.getCurrentDate();
    }

    /**
     * Strip D3 force simulation properties from an object
     * @param {Object} obj - Object to clean
     * @returns {Object} Cleaned object
     */
    stripD3Properties(obj) {
        const d3Props = ['x', 'y', 'fx', 'fy', 'vx', 'vy', 'index'];
        const cleaned = {};
        
        for (const [key, value] of Object.entries(obj)) {
            if (!d3Props.includes(key)) {
                cleaned[key] = value;
            }
        }
        
        return cleaned;
    }

    /**
     * Serialize graph to JSON
     * @returns {Object} JSON representation
     */
    toJSON() {
        // Strip D3 force simulation properties before saving
        const cleanNodes = this.nodes.map(node => ({
            id: node.id,
            properties: this.stripD3Properties(node.properties)
        }));

        const cleanEdges = this.edges.map(edge => ({
            id: edge.id,
            source: typeof edge.source === 'object' ? edge.source.id : edge.source,
            target: typeof edge.target === 'object' ? edge.target.id : edge.target,
            properties: this.stripD3Properties(edge.properties)
        }));

        return {
            graph: {
                metadata: this.metadata,
                nodes: cleanNodes,
                edges: cleanEdges
            }
        };
    }

    /**
     * Load graph from JSON
     * @param {Object} json - JSON data
     * @returns {boolean} Success
     */
    fromJSON(json) {
        try {
            if (!json.graph) {
                throw new Error('Invalid graph format');
            }

            this.metadata = json.graph.metadata || {
                name: 'Imported Graph',
                title: '',
                description: '',
                created: Utils.getCurrentDate(),
                modified: Utils.getCurrentDate()
            };

            this.nodes = json.graph.nodes || [];
            this.edges = json.graph.edges || [];

            // Validate nodes have required structure and clean D3 properties
            this.nodes = this.nodes.filter(node => {
                if (!node.id || !node.properties) return false;
                
                // Clean D3 properties if they exist
                node.properties = this.stripD3Properties(node.properties);
                
                // Ensure required properties exist
                node.properties.color = node.properties.color || '#3498db';
                node.properties.size = node.properties.size || 10;
                node.properties.description = node.properties.description || '';
                return true;
            });

            // Validate edges and clean D3 properties
            this.edges = this.edges.filter(edge => {
                if (!edge.id || !edge.source || !edge.target || !edge.properties) return false;
                
                // Check if source and target nodes exist
                if (!this.getNode(edge.source) || !this.getNode(edge.target)) return false;
                
                // Clean D3 properties if they exist
                edge.properties = this.stripD3Properties(edge.properties);
                
                // Ensure required properties exist
                edge.properties.type = edge.properties.type || 'related';
                edge.properties.color = edge.properties.color || '#95a5a6';
                edge.properties.weight = edge.properties.weight || 1;
                edge.properties.directed = edge.properties.directed !== undefined ? edge.properties.directed : true;
                edge.properties.description = edge.properties.description || '';
                return true;
            });

            this.updateModifiedDate();
            return true;
        } catch (error) {
            console.error('Error loading graph:', error);
            return false;
        }
    }

    /**
     * Get graph statistics
     * @returns {Object} Statistics
     */
    getStats() {
        return {
            nodeCount: this.nodes.length,
            edgeCount: this.edges.length,
            avgDegree: this.nodes.length > 0 
                ? (this.edges.length * 2) / this.nodes.length 
                : 0
        };
    }

    /**
     * Search nodes by property value
     * @param {string} query - Search query
     * @returns {Array} Matching nodes
     */
    searchNodes(query) {
        if (!query) return this.nodes;

        const lowerQuery = query.toLowerCase();
        return this.nodes.filter(node => {
            // Search in node ID
            if (node.id.toLowerCase().includes(lowerQuery)) return true;

            // Search in properties
            for (const [key, value] of Object.entries(node.properties)) {
                if (String(value).toLowerCase().includes(lowerQuery)) {
                    return true;
                }
            }
            return false;
        });
    }
}

// Export
window.Graph = Graph;
