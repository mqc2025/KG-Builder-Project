/**
 * WorkflowManager - Handles workflow navigation and validation
 * 
 * Workflow Requirements:
 * - Start node: name="start" (case-insensitive), category="start-end", ONE outgoing "next" edge
 * - End node: name="end" (case-insensitive), category="start-end", ONE incoming "next" edge
 * - Task nodes: category="task", ONE incoming + ONE outgoing "next" edge
 * - Decision nodes: category="decision", ONE incoming + MULTIPLE outgoing "next" edges
 * - "next" edges: label="next" or relationship="next" (case-insensitive), directed=true
 */

class WorkflowManager {
    constructor(app) {
        this.app = app;
        this.currentNodeId = null;
        this.workflowChain = null;
        this.validationReport = null;
        this.navigationHistory = [];
        
        this.setupEventListeners();
    }

    /**
     * Setup event listeners for workflow modals
     */
    setupEventListeners() {
        // Main modal close buttons
        document.getElementById('workflow-close')?.addEventListener('click', () => this.close());
        document.getElementById('workflow-close-btn')?.addEventListener('click', () => this.close());
        
        // Validation details button
        document.getElementById('workflow-validation-details')?.addEventListener('click', () => {
            this.showValidationDetails();
        });
        
        // Validation modal close buttons
        document.getElementById('validation-close')?.addEventListener('click', () => {
            this.closeValidationDetails();
        });
        document.getElementById('validation-close-btn')?.addEventListener('click', () => {
            this.closeValidationDetails();
        });
        
        // Close on outside click
        document.getElementById('workflow-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'workflow-modal') {
                this.close();
            }
        });
        
        document.getElementById('workflow-validation-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'workflow-validation-modal') {
                this.closeValidationDetails();
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const workflowModal = document.getElementById('workflow-modal');
                const validationModal = document.getElementById('workflow-validation-modal');
                
                if (validationModal && !validationModal.classList.contains('hidden')) {
                    this.closeValidationDetails();
                } else if (workflowModal && !workflowModal.classList.contains('hidden')) {
                    this.close();
                }
            }
        });
    }

    /**
     * Main entry point - Open workflow navigator for a specific node
     * @param {string} nodeId - The node ID to start navigation from
     */
    openWorkflowNavigator(nodeId) {
        const node = this.app.graph.getNode(nodeId);
        
        if (!node) {
            alert('Node not found');
            return;
        }
        
        // Find workflow chain containing this node
        const chain = this.findWorkflowChain(nodeId);
        
        if (!chain || chain.length === 0) {
            alert('This node is not part of a workflow chain.\n\nWorkflow chains must be connected via edges with label="next" or relationship="next".');
            return;
        }
        
        // Validate workflow structure
        this.validationReport = this.validateWorkflowStructure(chain);
        this.workflowChain = chain;
        
        // Check if there are blocking errors
        if (this.validationReport.errors.length > 0) {
            alert(`Cannot open workflow navigator:\n\n${this.validationReport.errors.join('\n')}`);
            return;
        }
        
        // Initialize navigation
        this.currentNodeId = nodeId;
        this.navigationHistory = [nodeId];
        
        // Update display and show modal
        this.updateNavigatorDisplay();
        this.showModal();
        
        this.app.updateStatus(`Workflow navigator opened for: ${node.name || node.id}`);
    }

    /**
     * Find all nodes in the workflow chain containing the specified node
     * @param {string} startNodeId - Starting node ID
     * @returns {Array} Array of node objects in the chain
     */
    findWorkflowChain(startNodeId) {
        const visitedNodes = new Set();
        const chainNodes = [];
        const queue = [startNodeId];
        
        while (queue.length > 0) {
            const nodeId = queue.shift();
            
            if (visitedNodes.has(nodeId)) continue;
            visitedNodes.add(nodeId);
            
            const node = this.app.graph.getNode(nodeId);
            if (!node) continue;
            
            chainNodes.push(node);
            
            // Find all connected nodes via "next" edges (both directions)
            const edges = this.app.graph.edges;
            
            for (const edge of edges) {
                if (!this.isNextEdge(edge)) continue;
                
                // Check if this edge connects to our current node
                if (edge.source === nodeId || (typeof edge.source === 'object' && edge.source.id === nodeId)) {
                    const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
                    if (!visitedNodes.has(targetId)) {
                        queue.push(targetId);
                    }
                }
                
                if (edge.target === nodeId || (typeof edge.target === 'object' && edge.target.id === nodeId)) {
                    const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
                    if (!visitedNodes.has(sourceId)) {
                        queue.push(sourceId);
                    }
                }
            }
        }
        
        return chainNodes;
    }

    /**
     * Validate workflow structure and return comprehensive report
     * @param {Array} nodes - Array of nodes in the workflow chain
     * @returns {Object} Validation report
     */
    validateWorkflowStructure(nodes) {
        const report = {
            isValid: true,
            errors: [],
            warnings: [],
            workflowChain: nodes,
            disconnectedChains: [],
            startNode: null,
            endNode: null
        };
        
        // Find start and end nodes
        const startNode = this.identifyStartNode(nodes);
        const endNode = this.identifyEndNode(nodes);
        
        report.startNode = startNode;
        report.endNode = endNode;
        
        // Check for start node
        if (!startNode) {
            report.errors.push('❌ Missing start node: Workflow must have a node with name="start" and category="start-end"');
            report.isValid = false;
        }
        
        // Check for end node
        if (!endNode) {
            report.errors.push('❌ Missing end node: Workflow must have a node with name="end" and category="start-end"');
            report.isValid = false;
        }
        
        // Check for end→start connection (warning only)
        if (startNode && endNode) {
            const endToStartConnection = this.checkEndToStartConnection(startNode, endNode);
            if (endToStartConnection) {
                report.warnings.push(`⚠️ End node connects to start node: This creates a complete loop. Edge: "${endToStartConnection.name || endToStartConnection.id}"`);
            }
        }
        
        // Validate each node's connections
        for (const node of nodes) {
            const nodeValidation = this.validateNodeType(node);
            
            if (!nodeValidation.isValid) {
                report.errors.push(...nodeValidation.errors);
                report.warnings.push(...nodeValidation.warnings);
                report.isValid = false;
            } else if (nodeValidation.warnings.length > 0) {
                report.warnings.push(...nodeValidation.warnings);
            }
        }
        
        // Find disconnected chains
        const allNodes = this.app.graph.nodes;
        const processedNodeIds = new Set(nodes.map(n => n.id));
        const disconnectedChains = this.findDisconnectedChains(allNodes, processedNodeIds);
        
        if (disconnectedChains.length > 0) {
            report.disconnectedChains = disconnectedChains;
            report.warnings.push(`⚠️ Found ${disconnectedChains.length} disconnected workflow chain(s) - See validation details`);
        }
        
        return report;
    }

    /**
     * Identify the start node in the workflow
     * @param {Array} nodes - Array of nodes
     * @returns {Object|null} Start node or null
     */
    identifyStartNode(nodes) {
        return nodes.find(node => 
            node.name && 
            node.name.toLowerCase() === 'start' && 
            node.category && 
            node.category.toLowerCase() === 'start-end'
        ) || null;
    }

    /**
     * Identify the end node in the workflow
     * @param {Array} nodes - Array of nodes
     * @returns {Object|null} End node or null
     */
    identifyEndNode(nodes) {
        return nodes.find(node => 
            node.name && 
            node.name.toLowerCase() === 'end' && 
            node.category && 
            node.category.toLowerCase() === 'start-end'
        ) || null;
    }

    /**
     * Check if end node connects back to start node
     * @param {Object} startNode - Start node
     * @param {Object} endNode - End node
     * @returns {Object|null} Edge if connection exists, null otherwise
     */
    checkEndToStartConnection(startNode, endNode) {
        const edges = this.app.graph.edges;
        
        for (const edge of edges) {
            if (!this.isNextEdge(edge)) continue;
            
            const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
            const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
            
            if (sourceId === endNode.id && targetId === startNode.id) {
                return edge;
            }
        }
        
        return null;
    }

    /**
     * Validate a specific node's type and connections
     * @param {Object} node - Node to validate
     * @returns {Object} Validation result
     */
    validateNodeType(node) {
        const result = {
            isValid: true,
            errors: [],
            warnings: []
        };
        
        const category = (node.category || '').toLowerCase();
        const name = (node.name || '').toLowerCase();
        
        // Get incoming and outgoing "next" edges
        const incomingNext = this.getNextEdgesForNode(node.id, 'incoming');
        const outgoingNext = this.getNextEdgesForNode(node.id, 'outgoing');
        
        // Validate based on node type
        if (name === 'start' && category === 'start-end') {
            // Start node: ONE outgoing "next" edge
            if (outgoingNext.length !== 1) {
                result.errors.push(`❌ Start node "${node.name}" must have exactly ONE outgoing "next" edge (found ${outgoingNext.length})`);
                result.isValid = false;
            }
        } else if (name === 'end' && category === 'start-end') {
            // End node: ONE incoming "next" edge
            if (incomingNext.length !== 1) {
                result.errors.push(`❌ End node "${node.name}" must have exactly ONE incoming "next" edge (found ${incomingNext.length})`);
                result.isValid = false;
            }
        } else if (category === 'task') {
            // Task node: ONE incoming + ONE outgoing
            if (incomingNext.length !== 1) {
                result.errors.push(`❌ Task node "${node.name || node.id}" must have exactly ONE incoming "next" edge (found ${incomingNext.length})`);
                result.isValid = false;
            }
            if (outgoingNext.length !== 1) {
                result.errors.push(`❌ Task node "${node.name || node.id}" must have exactly ONE outgoing "next" edge (found ${outgoingNext.length})`);
                result.isValid = false;
            }
        } else if (category === 'decision') {
            // Decision node: ONE incoming + MULTIPLE outgoing (at least 1)
            if (incomingNext.length !== 1) {
                result.errors.push(`❌ Decision node "${node.name || node.id}" must have exactly ONE incoming "next" edge (found ${incomingNext.length})`);
                result.isValid = false;
            }
            if (outgoingNext.length < 1) {
                result.errors.push(`❌ Decision node "${node.name || node.id}" must have at least ONE outgoing "next" edge (found ${outgoingNext.length})`);
                result.isValid = false;
            }
        } else {
            // Unknown category - warning
            result.warnings.push(`⚠️ Node "${node.name || node.id}" has category="${node.category}" which is not a recognized workflow type (start-end, task, decision)`);
        }
        
        return result;
    }

    /**
     * Get "next" edges for a specific node
     * @param {string} nodeId - Node ID
     * @param {string} direction - 'incoming' or 'outgoing'
     * @returns {Array} Array of edges
     */
    getNextEdgesForNode(nodeId, direction) {
        const edges = this.app.graph.edges;
        const nextEdges = [];
        
        for (const edge of edges) {
            if (!this.isNextEdge(edge)) continue;
            
            const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
            const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
            
            if (direction === 'incoming' && targetId === nodeId) {
                nextEdges.push(edge);
            } else if (direction === 'outgoing' && sourceId === nodeId) {
                nextEdges.push(edge);
            }
        }
        
        return nextEdges;
    }

    /**
     * Check if an edge is a "next" edge (case-insensitive)
     * @param {Object} edge - Edge object
     * @returns {boolean}
     */
    isNextEdge(edge) {
        if (!edge.directed) return false;
        
        const label = (edge.label || '').toLowerCase();
        const relationship = (edge.relationship || '').toLowerCase();
        const name = (edge.name || '').toLowerCase();
        
        return label === 'next' || relationship === 'next' || name === 'next';
    }

    /**
     * Find disconnected workflow chains
     * @param {Array} allNodes - All nodes in the graph
     * @param {Set} processedNodeIds - Set of already processed node IDs
     * @returns {Array} Array of disconnected chains with details
     */
    findDisconnectedChains(allNodes, processedNodeIds) {
        const disconnectedChains = [];
        const visitedGlobal = new Set(processedNodeIds);
        
        for (const node of allNodes) {
            if (visitedGlobal.has(node.id)) continue;
            
            // Check if this node has any "next" edges
            const hasNextEdges = this.hasAnyNextEdges(node.id);
            if (!hasNextEdges) continue;
            
            // Find this node's chain
            const chain = this.findWorkflowChain(node.id);
            if (chain.length === 0) continue;
            
            // Mark all nodes in this chain as visited
            chain.forEach(n => visitedGlobal.add(n.id));
            
            // Analyze this chain
            const startNode = this.identifyStartNode(chain);
            const endNode = this.identifyEndNode(chain);
            
            let reason = '';
            if (!startNode && !endNode) {
                reason = 'Missing both start and end nodes';
            } else if (!startNode) {
                reason = 'Missing start node';
            } else if (!endNode) {
                reason = 'Missing end node';
            } else {
                reason = 'Has start and end but disconnected from main workflow';
            }
            
            disconnectedChains.push({
                nodes: chain,
                reason: reason,
                hasStart: !!startNode,
                hasEnd: !!endNode
            });
        }
        
        return disconnectedChains;
    }

    /**
     * Check if a node has any "next" edges (incoming or outgoing)
     * @param {string} nodeId - Node ID
     * @returns {boolean}
     */
    hasAnyNextEdges(nodeId) {
        const edges = this.app.graph.edges;
        
        for (const edge of edges) {
            if (!this.isNextEdge(edge)) continue;
            
            const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
            const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
            
            if (sourceId === nodeId || targetId === nodeId) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Get next nodes from current node
     * @param {string} nodeId - Current node ID
     * @returns {Array} Array of {node, edge, label} objects
     */
    getNextNodes(nodeId) {
        const outgoingEdges = this.getNextEdgesForNode(nodeId, 'outgoing');
        const nextNodes = [];
        
        for (const edge of outgoingEdges) {
            const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
            const targetNode = this.app.graph.getNode(targetId);
            
            if (targetNode) {
                nextNodes.push({
                    node: targetNode,
                    edge: edge,
                    label: this.getEdgeLabel(edge)
                });
            }
        }
        
        return nextNodes;
    }

    /**
     * Get previous nodes to current node
     * @param {string} nodeId - Current node ID
     * @returns {Array} Array of {node, edge, label} objects
     */
    getPreviousNodes(nodeId) {
        const incomingEdges = this.getNextEdgesForNode(nodeId, 'incoming');
        const previousNodes = [];
        
        for (const edge of incomingEdges) {
            const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
            const sourceNode = this.app.graph.getNode(sourceId);
            
            if (sourceNode) {
                previousNodes.push({
                    node: sourceNode,
                    edge: edge,
                    label: this.getEdgeLabel(edge)
                });
            }
        }
        
        return previousNodes;
    }

    /**
     * Get label for an edge (for button display)
     * @param {Object} edge - Edge object
     * @returns {string} Label text
     */
    getEdgeLabel(edge) {
        // Priority: name > description > relationship > label > id
        return edge.name || edge.description || edge.relationship || edge.label || edge.id;
    }

    /**
     * Navigate to a specific node
     * @param {string} nodeId - Node ID to navigate to
     */
    navigateToNode(nodeId) {
        // Add to navigation history
        if (this.currentNodeId !== nodeId) {
            this.navigationHistory.push(nodeId);
        }
        
        this.currentNodeId = nodeId;
        this.updateNavigatorDisplay();
        
        // Highlight the node on the graph
        this.app.renderer.selectNodes([nodeId]);
        this.app.renderer.centerOnNode(nodeId);
    }

    /**
     * Update the workflow navigator display
     */
    updateNavigatorDisplay() {
        const node = this.app.graph.getNode(this.currentNodeId);
        if (!node) return;
        
        // Update node name
        const nameElement = document.getElementById('workflow-node-name');
        if (nameElement) {
            nameElement.textContent = node.name || node.id;
        }
        
        // Update category badge
        const categoryElement = document.getElementById('workflow-node-category');
        if (categoryElement) {
            categoryElement.textContent = node.category || 'Unknown';
            categoryElement.className = 'workflow-category-badge workflow-category-' + (node.category || 'unknown').toLowerCase();
        }
        
        // Update description
        const descElement = document.getElementById('workflow-node-description');
        if (descElement) {
            descElement.textContent = node.description || 'No description available';
        }
        
        // Update position indicator
        this.updatePositionIndicator();
        
        // Update inputs/outputs
        this.updateConnectionsDisplay(node);
        
        // Update validation summary
        this.displayValidationSummary();
        
        // Generate navigation buttons
        this.generateNavigationButtons();
    }

    /**
     * Update position indicator (e.g., "Step 3 of 8")
     */
    updatePositionIndicator() {
        const positionElement = document.getElementById('workflow-position');
        if (!positionElement || !this.workflowChain) return;
        
        const currentIndex = this.workflowChain.findIndex(n => n.id === this.currentNodeId);
        const total = this.workflowChain.length;
        
        if (currentIndex >= 0) {
            positionElement.textContent = `Node ${currentIndex + 1} of ${total} in workflow chain`;
        } else {
            positionElement.textContent = 'Position unknown';
        }
    }

    /**
     * Update inputs/outputs display
     * @param {Object} node - Current node
     */
    updateConnectionsDisplay(node) {
        // Get all edges (not just "next" edges)
        const allEdges = this.app.graph.edges;
        
        // Find input edges (excluding "next")
        const inputEdges = allEdges.filter(edge => {
            const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
            return targetId === node.id && !this.isNextEdge(edge);
        });
        
        // Find output edges (excluding "next")
        const outputEdges = allEdges.filter(edge => {
            const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
            return sourceId === node.id && !this.isNextEdge(edge);
        });
        
        // Display inputs
        const inputsList = document.getElementById('workflow-inputs-list');
        if (inputsList) {
            if (inputEdges.length === 0) {
                inputsList.innerHTML = '<li class="workflow-no-connections">No data inputs</li>';
            } else {
                inputsList.innerHTML = inputEdges.map(edge => {
                    const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
                    const sourceNode = this.app.graph.getNode(sourceId);
                    const sourceName = sourceNode ? sourceNode.name || sourceNode.id : sourceId;
                    return `<li><strong>${edge.name || edge.relationship || 'Connection'}:</strong> from ${sourceName}</li>`;
                }).join('');
            }
        }
        
        // Display outputs
        const outputsList = document.getElementById('workflow-outputs-list');
        if (outputsList) {
            if (outputEdges.length === 0) {
                outputsList.innerHTML = '<li class="workflow-no-connections">No data outputs</li>';
            } else {
                outputsList.innerHTML = outputEdges.map(edge => {
                    const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
                    const targetNode = this.app.graph.getNode(targetId);
                    const targetName = targetNode ? targetNode.name || targetNode.id : targetId;
                    return `<li><strong>${edge.name || edge.relationship || 'Connection'}:</strong> to ${targetName}</li>`;
                }).join('');
            }
        }
    }

    /**
     * Display validation summary in the navigator
     */
    displayValidationSummary() {
        const summaryElement = document.getElementById('workflow-validation-summary');
        if (!summaryElement || !this.validationReport) return;
        
        let html = '';
        
        // Show errors
        if (this.validationReport.errors.length > 0) {
            html += '<div class="workflow-validation-errors">';
            html += '<h4>Errors:</h4>';
            html += '<ul>';
            this.validationReport.errors.forEach(error => {
                html += `<li>${error}</li>`;
            });
            html += '</ul>';
            html += '</div>';
        }
        
        // Show warnings
        if (this.validationReport.warnings.length > 0) {
            html += '<div class="workflow-validation-warnings">';
            html += '<h4>Warnings:</h4>';
            html += '<ul>';
            this.validationReport.warnings.slice(0, 3).forEach(warning => {
                html += `<li>${warning}</li>`;
            });
            if (this.validationReport.warnings.length > 3) {
                html += `<li>... and ${this.validationReport.warnings.length - 3} more (see Validation Details)</li>`;
            }
            html += '</ul>';
            html += '</div>';
        }
        
        // Show success message if no errors or warnings
        if (this.validationReport.errors.length === 0 && this.validationReport.warnings.length === 0) {
            html = '<div class="workflow-validation-success">✅ Workflow structure is valid</div>';
        }
        
        summaryElement.innerHTML = html;
    }

    /**
     * Generate navigation buttons (Previous and Next)
     */
    generateNavigationButtons() {
        const previousNodes = this.getPreviousNodes(this.currentNodeId);
        const nextNodes = this.getNextNodes(this.currentNodeId);
        
        // Generate Previous buttons
        this.generatePreviousButtons(previousNodes);
        
        // Generate Next buttons
        this.generateNextButtons(nextNodes);
    }

    /**
     * Generate Previous navigation buttons
     * @param {Array} previousNodes - Array of previous node objects
     */
    generatePreviousButtons(previousNodes) {
        const container = document.getElementById('workflow-prev-buttons');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (previousNodes.length === 0) {
            const btn = document.createElement('button');
            btn.className = 'btn btn-secondary';
            btn.disabled = true;
            btn.textContent = 'Previous';
            container.appendChild(btn);
            return;
        }
        
        // Show first 3, then expandable list
        const visibleCount = Math.min(3, previousNodes.length);
        
        for (let i = 0; i < visibleCount; i++) {
            const prev = previousNodes[i];
            const btn = document.createElement('button');
            btn.className = 'btn btn-primary workflow-nav-btn';
            btn.textContent = `← ${prev.node.name || prev.node.id}`;
            btn.title = `Go to: ${prev.node.name || prev.node.id}`;
            btn.addEventListener('click', () => this.navigateToNode(prev.node.id));
            container.appendChild(btn);
        }
        
        // If more than 3, add expandable dropdown
        if (previousNodes.length > 3) {
            const dropdownContainer = document.createElement('div');
            dropdownContainer.className = 'workflow-dropdown-container';
            
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'btn btn-secondary workflow-dropdown-toggle';
            toggleBtn.textContent = `... ${previousNodes.length - 3} more ▼`;
            
            const dropdownList = document.createElement('div');
            dropdownList.className = 'workflow-dropdown-list hidden';
            
            for (let i = 3; i < previousNodes.length; i++) {
                const prev = previousNodes[i];
                const item = document.createElement('button');
                item.className = 'workflow-dropdown-item';
                item.textContent = `← ${prev.node.name || prev.node.id}`;
                item.addEventListener('click', () => {
                    this.navigateToNode(prev.node.id);
                    dropdownList.classList.add('hidden');
                });
                dropdownList.appendChild(item);
            }
            
            toggleBtn.addEventListener('click', () => {
                dropdownList.classList.toggle('hidden');
                toggleBtn.textContent = dropdownList.classList.contains('hidden') 
                    ? `... ${previousNodes.length - 3} more ▼`
                    : `... ${previousNodes.length - 3} more ▲`;
            });
            
            dropdownContainer.appendChild(toggleBtn);
            dropdownContainer.appendChild(dropdownList);
            container.appendChild(dropdownContainer);
        }
    }

    /**
     * Generate Next navigation buttons
     * @param {Array} nextNodes - Array of next node objects
     */
    generateNextButtons(nextNodes) {
        const container = document.getElementById('workflow-next-buttons');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (nextNodes.length === 0) {
            const btn = document.createElement('button');
            btn.className = 'btn btn-secondary';
            btn.disabled = true;
            btn.textContent = 'Next';
            container.appendChild(btn);
            return;
        }
        
        // Show all next nodes (for decision branching)
        for (const next of nextNodes) {
            const btn = document.createElement('button');
            btn.className = 'btn btn-primary workflow-nav-btn';
            
            // If multiple next nodes, show the edge label
            if (nextNodes.length > 1) {
                btn.textContent = `${next.label} → ${next.node.name || next.node.id}`;
            } else {
                btn.textContent = `${next.node.name || next.node.id} →`;
            }
            
            btn.title = `Go to: ${next.node.name || next.node.id}`;
            btn.addEventListener('click', () => this.navigateToNode(next.node.id));
            container.appendChild(btn);
        }
    }

    /**
     * Show the workflow navigator modal
     */
    showModal() {
        const modal = document.getElementById('workflow-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    /**
     * Close the workflow navigator
     */
    close() {
        const modal = document.getElementById('workflow-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        
        // Clear selection on graph
        this.app.renderer.clearSelection();
        
        // Reset state
        this.currentNodeId = null;
        this.workflowChain = null;
        this.validationReport = null;
        this.navigationHistory = [];
    }

    /**
     * Show validation details modal
     */
    showValidationDetails() {
        if (!this.validationReport) return;
        
        const modal = document.getElementById('workflow-validation-modal');
        const body = document.getElementById('validation-details-body');
        
        if (!modal || !body) return;
        
        let html = '<div class="workflow-validation-details">';
        
        // Overall status
        html += '<div class="validation-section">';
        html += '<h3>Workflow Status</h3>';
        if (this.validationReport.isValid) {
            html += '<p class="validation-success">✅ Workflow structure is valid</p>';
        } else {
            html += '<p class="validation-error">❌ Workflow has structural errors</p>';
        }
        html += `<p>Total nodes in chain: ${this.validationReport.workflowChain.length}</p>`;
        html += '</div>';
        
        // Start and End nodes
        html += '<div class="validation-section">';
        html += '<h3>Workflow Boundaries</h3>';
        if (this.validationReport.startNode) {
            html += `<p>✅ Start node: <strong>${this.validationReport.startNode.name}</strong></p>`;
        } else {
            html += '<p class="validation-error">❌ No start node found</p>';
        }
        if (this.validationReport.endNode) {
            html += `<p>✅ End node: <strong>${this.validationReport.endNode.name}</strong></p>`;
        } else {
            html += '<p class="validation-error">❌ No end node found</p>';
        }
        html += '</div>';
        
        // Errors
        if (this.validationReport.errors.length > 0) {
            html += '<div class="validation-section">';
            html += '<h3>Errors</h3>';
            html += '<ul class="validation-error-list">';
            this.validationReport.errors.forEach(error => {
                html += `<li>${error}</li>`;
            });
            html += '</ul>';
            html += '</div>';
        }
        
        // Warnings
        if (this.validationReport.warnings.length > 0) {
            html += '<div class="validation-section">';
            html += '<h3>Warnings</h3>';
            html += '<ul class="validation-warning-list">';
            this.validationReport.warnings.forEach(warning => {
                html += `<li>${warning}</li>`;
            });
            html += '</ul>';
            html += '</div>';
        }
        
        // Disconnected chains
        if (this.validationReport.disconnectedChains.length > 0) {
            html += '<div class="validation-section">';
            html += '<h3>Disconnected Chains</h3>';
            html += `<p>Found ${this.validationReport.disconnectedChains.length} disconnected workflow chain(s):</p>`;
            
            this.validationReport.disconnectedChains.forEach((chain, index) => {
                html += '<div class="disconnected-chain">';
                html += `<h4>Chain ${index + 1}: ${chain.reason}</h4>`;
                html += `<p>Nodes (${chain.nodes.length}): `;
                html += chain.nodes.map(n => n.name || n.id).join(', ');
                html += '</p>';
                html += `<button class="btn btn-sm btn-secondary workflow-highlight-chain" data-chain-index="${index}">Highlight on Graph</button>`;
                html += '</div>';
            });
            
            html += '</div>';
        }
        
        html += '</div>';
        
        body.innerHTML = html;
        
        // Add event listeners for highlight buttons
        const highlightButtons = body.querySelectorAll('.workflow-highlight-chain');
        highlightButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const chainIndex = parseInt(e.target.getAttribute('data-chain-index'));
                this.highlightDisconnectedChain(chainIndex);
            });
        });
        
        modal.classList.remove('hidden');
    }

    /**
     * Close validation details modal
     */
    closeValidationDetails() {
        const modal = document.getElementById('workflow-validation-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    /**
     * Highlight a disconnected chain on the graph
     * @param {number} chainIndex - Index of the chain to highlight
     */
    highlightDisconnectedChain(chainIndex) {
        if (!this.validationReport || !this.validationReport.disconnectedChains[chainIndex]) {
            return;
        }
        
        const chain = this.validationReport.disconnectedChains[chainIndex];
        const nodeIds = chain.nodes.map(n => n.id);
        
        // Select and center on these nodes
        this.app.renderer.selectNodes(nodeIds);
        
        if (nodeIds.length > 0) {
            this.app.renderer.centerOnNode(nodeIds[0]);
        }
        
        this.app.updateStatus(`Highlighted disconnected chain with ${nodeIds.length} nodes`);
        
        // Close validation modal to see the graph
        this.closeValidationDetails();
    }
}

// Export
window.WorkflowManager = WorkflowManager;