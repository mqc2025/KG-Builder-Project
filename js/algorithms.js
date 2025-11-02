// Graph Algorithms

const Algorithms = {
    /**
     * Find shortest path using Dijkstra's algorithm
     * @param {Graph} graph - Graph instance
     * @param {string} startId - Start node ID
     * @param {string} endId - End node ID
     * @returns {Object|null} Path info with nodes and edges, or null
     */
    findShortestPath(graph, startId, endId) {
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
                if (edge.source === currentId) {
                    neighborId = edge.target;
                } else if (edge.target === currentId && !edge.properties.directed) {
                    neighborId = edge.source;
                }

                if (neighborId && unvisited.has(neighborId)) {
                    const weight = edge.properties.weight || 1;
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
     * Cluster nodes by property value
     * @param {Graph} graph - Graph instance
     * @param {string} propertyKey - Property to cluster by
     * @returns {Object} Clusters map
     */
    clusterByProperty(graph, propertyKey) {
        const clusters = {};

        graph.nodes.forEach(node => {
            const value = node.properties[propertyKey];
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
                const neighbors = graph.getNeighbors(nodeId);
                
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
     * Calculate centrality measures
     * @param {Graph} graph - Graph instance
     * @param {string} nodeId - Node ID
     * @returns {Object} Centrality measures
     */
    calculateCentrality(graph, nodeId) {
        const node = graph.getNode(nodeId);
        if (!node) return null;

        const edges = graph.getNodeEdges(nodeId);
        const neighbors = graph.getNeighbors(nodeId);

        return {
            degree: edges.length,
            neighbors: neighbors.length,
            inDegree: edges.filter(e => e.target === nodeId).length,
            outDegree: edges.filter(e => e.source === nodeId).length
        };
    },

    /**
     * Find all simple paths between two nodes (DFS)
     * @param {Graph} graph - Graph instance
     * @param {string} startId - Start node ID
     * @param {string} endId - End node ID
     * @param {number} maxPaths - Maximum paths to find
     * @returns {Array} Array of paths
     */
    findAllPaths(graph, startId, endId, maxPaths = 10) {
        const paths = [];
        const visited = new Set();

        function dfs(currentId, path) {
            if (paths.length >= maxPaths) return;
            
            if (currentId === endId) {
                paths.push([...path]);
                return;
            }

            visited.add(currentId);

            const neighbors = graph.getNeighbors(currentId);
            for (const neighborId of neighbors) {
                if (!visited.has(neighborId)) {
                    path.push(neighborId);
                    dfs(neighborId, path);
                    path.pop();
                }
            }

            visited.delete(currentId);
        }

        dfs(startId, [startId]);
        return paths;
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
                const existingEdge = graph.edges.find(e =>
                    (e.source === node1.id && e.target === node2.id) ||
                    (e.source === node2.id && e.target === node1.id)
                );
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
        const props1 = node1.properties;
        const props2 = node2.properties;

        const allKeys = new Set([
            ...Object.keys(props1),
            ...Object.keys(props2)
        ]);

        let matches = 0;
        let total = 0;

        for (const key of allKeys) {
            // Skip special properties
            if (['color', 'size', 'x', 'y', 'vx', 'vy'].includes(key)) continue;

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
