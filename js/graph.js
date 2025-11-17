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
     * @param {Object} properties - Node properties (must include 'name')
     * @returns {Promise<Object>} Created node
     */
    async addNode(properties = {}) {
        // Strip D3 properties before creating node
        const cleanProps = this.stripD3Properties(properties);
        
        const now = new Date().toISOString();
        
        // Generate ID from name using SHA256
        let nodeId;
        if (cleanProps.name) {
            nodeId = await Utils.generateSHA256(cleanProps.name);
        } else {
            // Fallback for nodes without name (backward compatibility)
            nodeId = cleanProps.id || Utils.generateId('node');
        }
        
        const node = {
            id: nodeId,
            name: cleanProps.name || nodeId,
            color: cleanProps.color || '#3498db',
            size: cleanProps.size || 10,
            description: cleanProps.description || '',
            category: cleanProps.category || '',
            subCat: cleanProps.subCat || '',
            link1: cleanProps.link1 || '',
            link2: cleanProps.link2 || '',
            link3: cleanProps.link3 || '',
            link4: cleanProps.link4 || '',
            priority: cleanProps.priority || 'Medium',
            deadline: cleanProps.deadline || '',
            userDate: cleanProps.userDate || '',
            createdDate: cleanProps.createdDate || now,
            modifiedDate: now,
            ...cleanProps
        };
        
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
     * Get a node by ID
     * @param {string} nodeId - ID of node to retrieve
     * @returns {Object|null} Node object or null
     */
    getNode(nodeId) {
        return this.nodes.find(n => n.id === nodeId) || null;
    }

    /**
     * Update node properties
     * @param {string} nodeId - ID of node to update
     * @param {Object} properties - Properties to update
     * @returns {boolean} Success
     */
    updateNode(nodeId, properties) {
        const node = this.getNode(nodeId);
        if (!node) return false;

        Object.assign(node, this.stripD3Properties(properties));
        node.modifiedDate = new Date().toISOString();
        this.updateModifiedDate();
        return true;
    }

    /**
     * Rename a node (updates ID based on new name)
     * @param {string} oldId - Current node ID
     * @param {string} newName - New node name
     * @returns {Promise<boolean>} Success
     */
    async renameNode(oldId, newName) {
        const node = this.getNode(oldId);
        if (!node) return false;

        // Generate new ID from new name
        const newId = await Utils.generateSHA256(newName);
        
        // Check if new ID already exists
        if (newId !== oldId && this.getNode(newId)) {
            throw new Error('A node with this name already exists');
        }

        // Update node
        node.id = newId;
        node.name = newName;
        node.modifiedDate = new Date().toISOString();

        // Update edges that reference this node
        this.edges.forEach(edge => {
            const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
            const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
            
            if (sourceId === oldId) {
                edge.source = newId;
            }
            if (targetId === oldId) {
                edge.target = newId;
            }
        });

        this.updateModifiedDate();
        return true;
    }

    /**
     * Add a new edge to the graph
     * @param {Object} properties - Edge properties (must include 'name', optionally 'source' and 'target')
     * @returns {Promise<Object>} Created edge
     */
    async addEdge(properties = {}) {
        // Strip D3 properties before creating edge
        const cleanProps = this.stripD3Properties(properties);
        
        // Generate ID from name using SHA256
        let edgeId;
        if (cleanProps.name) {
            edgeId = await Utils.generateSHA256(cleanProps.name);
        } else {
            // Fallback for edges without name (backward compatibility)
            edgeId = cleanProps.id || Utils.generateId('edge');
        }
        
        const edge = {
            id: edgeId,
            name: cleanProps.name || edgeId,
            source: cleanProps.source || null,
            target: cleanProps.target || null,
            description: cleanProps.description || '',
            relationship: cleanProps.relationship || 'is a subset of',
            color: cleanProps.color || '#95a5a6',
            weight: cleanProps.weight || 1,
            directed: cleanProps.directed !== undefined ? cleanProps.directed : true,
            ...cleanProps
        };
        
        this.edges.push(edge);
        this.updateModifiedDate();
        return edge;
    }

    /**
     * Remove an edge
     * @param {string} edgeId - ID of edge to remove
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
     * Get an edge by ID
     * @param {string} edgeId - ID of edge to retrieve
     * @returns {Object|null} Edge object or null
     */
    getEdge(edgeId) {
        return this.edges.find(e => e.id === edgeId) || null;
    }

    /**
     * Update edge properties
     * @param {string} edgeId - ID of edge to update
     * @param {Object} properties - Properties to update
     * @returns {boolean} Success
     */
    updateEdge(edgeId, properties) {
        const edge = this.getEdge(edgeId);
        if (!edge) return false;

        Object.assign(edge, this.stripD3Properties(properties));
        this.updateModifiedDate();
        return true;
    }

    /**
     * Rename an edge (updates ID based on new name)
     * @param {string} oldId - Current edge ID
     * @param {string} newName - New edge name
     * @returns {Promise<boolean>} Success
     */
    async renameEdge(oldId, newName) {
        const edge = this.getEdge(oldId);
        if (!edge) return false;

        // Generate new ID from new name
        const newId = await Utils.generateSHA256(newName);
        
        // Check if new ID already exists
        if (newId !== oldId && this.getEdge(newId)) {
            throw new Error('An edge with this name already exists');
        }

        // Update edge
        edge.id = newId;
        edge.name = newName;

        this.updateModifiedDate();
        return true;
    }

    /**
     * Change edge endpoint
     * @param {string} edgeId - Edge ID
     * @param {string} endpoint - 'source' or 'target'
     * @param {string|null} nodeId - New node ID (null for free end)
     * @returns {boolean} Success
     */
    changeEdgeEndpoint(edgeId, endpoint, nodeId) {
        const edge = this.getEdge(edgeId);
        if (!edge) return false;

        if (endpoint !== 'source' && endpoint !== 'target') return false;

        // If nodeId is provided, validate it exists
        if (nodeId && !this.getNode(nodeId)) return false;

        edge[endpoint] = nodeId;
        this.updateModifiedDate();
        return true;
    }

    /**
     * Break edge at a point, creating a new node
     * @param {string} edgeId - Edge to break
     * @param {string} endpoint - 'source' or 'target' (which end to disconnect)
     * @param {number} x - X position for new free end
     * @param {number} y - Y position for free end
     * @returns {Promise<boolean>} Success
     */
    async breakEdge(edgeId, endpoint, x, y) {
        const edge = this.getEdge(edgeId);
        if (!edge) return false;

        // Simply set the endpoint to null (free end)
        edge[endpoint] = null;
        
        // Store free end position on edge
        if (endpoint === 'source') {
            edge.freeSourceX = x;
            edge.freeSourceY = y;
        } else {
            edge.freeTargetX = x;
            edge.freeTargetY = y;
        }

        this.updateModifiedDate();
        return true;
    }

    /**
     * Break edge and create intermediate node with two new edges
     * @param {string} edgeId - Edge to break
     * @param {number} x - X position for new node
     * @param {number} y - Y position for new node
     * @returns {Promise<Object>} Object with new node and edges
     */
    async breakEdgeWithNode(edgeId, x, y) {
        const edge = this.getEdge(edgeId);
        if (!edge) return null;

        const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
        const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;

        // Generate unique name for intermediate node
        const timestamp = Date.now();
        const intermediateName = `intermediate_${timestamp}`;
        
        // Create intermediate node
        const intermediateNode = await this.addNode({
            name: intermediateName,
            x: x,
            y: y,
            fx: x,
            fy: y,
            color: edge.color,
            size: 8,
            description: `Intermediate node created from edge ${edge.name || edge.id}`
        });

        // Create two new edges
        const edge1Name = `${edge.name || 'edge'}_part1`;
        const edge2Name = `${edge.name || 'edge'}_part2`;
        
        const edge1 = await this.addEdge({
            name: edge1Name,
            source: sourceId,
            target: intermediateNode.id,
            relationship: edge.relationship,
            color: edge.color,
            weight: edge.weight,
            directed: edge.directed,
            description: edge.description
        });

        const edge2 = await this.addEdge({
            name: edge2Name,
            source: intermediateNode.id,
            target: targetId,
            relationship: edge.relationship,
            color: edge.color,
            weight: edge.weight,
            directed: edge.directed,
            description: edge.description
        });

        // Remove original edge
        this.removeEdge(edgeId);

        return {
            node: intermediateNode,
            edges: [edge1, edge2]
        };
    }

    /**
     * Merge duplicate nodes
     * @param {string} keepId - ID of node to keep
     * @param {string} deleteId - ID of node to delete
     * @returns {boolean} Success
     */
    mergeNodes(keepId, deleteId) {
        if (keepId === deleteId) return false;
        
        const keepNode = this.getNode(keepId);
        const deleteNode = this.getNode(deleteId);
        
        if (!keepNode || !deleteNode) return false;

        // Transfer edges from deleted node to kept node
        this.edges.forEach(edge => {
            const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
            const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
            
            if (sourceId === deleteId) {
                edge.source = keepId;
            }
            if (targetId === deleteId) {
                edge.target = keepId;
            }
        });

        // Remove duplicate edges (same source and target)
        const edgeSet = new Set();
        const uniqueEdges = [];
        
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
     * Get all unique edge relationships (replaces getAllEdgeTypes)
     * @returns {Array} Unique edge relationships
     */
    getAllEdgeRelationships() {
        const relationships = new Set();
        this.edges.forEach(edge => {
            if (edge.relationship) {
                relationships.add(edge.relationship);
            }
        });
        return Array.from(relationships).sort();
    }

    /**
     * Get all unique edge names
     * @returns {Array} Unique edge names
     */
    getAllEdgeNames() {
        const names = new Set();
        this.edges.forEach(edge => {
            if (edge.name) {
                names.add(edge.name);
            }
        });
        return Array.from(names).sort();
    }

    /**
     * Get all node IDs for dropdowns
     * @returns {Array} Array of node IDs
     */
    getAllNodeIds() {
        return this.nodes.map(node => node.id);
    }

    /**
     * Get all node names for dropdowns
     * @returns {Array} Array of node names
     */
    getAllNodeNames() {
        return this.nodes.map(node => node.name || node.id);
    }
	/**
	 * Search nodes by query (searches in name, description, category)
	 * @param {string} query - Search query
	 * @returns {Array} Matching nodes
	 */
	searchNodes(query) {
		if (!query || query.trim() === '') {
			return [];
		}

		const lowerQuery = query.toLowerCase().trim();

		return this.nodes.filter(node => {
			// Search in name
			if (node.name && node.name.toLowerCase().includes(lowerQuery)) {
				return true;
			}

			// Search in description
			if (node.description && node.description.toLowerCase().includes(lowerQuery)) {
				return true;
			}

			// Search in category
			if (node.category && node.category.toLowerCase().includes(lowerQuery)) {
				return true;
			}

			// Search in subCat
			if (node.subCat && node.subCat.toLowerCase().includes(lowerQuery)) {
				return true;
			}

			// Search in id
			if (node.id && node.id.toLowerCase().includes(lowerQuery)) {
				return true;
			}

			return false;
		});
	}

	/**
	 * Filter nodes by property value
	 * @param {string} propertyKey - Property name to filter by
	 * @param {string} propertyValue - Value to match
	 * @param {string} matchType - Match type: 'exact', 'contains', 'starts', 'ends'
	 * @returns {Array} Matching nodes
	 */
	filterNodes(propertyKey, propertyValue, matchType = 'exact') {
		if (!propertyKey || !propertyValue) {
			return [];
		}

		const lowerValue = propertyValue.toLowerCase();

		return this.nodes.filter(node => {
			const nodeValue = node[propertyKey];
			
			if (nodeValue === undefined || nodeValue === null) {
				return false;
			}

			const lowerNodeValue = String(nodeValue).toLowerCase();

			switch (matchType) {
				case 'exact':
					return lowerNodeValue === lowerValue;
				case 'contains':
					return lowerNodeValue.includes(lowerValue);
				case 'starts':
					return lowerNodeValue.startsWith(lowerValue);
				case 'ends':
					return lowerNodeValue.endsWith(lowerValue);
				default:
					return lowerNodeValue === lowerValue;
			}
		});
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
            const nodeData = this.stripD3Properties(node);
            return nodeData;
        });

        const cleanEdges = this.edges.map(edge => {
            const edgeData = this.stripD3Properties(edge);
            
            // Convert source/target object references to IDs
            edgeData.source = typeof edge.source === 'object' ? edge.source.id : edge.source;
            edgeData.target = typeof edge.target === 'object' ? edge.target.id : edge.target;
            
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
            
            // Load settings
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
                if (!node.id) return false;
                
                // Clean D3 properties if they exist
                const cleaned = this.stripD3Properties(node);
                Object.assign(node, cleaned);
                
                // Ensure required properties exist
                node.name = node.name || node.id;
                node.color = node.color || '#3498db';
                node.size = node.size || 10;
                node.description = node.description || '';
                node.category = node.category || '';
                node.subCat = node.subCat || '';
                node.link1 = node.link1 || '';
                node.link2 = node.link2 || '';
                node.link3 = node.link3 || '';
                node.link4 = node.link4 || '';
                
                // Ensure date/priority properties exist
                const now = new Date().toISOString();
                node.priority = node.priority || 'Medium';
                node.deadline = node.deadline || '';
                node.userDate = node.userDate || '';
                node.createdDate = node.createdDate || now;
                node.modifiedDate = node.modifiedDate || now;
                
                return true;
            });

            // Validate edges and clean D3 properties
            this.edges = this.edges.filter(edge => {
                if (!edge.id) return false;
                
                // Half-edges are allowed (source or target can be null)
                if (!edge.source && !edge.target) return false;
                
                // Check if connected nodes exist
                if (edge.source && !this.getNode(edge.source)) return false;
                if (edge.target && !this.getNode(edge.target)) return false;
                
                // Clean D3 properties if they exist
                const cleaned = this.stripD3Properties(edge);
                Object.assign(edge, cleaned);
                
                // Ensure required properties exist
                edge.name = edge.name || edge.id;
                edge.relationship = edge.relationship || '';
                edge.color = edge.color || '#95a5a6';
                edge.weight = edge.weight || 1;
                edge.directed = edge.directed !== undefined ? edge.directed : true;
                edge.description = edge.description || '';
                
                return true;
            });

            return true;
        } catch (error) {
            console.error('Error loading graph:', error);
            return false;
        }
    }
}

// Export for use in other modules
window.Graph = Graph;