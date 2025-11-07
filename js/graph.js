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
        
        // Global settings
        this.settings = {
            nodeLabelSize: 12,
            edgeLabelSize: 10,
            worldBoundary: {
                enabled: false,
                minX: -2000,
                maxX: 2000,
                minY: -2000,
                maxY: 2000
            }
        };
    }

    /**
     * Add a new node to the graph
     * @param {Object} properties - Node properties
     * @returns {Object} Created node
     */
    addNode(properties = {}) {
        // Strip D3 properties before creating node
        const cleanProps = this.stripD3Properties(properties);
        
        const now = new Date().toISOString();
        
        const node = {
            id: cleanProps.id || Utils.generateId('node'),
            properties: {
                color: cleanProps.color || '#3498db',
                size: cleanProps.size || 10,
                description: cleanProps.description || '',
                // Feature 5: Priority and dates
                priority: cleanProps.priority || 'Medium',
                deadline: cleanProps.deadline || '',
                userDate: cleanProps.userDate || '',
                createdDate: cleanProps.createdDate || now,
                modifiedDate: now,
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
        
        // Update modifiedDate
        cleanProperties.modifiedDate = new Date().toISOString();
        
        Object.assign(node.properties, cleanProperties);
        this.updateModifiedDate();
        return true;
    }

    /**
     * Rename a node (Feature 2)
     * @param {string} oldId - Current node ID
     * @param {string} newId - New node ID
     * @returns {boolean} Success
     */
    renameNode(oldId, newId) {
        // Check if newId already exists
        if (oldId === newId) return true;
        if (this.getNode(newId)) {
            return false; // Duplicate ID
        }
        
        const node = this.getNode(oldId);
        if (!node) return false;
        
        // Update node ID
        node.id = newId;
        
        // Update all edge references
        this.edges.forEach(edge => {
            if (typeof edge.source === 'object' && edge.source.id === oldId) {
                edge.source.id = newId;
            } else if (edge.source === oldId) {
                edge.source = newId;
            }
            
            if (typeof edge.target === 'object' && edge.target.id === oldId) {
                edge.target.id = newId;
            } else if (edge.target === oldId) {
                edge.target = newId;
            }
        });
        
        this.updateModifiedDate();
        return true;
    }

    /**
     * Add a new edge to the graph
     * @param {string} source - Source node ID (or null for half-edge)
     * @param {string} target - Target node ID (or null for half-edge)
     * @param {Object} properties - Edge properties
     * @returns {Object|null} Created edge or null if invalid
     */
    addEdge(source, target, properties = {}) {
        // Feature 10: Allow half-edges (source or target can be null)
        // Validate at least one end is connected
        if (!source && !target) {
            return null;
        }
        
        // Validate connected nodes exist
        if (source && !this.getNode(source)) return null;
        if (target && !this.getNode(target)) return null;

        // Check for duplicate edges (only if both ends are defined)
        if (source && target) {
            const exists = this.edges.some(e => {
                const sourceId = typeof e.source === 'object' ? e.source.id : e.source;
                const targetId = typeof e.target === 'object' ? e.target.id : e.target;
                return sourceId === source && targetId === target;
            });
            if (exists) return null;
        }

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
        
        // Feature 10: Store free end coordinates for half-edges
        if (!source && properties.sourceX !== undefined) {
            edge.sourceX = properties.sourceX;
            edge.sourceY = properties.sourceY;
        }
        if (!target && properties.targetX !== undefined) {
            edge.targetX = properties.targetX;
            edge.targetY = properties.targetY;
        }

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
     * Rename an edge (Feature 2)
     * @param {string} oldId - Current edge ID
     * @param {string} newId - New edge ID
     * @returns {boolean} Success
     */
    renameEdge(oldId, newId) {
        if (oldId === newId) return true;
        if (this.getEdge(newId)) {
            return false; // Duplicate ID
        }
        
        const edge = this.getEdge(oldId);
        if (!edge) return false;
        
        edge.id = newId;
        this.updateModifiedDate();
        return true;
    }

    /**
     * Break an edge at one end (Feature 10)
     * @param {string} edgeId - Edge ID
     * @param {string} end - Which end to break ('source' or 'target')
     * @param {number} x - X coordinate for free end
     * @param {number} y - Y coordinate for free end
     * @returns {boolean} Success
     */
    breakEdge(edgeId, end, x, y) {
        const edge = this.getEdge(edgeId);
        if (!edge) return false;
        
        if (end === 'source') {
            edge.source = null;
            edge.sourceX = x;
            edge.sourceY = y;
        } else if (end === 'target') {
            edge.target = null;
            edge.targetX = x;
            edge.targetY = y;
        }
        
        this.updateModifiedDate();
        return true;
    }

    /**
     * Connect a half-edge to a node (Feature 10)
     * @param {string} edgeId - Edge ID
     * @param {string} end - Which end to connect ('source' or 'target')
     * @param {string} nodeId - Node to connect to
     * @returns {boolean} Success
     */
    connectHalfEdge(edgeId, end, nodeId) {
        const edge = this.getEdge(edgeId);
        if (!edge) return false;
        
        const node = this.getNode(nodeId);
        if (!node) return false;
        
        if (end === 'source') {
            edge.source = nodeId;
            delete edge.sourceX;
            delete edge.sourceY;
        } else if (end === 'target') {
            edge.target = nodeId;
            delete edge.targetX;
            delete edge.targetY;
        }
        
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
            
            if (sourceId === nodeId && targetId) {
                neighbors.add(targetId);
            }
            if (targetId === nodeId && sourceId && !edge.properties.directed) {
                neighbors.add(sourceId);
            }
        });
        return Array.from(neighbors);
    }

    /**
     * Merge two nodes into one (Feature 13)
     * @param {string} nodeId1 - First node ID
     * @param {string} nodeId2 - Second node ID
     * @param {string} keepId - Which ID to keep (nodeId1 or nodeId2)
     * @returns {boolean} Success
     */
    mergeNodes(nodeId1, nodeId2, keepId) {
        const node1 = this.getNode(nodeId1);
        const node2 = this.getNode(nodeId2);
        
        if (!node1 || !node2) return false;
        if (keepId !== nodeId1 && keepId !== nodeId2) return false;
        
        const keepNode = keepId === nodeId1 ? node1 : node2;
        const deleteNode = keepId === nodeId1 ? node2 : node1;
        const deleteId = keepId === nodeId1 ? nodeId2 : nodeId1;
        
        // Merge properties (preserve all information with prefixes)
        for (const [key, value] of Object.entries(deleteNode.properties)) {
            if (key === 'createdDate') {
                // Keep the earliest creation date
                const keepDate = new Date(keepNode.properties.createdDate);
                const deleteDate = new Date(value);
                if (deleteDate < keepDate) {
                    keepNode.properties.createdDate = value;
                }
            } else if (keepNode.properties[key] !== undefined && keepNode.properties[key] !== value) {
                // Conflict: prefix the property
                keepNode.properties[`merged_${deleteId}_${key}`] = value;
            } else if (keepNode.properties[key] === undefined) {
                // No conflict: just add it
                keepNode.properties[key] = value;
            }
        }
        
        // Redirect all edges from deleted node to kept node
        this.edges.forEach(edge => {
            if (typeof edge.source === 'object' && edge.source.id === deleteId) {
                edge.source = keepId;
            } else if (edge.source === deleteId) {
                edge.source = keepId;
            }
            
            if (typeof edge.target === 'object' && edge.target.id === deleteId) {
                edge.target = keepId;
            } else if (edge.target === deleteId) {
                edge.target = keepId;
            }
        });
        
        // Remove duplicate edges (same source and target)
        const uniqueEdges = [];
        const edgeSet = new Set();
        
        this.edges.forEach(edge => {
            const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
            const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
            const key = `${sourceId}-${targetId}`;
            
            if (!edgeSet.has(key)) {
                edgeSet.add(key);
                uniqueEdges.push(edge);
            }
        });
        
        this.edges = uniqueEdges;
        
        // Remove the deleted node
        this.removeNode(deleteId);
        
        return true;
    }

    /**
     * Get all unique edge types (Feature 11)
     * @returns {Array} Unique edge types
     */
    getAllEdgeTypes() {
        const types = new Set();
        this.edges.forEach(edge => {
            if (edge.properties.type) {
                types.add(edge.properties.type);
            }
        });
        return Array.from(types).sort();
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
        const d3Props = ['vx', 'vy', 'index'];
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
        // Save nodes with position properties (x, y, fx, fy) but strip other D3 properties
        const cleanNodes = this.nodes.map(node => {
            const nodeData = {
                id: node.id,
                properties: this.stripD3Properties(node.properties)
            };
            
            // Preserve position properties (x, y) and pin status (fx, fy)
            if (node.x !== undefined) nodeData.x = node.x;
            if (node.y !== undefined) nodeData.y = node.y;
            if (node.fx !== undefined) nodeData.fx = node.fx;
            if (node.fy !== undefined) nodeData.fy = node.fy;
            
            return nodeData;
        });

        const cleanEdges = this.edges.map(edge => {
            const edgeData = {
                id: edge.id,
                source: typeof edge.source === 'object' ? edge.source.id : edge.source,
                target: typeof edge.target === 'object' ? edge.target.id : edge.target,
                properties: this.stripD3Properties(edge.properties)
            };
            
            // Feature 10: Preserve half-edge coordinates
            if (edge.sourceX !== undefined) edgeData.sourceX = edge.sourceX;
            if (edge.sourceY !== undefined) edgeData.sourceY = edge.sourceY;
            if (edge.targetX !== undefined) edgeData.targetX = edge.targetX;
            if (edge.targetY !== undefined) edgeData.targetY = edge.targetY;
            
            return edgeData;
        });

        return {
            graph: {
                metadata: this.metadata,
                settings: this.settings,
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
            
            // Load settings (Feature 4, 9)
            this.settings = json.graph.settings || {
                nodeLabelSize: 12,
                edgeLabelSize: 10,
                worldBoundary: {
                    enabled: false,
                    minX: -2000,
                    maxX: 2000,
                    minY: -2000,
                    maxY: 2000
                }
            };

            this.nodes = json.graph.nodes || [];
            this.edges = json.graph.edges || [];

            // Validate nodes have required structure and restore position properties
            this.nodes = this.nodes.filter(node => {
                if (!node.id || !node.properties) return false;
                
                // Clean D3 properties from properties object if they exist
                node.properties = this.stripD3Properties(node.properties);
                
                // Ensure required properties exist
                node.properties.color = node.properties.color || '#3498db';
                node.properties.size = node.properties.size || 10;
                node.properties.description = node.properties.description || '';
                
                // Feature 5: Ensure date/priority properties exist
                const now = new Date().toISOString();
                node.properties.priority = node.properties.priority || 'Medium';
                node.properties.deadline = node.properties.deadline || '';
                node.properties.userDate = node.properties.userDate || '';
                node.properties.createdDate = node.properties.createdDate || now;
                node.properties.modifiedDate = node.properties.modifiedDate || now;
                
                return true;
            });

            // Validate edges and clean D3 properties
            this.edges = this.edges.filter(edge => {
                if (!edge.id || !edge.properties) return false;
                
                // Feature 10: Half-edges are allowed (source or target can be null)
                if (!edge.source && !edge.target) return false;
                
                // Check if connected nodes exist
                if (edge.source && !this.getNode(edge.source)) return false;
                if (edge.target && !this.getNode(edge.target)) return false;
                
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

    /**
     * Filter nodes by property (Feature 1)
     * @param {string} propertyKey - Property key to filter by
     * @param {string} propertyValue - Property value to match
     * @param {string} matchType - Match type: 'exact', 'contains', 'starts', 'ends'
     * @returns {Array} Matching nodes
     */
    filterNodes(propertyKey, propertyValue, matchType = 'exact') {
        if (!propertyKey || !propertyValue) return this.nodes;
        
        const lowerValue = propertyValue.toLowerCase();
        
        return this.nodes.filter(node => {
            const nodePropValue = String(node.properties[propertyKey] || '').toLowerCase();
            
            switch (matchType) {
                case 'exact':
                    return nodePropValue === lowerValue;
                case 'contains':
                    return nodePropValue.includes(lowerValue);
                case 'starts':
                    return nodePropValue.startsWith(lowerValue);
                case 'ends':
                    return nodePropValue.endsWith(lowerValue);
                default:
                    return nodePropValue === lowerValue;
            }
        });
    }
}

// Export
window.Graph = Graph;