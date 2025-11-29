/**
 * ExplodeGraph - Converts nodes and edges into ontological structure
 */
class ExplodeGraph {
    constructor(graph) {
        this.graph = graph;
    }

    /**
     * Main explode method - transforms the current graph
     * @returns {Object} New graph structure with exploded nodes and edges
     */
    explode() {
        const newNodes = [];
        const newEdges = [];
        const createdNodes = new Set(); // Track already created meta-nodes
        
        // Keep original nodes but strip their cat, subCat, and custom properties
        const originalNodes = JSON.parse(JSON.stringify(this.graph.nodes));
        
        // Process each original node
        originalNodes.forEach(node => {
            const cleanNode = this.stripNodeProperties(node);
            newNodes.push(cleanNode);
            
            // Process category
            if (node.category && node.category.trim()) {
                this.processCategoryProperty(node, newNodes, newEdges, createdNodes);
            }
            
            // Process sub-category
            if (node.subCat && node.subCat.trim()) {
                this.processSubCategoryProperty(node, newNodes, newEdges, createdNodes);
            }
            
            // Process custom properties
            this.processCustomProperties(node, newNodes, newEdges, createdNodes);
        });
        
        // Process edges
        const originalEdges = JSON.parse(JSON.stringify(this.graph.edges));
        originalEdges.forEach(edge => {
            this.processEdgeCustomProperties(edge, newNodes, newEdges, createdNodes);
        });
        
        return {
            nodes: newNodes,
            edges: newEdges
        };
    }

    /**
     * Strip category, subCat, and custom properties from node
     */
    stripNodeProperties(node) {
        const standardProps = ['id', 'name', 'x', 'y', 'fx', 'fy', 'color', 'size', 
                              'description', 'link1', 'link2', 'link3', 'link4',
                              'priority', 'deadline', 'userDate', 'createdDate', 'modifiedDate', 'icon'];
        
        const cleanNode = {};
        standardProps.forEach(prop => {
            if (node.hasOwnProperty(prop)) {
                cleanNode[prop] = node[prop];
            }
        });
        
        // Clear category and subCat
        cleanNode.category = '';
        cleanNode.subCat = '';
        
        return cleanNode;
    }

    /**
     * Get custom properties from node (excluding standard properties)
     */
    getCustomProperties(nodeOrEdge) {
        const standardProps = ['id', 'name', 'x', 'y', 'fx', 'fy', 'vx', 'vy', 'index',
                              'source', 'target', 'sourceX', 'sourceY', 'targetX', 'targetY',
                              'color', 'size', 'description', 'relationship', 'weight', 'directed', 
                              'category', 'subCat', 'link1', 'link2', 'link3', 'link4',
                              'priority', 'deadline', 'userDate', 'createdDate', 'modifiedDate',
                              'freeSourceX', 'freeSourceY', 'freeTargetX', 'freeTargetY', 'icon'];
        
        const customProps = {};
        Object.entries(nodeOrEdge).forEach(([key, value]) => {
            if (!standardProps.includes(key) && !key.startsWith('_') && !key.startsWith('merged_')) {
                customProps[key] = value;
            }
        });
        
        return customProps;
    }

    /**
     * Create a meta-node if it doesn't exist
     */
    createMetaNode(id, name, color, createdNodes) {
        if (!createdNodes.has(id)) {
            createdNodes.add(id);
            return {
                id: id,
                name: name,
                color: color,
                size: 10,
                description: `Meta-node: ${name}`,
                category: '',
                subCat: ''
            };
        }
        return null;
    }

