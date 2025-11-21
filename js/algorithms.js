// Graph Algorithms

const Algorithms = {
    /**
     * Find shortest path using Dijkstra's algorithm
     * @param {Graph} graph - Graph instance
     * @param {string} startId - Start node ID
     * @param {string} endId - End node ID
     * @param {boolean} ignoreDirection - If true, treat all edges as undirected
     * @returns {Object|null} Path info with nodes and edges, or null
     */
    findShortestPath(graph, startId, endId, ignoreDirection = false) {
        if (!graph.getNode(startId) || !graph.getNode(endId)) {
            return null;
        }

        if (startId === endId) {
            return {
                nodes: [startId],
                edges: [],
                distance: 0
            };
        }

        const distances = {};
        const previous = {};
        const unvisited = new Set();

        // Initialize
        graph.nodes.forEach(node => {
            distances[node.id] = Infinity;
            previous[node.id] = null;
            unvisited.add(node.id);
        });
        distances[startId] = 0;

        while (unvisited.size > 0) {
            // Find unvisited node with minimum distance
            let currentId = null;
            let minDistance = Infinity;
            for (const nodeId of unvisited) {
                if (distances[nodeId] < minDistance) {
                    minDistance = distances[nodeId];
                    currentId = nodeId;
                }
            }

            if (currentId === null || distances[currentId] === Infinity) {
                break; // No path exists
            }

            unvisited.delete(currentId);

            // Check if we reached the end
            if (currentId === endId) {
                break;
            }

            // Update distances to neighbors
            graph.edges.forEach(edge => {
                let neighborId = null;
                
                // Handle edge direction
                if (edge.source === currentId) {
                    neighborId = edge.target;
                } else if (ignoreDirection && edge.target === currentId) {
                    // If ignoring direction, allow traversal in reverse
                    neighborId = edge.source;
                } else if (!edge.directed && edge.target === currentId) {
                    // Undirected edges can be traversed both ways
                    neighborId = edge.source;
                }

                if (neighborId && unvisited.has(neighborId)) {
                    const weight = edge.weight || 1;
                    const newDistance = distances[currentId] + weight;

                    if (newDistance < distances[neighborId]) {
                        distances[neighborId] = newDistance;
                        previous[neighborId] = {
                            nodeId: currentId,
                            edgeId: edge.id
                        };
                    }
                }
            });
        }

        // Reconstruct path
        if (distances[endId] === Infinity) {
            return null; // No path found
        }

        const pathNodes = [];
        const pathEdges = [];
        let currentId = endId;

        while (currentId !== null) {
            pathNodes.unshift(currentId);
            if (previous[currentId]) {
                pathEdges.unshift(previous[currentId].edgeId);
                currentId = previous[currentId].nodeId;
            } else {
                currentId = null;
            }
        }

        return {
            nodes: pathNodes,
            edges: pathEdges,
            distance: distances[endId]
        };
    },

    /**
     * Find ALL simple paths between two nodes (no repeated nodes)
     * @param {Graph} graph - Graph instance
     * @param {string} startId - Start node ID
     * @param {string} endId - End node ID
     * @param {boolean} ignoreDirection - If true, treat all edges as undirected
     * @returns {Array} Array of path objects sorted by length
     */
    findAllPaths(graph, startId, endId, ignoreDirection = false) {
        if (!graph.getNode(startId) || !graph.getNode(endId)) {
            return [];
        }

        if (startId === endId) {
            return [{
                nodes: [startId],
                edges: [],
                distance: 0,
                length: 0
            }];
        }

        const allPaths = [];
        const visited = new Set();

        // Build adjacency map for faster lookup
        const adjacency = {};
        graph.nodes.forEach(node => {
            adjacency[node.id] = [];
        });

        graph.edges.forEach(edge => {
            const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
            const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;

            if (!sourceId || !targetId) return; // Skip half-edges

            // Add forward direction
            if (!adjacency[sourceId]) adjacency[sourceId] = [];
            adjacency[sourceId].push({
                nodeId: targetId,
                edgeId: edge.id,
                weight: edge.weight || 1
            });

            // Add reverse direction if ignoring direction or edge is undirected
            if (ignoreDirection || !edge.directed) {
                if (!adjacency[targetId]) adjacency[targetId] = [];
                adjacency[targetId].push({
                    nodeId: sourceId,
                    edgeId: edge.id,
                    weight: edge.weight || 1
                });
            }
        });

        // DFS to find all paths
        function dfs(currentId, path, edges, distance) {
            if (currentId === endId) {
                allPaths.push({
                    nodes: [...path],
                    edges: [...edges],
                    distance: distance,
                    length: path.length - 1
                });
                return;
            }

            visited.add(currentId);

            const neighbors = adjacency[currentId] || [];
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor.nodeId)) {
                    path.push(neighbor.nodeId);
                    edges.push(neighbor.edgeId);
                    dfs(neighbor.nodeId, path, edges, distance + neighbor.weight);
                    path.pop();
                    edges.pop();
                }
            }

            visited.delete(currentId);
        }

        dfs(startId, [startId], [], 0);

        // Sort by length (number of hops), then by distance
        allPaths.sort((a, b) => {
            if (a.length !== b.length) {
                return a.length - b.length;
            }
            return a.distance - b.distance;
        });

        return allPaths;
    },

    /**
     * Cluster nodes by property value
     * @param {Graph} graph - Graph instance
     * @param {string} propertyKey - Property to cluster by
     * @returns {Object} Clusters map
     */
    clusterByProperty(graph, propertyKey) {
        const clusters = {};

        graph.nodes.forEach(node => {
            const value = node.properties ? node.properties[propertyKey] : node[propertyKey];
            const key = value !== undefined ? String(value) : 'undefined';

            if (!clusters[key]) {
                clusters[key] = [];
            }
            clusters[key].push(node.id);
        });

        return clusters;
    },

    /**
     * Detect communities using simple label propagation
     * @param {Graph} graph - Graph instance
     * @param {number} maxIterations - Maximum iterations
     * @returns {Object} Community assignments
     */
    detectCommunities(graph, maxIterations = 10) {
        const labels = {};
        
        // Initialize each node with its own label
        graph.nodes.forEach(node => {
            labels[node.id] = node.id;
        });

        let changed = true;
        let iteration = 0;

        while (changed && iteration < maxIterations) {
            changed = false;
            iteration++;

            // Randomize node order
            const nodeIds = graph.nodes.map(n => n.id).sort(() => Math.random() - 0.5);

            for (const nodeId of nodeIds) {
                const neighbors = this.getNeighbors(graph, nodeId);
                
                if (neighbors.length === 0) continue;

                // Count neighbor labels
                const labelCounts = {};
                neighbors.forEach(neighborId => {
                    const label = labels[neighborId];
                    labelCounts[label] = (labelCounts[label] || 0) + 1;
                });

                // Find most common label
                let maxCount = 0;
                let maxLabel = labels[nodeId];
                for (const [label, count] of Object.entries(labelCounts)) {
                    if (count > maxCount) {
                        maxCount = count;
                        maxLabel = label;
                    }
                }

                // Update label if changed
                if (labels[nodeId] !== maxLabel) {
                    labels[nodeId] = maxLabel;
                    changed = true;
                }
            }
        }

        // Group nodes by community
        const communities = {};
        for (const [nodeId, label] of Object.entries(labels)) {
            if (!communities[label]) {
                communities[label] = [];
            }
            communities[label].push(nodeId);
        }

        return communities;
    },

    /**
     * Get neighbors of a node
     * @param {Graph} graph - Graph instance
     * @param {string} nodeId - Node ID
     * @returns {Array} Array of neighbor node IDs
     */
    getNeighbors(graph, nodeId) {
        const neighbors = new Set();
        
        graph.edges.forEach(edge => {
            const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
            const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
            
            if (sourceId === nodeId && targetId) {
                neighbors.add(targetId);
            }
            if (targetId === nodeId && sourceId && !edge.directed) {
                neighbors.add(sourceId);
            }
        });
        
        return Array.from(neighbors);
    },

    /**
     * Calculate centrality measures
     * @param {Graph} graph - Graph instance
     * @param {string} nodeId - Node ID
     * @returns {Object} Centrality measures
     */
    calculateCentrality(graph, nodeId) {
        const node = graph.getNode(nodeId);
        if (!node) return null;

        const edges = graph.edges.filter(e => {
            const sourceId = typeof e.source === 'object' ? e.source.id : e.source;
            const targetId = typeof e.target === 'object' ? e.target.id : e.target;
            return sourceId === nodeId || targetId === nodeId;
        });

        const neighbors = this.getNeighbors(graph, nodeId);

        return {
            degree: edges.length,
            neighbors: neighbors.length,
            inDegree: edges.filter(e => {
                const targetId = typeof e.target === 'object' ? e.target.id : e.target;
                return targetId === nodeId;
            }).length,
            outDegree: edges.filter(e => {
                const sourceId = typeof e.source === 'object' ? e.source.id : e.source;
                return sourceId === nodeId;
            }).length
        };
    },

    /**
     * Suggest edges based on node similarity
     * @param {Graph} graph - Graph instance
     * @param {number} threshold - Similarity threshold (0-1)
     * @returns {Array} Suggested edges
     */
    suggestEdges(graph, threshold = 0.5) {
        const suggestions = [];

        for (let i = 0; i < graph.nodes.length; i++) {
            for (let j = i + 1; j < graph.nodes.length; j++) {
                const node1 = graph.nodes[i];
                const node2 = graph.nodes[j];

                // Skip if edge already exists
                const existingEdge = graph.edges.find(e => {
                    const sourceId = typeof e.source === 'object' ? e.source.id : e.source;
                    const targetId = typeof e.target === 'object' ? e.target.id : e.target;
                    return (sourceId === node1.id && targetId === node2.id) ||
                           (sourceId === node2.id && targetId === node1.id);
                });
                if (existingEdge) continue;

                // Calculate similarity
                const similarity = this.calculateSimilarity(node1, node2);

                if (similarity >= threshold) {
                    suggestions.push({
                        source: node1.id,
                        target: node2.id,
                        similarity,
                        reason: `${(similarity * 100).toFixed(0)}% property match`
                    });
                }
            }
        }

        return suggestions.sort((a, b) => b.similarity - a.similarity);
    },

    /**
     * Calculate similarity between two nodes
     * @param {Object} node1 - First node
     * @param {Object} node2 - Second node
     * @returns {number} Similarity score (0-1)
     */
    calculateSimilarity(node1, node2) {
        const props1 = node1.properties || node1;
        const props2 = node2.properties || node2;

        const allKeys = new Set([
            ...Object.keys(props1),
            ...Object.keys(props2)
        ]);

        let matches = 0;
        let total = 0;

        for (const key of allKeys) {
            // Skip special properties
            if (['color', 'size', 'x', 'y', 'vx', 'vy', 'fx', 'fy', 'id', 'name'].includes(key)) continue;

            total++;

            const val1 = String(props1[key] || '').toLowerCase();
            const val2 = String(props2[key] || '').toLowerCase();

            if (val1 === val2) {
                matches++;
            } else if (val1 && val2 && (val1.includes(val2) || val2.includes(val1))) {
                matches += 0.5;
            }
        }

        return total > 0 ? matches / total : 0;
    }
};

// Export
window.Algorithms = Algorithms;