    /**
     * Process category property
     */
    processCategoryProperty(node, newNodes, newEdges, createdNodes) {
        const catValue = node.category.trim();
        
        // Create "cat" meta-node
        const catMetaNode = this.createMetaNode('cat', 'cat', '#9b59b6', createdNodes);
        if (catMetaNode) newNodes.push(catMetaNode);
        
        // Create category value node
        const catValueNode = this.createMetaNode(catValue, catValue, '#f39c12', createdNodes);
        if (catValueNode) newNodes.push(catValueNode);
        
        // Create edges: "catValue -is a-> cat"
        newEdges.push({
            id: `e_${catValue}_is_a_cat`,
            source: catValue,
            target: 'cat',
            relationship: 'is a',
            color: '#95a5a6',
            weight: 1,
            directed: true
        });
        
        // Create edge: "node -is-> catValue"
        newEdges.push({
            id: `e_${node.id}_is_${catValue}`,
            source: node.id,
            target: catValue,
            relationship: 'is',
            color: '#95a5a6',
            weight: 1,
            directed: true
        });
    }

    /**
     * Process sub-category property
     */
    processSubCategoryProperty(node, newNodes, newEdges, createdNodes) {
        const subCatValue = node.subCat.trim();
        
        // Create "sub-cat" meta-node
        const subCatMetaNode = this.createMetaNode('sub-cat', 'sub-cat', '#9b59b6', createdNodes);
        if (subCatMetaNode) newNodes.push(subCatMetaNode);
        
        // Create sub-category value node
        const subCatValueNode = this.createMetaNode(subCatValue, subCatValue, '#f39c12', createdNodes);
        if (subCatValueNode) newNodes.push(subCatValueNode);
        
        // Create edges: "subCatValue -is a-> sub-cat"
        newEdges.push({
            id: `e_${subCatValue}_is_a_subcat`,
            source: subCatValue,
            target: 'sub-cat',
            relationship: 'is a',
            color: '#95a5a6',
            weight: 1,
            directed: true
        });
        
        // Create edge: "node -is-> subCatValue"
        newEdges.push({
            id: `e_${node.id}_is_${subCatValue}`,
            source: node.id,
            target: subCatValue,
            relationship: 'is',
            color: '#95a5a6',
            weight: 1,
            directed: true
        });
        
        // Create edge: "sub-cat -is-> cat" (if cat exists)
        if (!createdNodes.has('e_subcat_is_cat')) {
            createdNodes.add('e_subcat_is_cat');
            newEdges.push({
                id: 'e_subcat_is_cat',
                source: 'sub-cat',
                target: 'cat',
                relationship: 'is',
                color: '#95a5a6',
                weight: 1,
                directed: true
            });
        }
    }

    /**
     * Process custom properties of a node
     */
    processCustomProperties(node, newNodes, newEdges, createdNodes) {
        const customProps = this.getCustomProperties(node);
        
        if (Object.keys(customProps).length === 0) return;
        
        // Create "Properties" meta-node
        const propsMetaNode = this.createMetaNode('Properties', 'Properties', '#e74c3c', createdNodes);
        if (propsMetaNode) newNodes.push(propsMetaNode);
        
        // Process each custom property
        Object.entries(customProps).forEach(([key, value]) => {
            const valueStr = String(value).trim();
            if (!valueStr) return;
            
            // Create property type node (key)
            const propTypeNode = this.createMetaNode(key, key, '#e67e22', createdNodes);
            if (propTypeNode) newNodes.push(propTypeNode);
            
            // Create property value node
            const propValueNode = this.createMetaNode(valueStr, valueStr, '#16a085', createdNodes);
            if (propValueNode) newNodes.push(propValueNode);
            
            // Create edges
            // "node -has-> value"
            newEdges.push({
                id: `e_${node.id}_has_${valueStr}`,
                source: node.id,
                target: valueStr,
                relationship: 'has',
                color: '#95a5a6',
                weight: 1,
                directed: true
            });
            
            // "value -is a-> type"
            newEdges.push({
                id: `e_${valueStr}_is_a_${key}`,
                source: valueStr,
                target: key,
                relationship: 'is a',
                color: '#95a5a6',
                weight: 1,
                directed: true
            });
            
            // "type -is a-> Properties"
            newEdges.push({
                id: `e_${key}_is_a_Properties`,
                source: key,
                target: 'Properties',
                relationship: 'is a',
                color: '#95a5a6',
                weight: 1,
                directed: true
            });
        });
    }

    /**
     * Process custom properties of an edge
     */
    processEdgeCustomProperties(edge, newNodes, newEdges, createdNodes) {
        const customProps = this.getCustomProperties(edge);
        
        if (Object.keys(customProps).length === 0) return;
        
        const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
        const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
        
        // Create "Properties" meta-node
        const propsMetaNode = this.createMetaNode('Properties', 'Properties', '#e74c3c', createdNodes);
        if (propsMetaNode) newNodes.push(propsMetaNode);
        
        // Process each custom property
        Object.entries(customProps).forEach(([key, value]) => {
            const valueStr = String(value).trim();
            if (!valueStr) return;
            
            // Create property type node (key)
            const propTypeNode = this.createMetaNode(key, key, '#e67e22', createdNodes);
            if (propTypeNode) newNodes.push(propTypeNode);
            
            // Create property value node
            const propValueNode = this.createMetaNode(valueStr, valueStr, '#16a085', createdNodes);
            if (propValueNode) newNodes.push(propValueNode);
            
            // Create edges
            // "source -is related to-> value"
            newEdges.push({
                id: `e_${sourceId}_related_${valueStr}`,
                source: sourceId,
                target: valueStr,
                relationship: 'is related to',
                color: '#95a5a6',
                weight: 1,
                directed: false
            });
            
            // "target -is related to-> value"
            newEdges.push({
                id: `e_${targetId}_related_${valueStr}`,
                source: targetId,
                target: valueStr,
                relationship: 'is related to',
                color: '#95a5a6',
                weight: 1,
                directed: false
            });
            
            // "value -is-> type"
            newEdges.push({
                id: `e_${valueStr}_is_${key}`,
                source: valueStr,
                target: key,
                relationship: 'is',
                color: '#95a5a6',
                weight: 1,
                directed: true
            });
            
            // "type -is-> Properties"
            newEdges.push({
                id: `e_${key}_is_Properties`,
                source: key,
                target: 'Properties',
                relationship: 'is',
                color: '#95a5a6',
                weight: 1,
                directed: true
            });
        });
    }

    /**
     * Show confirmation dialog and perform explode
     */
    static showExplodeDialog(app) {
        const message = `🔥 EXPLODE GRAPH TRANSFORMATION 🔥

This will transform your graph into an ontological structure by:

FOR NODES:
- Converting "category" values → new nodes linked via "is a" to "cat" meta-node
- Converting "sub-cat" values → new nodes linked via "is a" to "sub-cat" meta-node
- Converting custom properties (key:value) → property type and value nodes linked via "has" and "is a" relationships
- Linking "sub-cat" → "cat"

FOR EDGES:
- Converting edge custom properties (key:value) → property nodes
- Creating "is related to" connections from both source and target nodes to property values

⚠️ This operation cannot be easily undone. Consider saving your current graph first.

Do you want to proceed?`;

        if (confirm(message)) {
            try {
                const exploder = new ExplodeGraph(app.graph);
                const result = exploder.explode();
                
                // Replace current graph with exploded version
                app.graph.nodes = result.nodes;
                app.graph.edges = result.edges;
                
                // Update metadata
                app.graph.metadata.modified = Utils.getCurrentDate();
                app.graph.metadata.description = (app.graph.metadata.description || '') + 
                    ' [Exploded on ' + Utils.getCurrentDate() + ']';
                
                // Reinitialize visualization
                app.renderer.render();
                
                alert('✅ Graph successfully exploded!\n\n' +
                      `Nodes: ${result.nodes.length}\n` +
                      `Edges: ${result.edges.length}`);
                
            } catch (error) {
                console.error('Explode error:', error);
                alert('❌ Error during explosion: ' + error.message);
            }
        }
    }
}