// File Manager for Import/Export Operations

class FileManager {
    constructor(graph, renderer) {
        this.graph = graph;
        this.renderer = renderer;
        
        // Track current filename for direct save
        this.currentFilename = null;
        
        // Security: File size limits (in bytes)
        this.MAX_JSON_SIZE = 50 * 1024 * 1024; // 50 MB for JSON files
        this.MAX_EXCEL_SIZE = 100 * 1024 * 1024; // 100 MB for Excel files
        
        this.fileInput = document.getElementById('file-input');
		this.fileInputNewTab = document.getElementById('file-input-new-tab');
        this.exportModal = document.getElementById('export-modal');
        
        this.setupEventListeners();
        this.setupAutoSave();
        this.setupDragAndDrop();
		this.setupPageCloseProtection(); 
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        this.fileInput?.addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });

        const modalClose = this.exportModal?.querySelector('.modal-close');
        modalClose?.addEventListener('click', () => {
            this.exportModal.classList.add('hidden');
        });

        
		document.getElementById('export-standard-json')?.addEventListener('click', () => {
			this.exportStandardJSON();
			this.exportModal.classList.add('hidden');
		});

        document.getElementById('export-png')?.addEventListener('click', () => {
            this.exportPNG();
            this.exportModal.classList.add('hidden');
        });

        document.getElementById('export-svg')?.addEventListener('click', () => {
            this.exportSVG();
            this.exportModal.classList.add('hidden');
        });

        this.exportModal?.addEventListener('click', (e) => {
            if (e.target === this.exportModal) {
                this.exportModal.classList.add('hidden');
            }
        });
		
		this.fileInputNewTab?.addEventListener('change', (e) => {
			this.handleFileForNewTab(e);
		});
    }

    /**
     * Setup drag and drop for JSON files
     */
    setupDragAndDrop() {
        const dropZone = document.getElementById('canvas-drop-zone');
        
        if (!dropZone) return;

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // Highlight drop zone when dragging over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('drag-over');
            });
        });

        // Handle dropped files
        dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            
            if (files.length === 0) return;
            
            const file = files[0];
            
            if (!file.name.endsWith('.json')) {
                alert('Please drop a JSON file');
                return;
            }
            
            this.handleDroppedFile(file);
        });
    }

    /**
	 * Handle dropped file (with size validation)
	 */
	handleDroppedFile(file) {
		// Security: Check file size before reading
		if (file.size > this.MAX_JSON_SIZE) {
			const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
			const maxSizeMB = (this.MAX_JSON_SIZE / (1024 * 1024)).toFixed(0);
			alert(`Security Error: File too large!\n\nFile size: ${sizeMB} MB\nMaximum allowed: ${maxSizeMB} MB\n\nPlease use a smaller file to prevent browser memory issues.`);
			return;
		}
		
		const reader = new FileReader();
		
		reader.onload = (e) => {
			try {
				const json = JSON.parse(e.target.result);
				
				// Set the current filename (without .json extension)
				this.currentFilename = file.name.replace('.json', '');
				
				// Load the graph directly
				this.importGraph(json);
				
				// ✅ NEW: Auto-save after loading file
				this.saveToLocalStorage();
				
				// Update status with filename
				if (window.app) {
					window.app.updateStatus(`Loaded: ${this.currentFilename}.json`);
				}
			} catch (error) {
				alert('Error reading dropped file: ' + error.message);
				console.error('Drop error:', error);
			}
		};

		reader.readAsText(file);
	}

    /**
     * Show export modal
     */
    showExportModal() {
        this.exportModal?.classList.remove('hidden');
    }

    /**
     * Export graph as JSON
     */
    exportJSON() {
        const json = this.graph.toJSON();
        const jsonString = JSON.stringify(json, null, 2);
        const filename = `${this.graph.metadata.name.replace(/\s+/g, '_')}.json`;

        Utils.downloadFile(filename, jsonString, 'application/json');
    }
	
	/**
 * Export graph as standard JSON format (compatible with D3.js, Cytoscape, etc.)
 */
exportStandardJSON() {
    const nodeBookJson = this.graph.toJSON();
    
    // Extract nodes and edges, removing NodeBook-specific wrapper
    const standardJson = {
        nodes: nodeBookJson.graph.nodes.map(node => {
            // Create clean node object
            const cleanNode = {
                id: node.id,
                name: node.name,
                label: node.name,  // Common in many libraries
                x: node.x,
                y: node.y
            };
            
            // Add optional common fields if they exist
            if (node.color) cleanNode.color = node.color;
            if (node.size) cleanNode.size = node.size;
            if (node.description) cleanNode.description = node.description;
            if (node.category) cleanNode.group = node.category;  // 'group' is common
            if (node.icon) cleanNode.icon = node.icon;
            
            // Copy all other custom properties
            Object.keys(node).forEach(key => {
                if (!cleanNode.hasOwnProperty(key) && 
                    key !== 'fx' && key !== 'fy' && 
                    key !== 'vx' && key !== 'vy' &&
                    key !== 'subCat' && key !== 'link1' && key !== 'link2' && 
                    key !== 'link3' && key !== 'link4' && 
                    key !== 'priority' && key !== 'deadline' && 
                    key !== 'userDate' && key !== 'createdDate' && key !== 'modifiedDate') {
                    cleanNode[key] = node[key];
                }
            });
            
            return cleanNode;
        }),
        edges: nodeBookJson.graph.edges.map(edge => {
            // Create clean edge object
            const cleanEdge = {
                id: edge.id,
                source: edge.source,
                target: edge.target
            };
            
            // Add optional common fields if they exist
            if (edge.name) cleanEdge.label = edge.name;
            if (edge.relationship) cleanEdge.type = edge.relationship;
            if (edge.color) cleanEdge.color = edge.color;
            if (edge.weight) cleanEdge.weight = edge.weight;
            if (edge.directed !== undefined) cleanEdge.directed = edge.directed;
            if (edge.description) cleanEdge.description = edge.description;
            
            return cleanEdge;
        })
    };
    
    const jsonString = JSON.stringify(standardJson, null, 2);
    const filename = `${this.graph.metadata.name.replace(/\s+/g, '_')}_standard.json`;
    
    Utils.downloadFile(filename, jsonString, 'application/json');
}

    /**
     * Export graph as PNG
     */
    exportPNG() {
        Utils.showLoading();

        setTimeout(() => {
            try {
                const svgElement = document.getElementById('graph-canvas');
                const svgString = new XMLSerializer().serializeToString(svgElement);
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                const bbox = svgElement.getBBox();
                canvas.width = bbox.width + 40;
                canvas.height = bbox.height + 40;

                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                const img = new Image();
                const blob = new Blob([svgString], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);

                img.onload = () => {
                    ctx.drawImage(img, 20, 20);
                    URL.revokeObjectURL(url);

                    canvas.toBlob((blob) => {
                        const url = URL.createObjectURL(blob);
                        const filename = `${this.graph.metadata.name.replace(/\s+/g, '_')}.png`;

                        const a = document.createElement('a');
                        a.href = url;
                        a.download = filename;
                        a.click();

                        URL.revokeObjectURL(url);
                        Utils.hideLoading();
                    });
                };

                img.onerror = () => {
                    Utils.hideLoading();
                    console.error('PNG export failed. Using alternative method...');
                    this.exportPNGFallback();
                };

                img.src = url;
            } catch (error) {
                Utils.hideLoading();
                alert('Error exporting PNG: ' + error.message);
                console.error('Export error:', error);
            }
        }, 100);
    }

    /**
     * Fallback PNG export method
     */
    exportPNGFallback() {
        alert('PNG export requires additional libraries. Please use SVG export instead.');
    }

    /**
     * Export graph as SVG
     */
    exportSVG() {
        try {
            const svgElement = document.getElementById('graph-canvas');
            const svgClone = svgElement.cloneNode(true);
            
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('width', '100%');
            rect.setAttribute('height', '100%');
            rect.setAttribute('fill', 'white');
            svgClone.insertBefore(rect, svgClone.firstChild);
            
            const svgString = new XMLSerializer().serializeToString(svgClone);
            const filename = `${this.graph.metadata.name.replace(/\s+/g, '_')}.svg`;

            Utils.downloadFile(filename, svgString, 'image/svg+xml');
        } catch (error) {
            alert('Error exporting SVG: ' + error.message);
            console.error('Export error:', error);
        }
    }

    /**
     * Save to localStorage
     */
    saveToLocalStorage() {
        try {
            const data = {
                graph: this.graph.toJSON(),
                filename: this.currentFilename, // Save the current filename
                timestamp: new Date().toISOString()
            };

            localStorage.setItem('knowledge-graph-autosave', JSON.stringify(data));
        } catch (error) {
            console.error('Auto-save error:', error);
        }
    }

    /**
     * Try to recover from localStorage
     */
    tryRecoverFromLocalStorage() {
        try {
            const saved = localStorage.getItem('knowledge-graph-autosave');
            if (!saved) return;

            const data = JSON.parse(saved);
            const timestamp = new Date(data.timestamp);
            const now = new Date();
            const hoursSince = (now - timestamp) / (1000 * 60 * 60);

            if (hoursSince > 24) {
                localStorage.removeItem('knowledge-graph-autosave');
                return;
            }

            // Build recovery message with filename info
            let message = `Found auto-saved graph from ${timestamp.toLocaleString()}.`;
            if (data.filename) {
                message += `\n\nFile: ${data.filename}.json`;
            }
            message += '\n\nWould you like to recover it?';

            const recover = confirm(message);

            if (recover && data.graph) {
                // Restore the filename if it was saved
                if (data.filename) {
                    this.currentFilename = data.filename;
                }
                
                this.importGraph(data.graph);
                
                // Update status with recovery info
                if (window.app) {
                    const statusMsg = data.filename ? 
                        `Recovered: ${data.filename}.json (auto-saved)` : 
                        'Recovered auto-saved graph';
                    window.app.updateStatus(statusMsg);
                }
            }
        } catch (error) {
            console.error('Recovery error:', error);
        }
    }

    /**
     * Clear auto-save
     */
    clearAutoSave() {
        localStorage.removeItem('knowledge-graph-autosave');
    }

    /**
     * Setup auto-save functionality
     * ✅ MODIFIED: Changed interval to 10 seconds (10000ms)
     */
    setupAutoSave() {
        setInterval(() => {
            this.saveToLocalStorage();
        }, 10000); // Changed from 30000 to 10000

        this.tryRecoverFromLocalStorage();
    }

    /**
     * Open file dialog
     */
    openFile() {
        this.fileInput?.click();
    }

    /**
	 * Handle file selection (with size validation and multi-file support)
	 * Automatically loads companion *_images.json if present
	 */
	handleFileSelect(event) {
		const files = Array.from(event.target.files);
		if (files.length === 0) return;

		// Separate main files and images files
		const mainFiles = [];
		const imageFiles = [];
		
		files.forEach(file => {
			if (file.name.endsWith('_images.json')) {
				imageFiles.push(file);
			} else if (file.name.endsWith('.json')) {
				mainFiles.push(file);
			}
		});

		// Must have at least one main file
		if (mainFiles.length === 0) {
			alert('Please select at least one JSON file');
			event.target.value = '';
			return;
		}

		// Process the first main file
		const mainFile = mainFiles[0];
		
		// Security: Check file size before reading
		if (mainFile.size > this.MAX_JSON_SIZE) {
			const sizeMB = (mainFile.size / (1024 * 1024)).toFixed(2);
			const maxSizeMB = (this.MAX_JSON_SIZE / (1024 * 1024)).toFixed(0);
			alert(`Security Error: File too large!\n\nFile size: ${sizeMB} MB\nMaximum allowed: ${maxSizeMB} MB\n\nPlease use a smaller file to prevent browser memory issues.`);
			event.target.value = '';
			return;
		}

		// Store the filename for future saves (without .json extension)
		this.currentFilename = mainFile.name.replace('.json', '');

		// Look for matching images file
		const expectedImageFileName = `${this.currentFilename}_images.json`;
		const matchingImageFile = imageFiles.find(f => f.name === expectedImageFileName);

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const json = JSON.parse(e.target.result);
				
				// Import the graph first
				this.importGraph(json, matchingImageFile);
				
				// Auto-save after loading file
				this.saveToLocalStorage();
				
				// Update status with filename
				if (window.app) {
					const statusMsg = matchingImageFile ? 
						`Loaded: ${this.currentFilename}.json + images` : 
						`Loaded: ${this.currentFilename}.json`;
					window.app.updateStatus(statusMsg);
				}
			} catch (error) {
				alert('Error reading file: ' + error.message);
				console.error('Import error:', error);
			}
		};

		reader.readAsText(mainFile);
		event.target.value = '';
	}

    /**
	 * Import graph from JSON
	 * @param {Object} json - The graph JSON data
	 * @param {File} imagesFile - Optional companion images file
	 */
	importGraph(json, imagesFile = null) {
		Utils.showLoading();

		setTimeout(() => {
			try {
				// Auto-detect and transform standard JSON formats
				json = this.detectAndTransformFormat(json);
				
				const success = this.graph.fromJSON(json);

				if (!success) {
					throw new Error('Invalid graph format');
				}

				this.renderer.render();

				setTimeout(() => {
					this.renderer.fitToView();
				}, 150);

				if (window.app) {
					window.app.updateStats();
					window.app.saveState();
					window.app.propertiesPanel.hide();
					
					// Handle images
					const hasImageRefs = window.app.imageManager.hasImageReferences(this.graph);
					
					if (hasImageRefs) {
						if (imagesFile) {
							// Automatically load the provided images file
							this.loadImagesFile(imagesFile);
						} else {
							// No images file provided, prompt user
							this.promptForImagesFile(this.currentFilename);
						}
					}
				}

				Utils.hideLoading();
			} catch (error) {
				Utils.hideLoading();
				alert('Error importing graph: ' + error.message);
				console.error('Import error:', error);
			}
		}, 100);
	}
	
/**
 * Detect and transform standard JSON formats to NodeBook format
 * Supports: {nodes, edges}, {nodes, links}, and NodeBook format
 * @param {Object} json - Input JSON
 * @returns {Object} NodeBook-formatted JSON
 */
detectAndTransformFormat(json) {
    // Already in NodeBook format
    if (json.graph && json.graph.nodes && json.graph.edges) {
        return json;
    }
    
    // Standard format: {nodes, edges}
    if (json.nodes && json.edges && !json.graph) {
        return this.transformStandardToNodeBook(json.nodes, json.edges);
    }
    
    // D3.js format: {nodes, links}
    if (json.nodes && json.links && !json.graph) {
        return this.transformStandardToNodeBook(json.nodes, json.links);
    }
    
    // Unknown format, return as-is and let validation handle it
    return json;
}

	/**
	 * Transform standard format to NodeBook format
	 * @param {Array} nodes - Array of nodes
	 * @param {Array} edges - Array of edges/links
	 * @returns {Object} NodeBook-formatted JSON
	 */
	transformStandardToNodeBook(nodes, edges) {
		const now = new Date().toISOString();
		
		// Transform nodes - ensure required fields
		const transformedNodes = nodes.map(node => {
			const transformed = {
				id: node.id || node.name || `node_${Math.random().toString(36).substr(2, 9)}`,
				name: node.name || node.label || node.id || 'Unnamed',
				description: node.description || node.desc || '',
				color: node.color || node.fill || '#3498db',
				size: node.size || node.radius || node.value || 10,
				icon: node.icon || '',
				category: node.category || node.group || node.type || '',
				subCat: node.subCat || node.subCategory || '',
				x: node.x || 0,
				y: node.y || 0
			};
			
			// Copy any additional custom properties
			Object.keys(node).forEach(key => {
				if (!transformed.hasOwnProperty(key) && 
					key !== 'label' && key !== 'group' && key !== 'type' && 
					key !== 'radius' && key !== 'value' && key !== 'fill') {
					transformed[key] = node[key];
				}
			});
			
			return transformed;
		});
		
		// Transform edges - ensure required fields
		const transformedEdges = edges.map(edge => {
			const transformed = {
				id: edge.id || `edge_${Math.random().toString(36).substr(2, 9)}`,
				source: typeof edge.source === 'object' ? edge.source.id : edge.source,
				target: typeof edge.target === 'object' ? edge.target.id : edge.target,
				name: edge.name || edge.label || '',
				relationship: edge.relationship || edge.type || edge.label || '',
				description: edge.description || edge.desc || '',
				directed: edge.directed !== undefined ? edge.directed : true,
				color: edge.color || edge.stroke || '#95a5a6',
				weight: edge.weight || edge.value || 1
			};
			
			// Copy any additional custom properties
			Object.keys(edge).forEach(key => {
				if (!transformed.hasOwnProperty(key) && 
					key !== 'label' && key !== 'type' && key !== 'stroke' && key !== 'value') {
					transformed[key] = edge[key];
				}
			});
			
			return transformed;
		});
		
		// Create NodeBook structure
		return {
			graph: {
				metadata: {
					name: 'Imported Graph',
					title: 'Imported from Standard Format',
					description: 'Auto-converted from standard JSON format',
					created: now,
					modified: now
				},
				settings: {
					nodeLabelSize: 12,
					edgeLabelSize: 10,
					worldBoundary: {
						enabled: false,
						minX: -2000,
						maxX: 2000,
						minY: -2000,
						maxY: 2000
					}
				},
				nodes: transformedNodes,
				edges: transformedEdges
			}
		};
	}	

    /**
     * Save graph directly (Ctrl+S behavior)
     * - If filename exists: save with that name
     * - If no filename: prompt for name (same as Save As)
     */
    async save() {
        if (this.currentFilename) {
            // Direct save with existing filename
            const json = this.graph.toJSON();
            const jsonString = JSON.stringify(json, null, 2);
            const filename = `${this.currentFilename}.json`;
            
            // Check for images and create companion file
            const hasImages = window.app.imageManager.hasImageReferences(this.graph);
            
            if (hasImages) {
                // Get all images from IndexedDB
                const images = await window.app.imageManager.getAllImages();
                
                // Also include loaded images
                const allImages = { ...images, ...window.app.imageManager.loadedImages };
                
                if (Object.keys(allImages).length > 0) {
                    // Create images JSON
                    const imagesJson = JSON.stringify(allImages, null, 2);
                    const imagesFilename = `${this.currentFilename}_images.json`;
                    
                    // Download images file
                    Utils.downloadFile(imagesFilename, imagesJson, 'application/json');
                    
                    // Short delay before main file
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            
            Utils.downloadFile(filename, jsonString, 'application/json');
            
            if (window.app) {
                if (hasImages && Object.keys(await window.app.imageManager.getAllImages()).length > 0) {
                    window.app.updateStatus(`✓ Saved: ${filename} and ${this.currentFilename}_images.json`);
                } else {
                    window.app.updateStatus(`Saved: ${filename}`);
                }
            }
        } else {
            // No filename yet, prompt for one
            this.saveAs();
        }
    }

    /**
     * Save graph with custom name (always prompts)
     */
    async saveAs() {
        // Suggest current filename or graph metadata name
        const suggestedName = this.currentFilename || this.graph.metadata.name.replace(/\s+/g, '_');
        
        const name = prompt('Enter filename (without .json):', suggestedName);
        
        if (name && name.trim()) {
            const cleanName = name.trim();
            this.currentFilename = cleanName;
            this.graph.metadata.name = cleanName;
            
            // Now save with the new filename
            const json = this.graph.toJSON();
            const jsonString = JSON.stringify(json, null, 2);
            const filename = `${cleanName}.json`;
            
            // Check for images and create companion file
            const hasImages = window.app.imageManager.hasImageReferences(this.graph);
            
            if (hasImages) {
                // Get all images from IndexedDB
                const images = await window.app.imageManager.getAllImages();
                
                // Also include loaded images
                const allImages = { ...images, ...window.app.imageManager.loadedImages };
                
                if (Object.keys(allImages).length > 0) {
                    // Create images JSON
                    const imagesJson = JSON.stringify(allImages, null, 2);
                    const imagesFilename = `${cleanName}_images.json`;
                    
                    // Download images file
                    Utils.downloadFile(imagesFilename, imagesJson, 'application/json');
                    
                    // Short delay before main file
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            
            Utils.downloadFile(filename, jsonString, 'application/json');
            
            if (window.app) {
                if (hasImages && Object.keys(await window.app.imageManager.getAllImages()).length > 0) {
                    window.app.updateStatus(`✓ Saved as: ${filename} and ${cleanName}_images.json`);
                } else {
                    window.app.updateStatus(`Saved as: ${filename}`);
                }
            }
        }
    }
	
	/**
	 * Open file picker for opening in new tab
	 */
	openInNewTab() {
		this.fileInputNewTab?.click();
	}

	/**
	 * Handle file selection for new tab
	 */
	handleFileForNewTab(event) {
		const file = event.target.files[0];
		if (!file) return;

		if (!file.name.endsWith('.json')) {
			alert('Please select a JSON file');
			event.target.value = '';
			return;
		}

		// Security: Check file size
		if (file.size > this.MAX_JSON_SIZE) {
			const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
			const maxSizeMB = (this.MAX_JSON_SIZE / (1024 * 1024)).toFixed(0);
			alert(`Security Error: File too large!\n\nFile size: ${sizeMB} MB\nMaximum allowed: ${maxSizeMB} MB`);
			event.target.value = '';
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const json = JSON.parse(e.target.result);
				
				// Store in localStorage temporarily with timestamp
				const tempData = {
					json: json,
					filename: file.name.replace('.json', ''),
					timestamp: Date.now()
				};
				localStorage.setItem('nodebook-open-in-new-tab', JSON.stringify(tempData));
				
				// Open new tab
				window.open(window.location.href, '_blank');
				
			} catch (error) {
				alert('Error reading file: ' + error.message);
				console.error('File read error:', error);
			}
		};

		reader.readAsText(file);
		event.target.value = '';
	}

    /**
     * Get current filename
     */
    getCurrentFilename() {
        return this.currentFilename;
    }

    /**
     * Set current filename
     */
    setCurrentFilename(filename) {
        this.currentFilename = filename;
    }

    /**
     * Clear current filename (called when creating new graph)
     */
    clearCurrentFilename() {
        this.currentFilename = null;
    }
	
	/**
     * Setup protection against accidental page closure
     * Auto-saves on close and warns if there are unsaved changes
     */
    setupPageCloseProtection() {
        window.addEventListener('beforeunload', (event) => {
            // Always auto-save when closing
            this.saveToLocalStorage();
            
            // Check if there's a current filename (means user has worked on a file)
            // and warn them that changes are only in browser storage
            if (this.currentFilename || this.graph.nodes.length > 0) {
                // Show browser warning
                event.preventDefault();
                event.returnValue = ''; // Required for Chrome
                return ''; // For other browsers
            }
        });
    }	
	
	
	/**
     * Prompt user to load companion images file
     */
    promptForImagesFile(mainFilename) {
        const imagesFilename = `${mainFilename}_images.json`;
        
        const shouldLoad = confirm(
            `This graph contains embedded images.\n\n` +
            `Please also open "${imagesFilename}" to view the images.\n\n` +
            `Would you like to select the images file now?`
        );
        
        if (shouldLoad) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const imagesData = JSON.parse(event.target.result);
                        window.app.imageManager.loadImagesFromJSON(imagesData);
                        window.app.updateStatus(`✓ Loaded images from: ${file.name}`);
                        
                        // Refresh properties panel if open
                        if (window.app.propertiesPanel.panel && 
                            !window.app.propertiesPanel.panel.classList.contains('hidden')) {
                            const currentSelection = window.app.propertiesPanel.currentSelection;
                            const currentType = window.app.propertiesPanel.currentType;
                            if (currentType === 'node') {
                                window.app.propertiesPanel.showNodeProperties(currentSelection);
                            }
                        }
                    } catch (error) {
                        alert('Error loading images file: ' + error.message);
                    }
                };
                reader.readAsText(file);
            };
            
            input.click();
        }
    }
	
	/**
	 * Load images from a file object
	 * @param {File} file - The images JSON file
	 */
	loadImagesFile(file) {
		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const imagesData = JSON.parse(event.target.result);
				window.app.imageManager.loadImagesFromJSON(imagesData);
				window.app.updateStatus(`✓ Loaded images from: ${file.name}`);
				
				// Refresh properties panel if open
				if (window.app.propertiesPanel.panel && 
					!window.app.propertiesPanel.panel.classList.contains('hidden')) {
					const currentSelection = window.app.propertiesPanel.currentSelection;
					const currentType = window.app.propertiesPanel.currentType;
					if (currentType === 'node') {
						window.app.propertiesPanel.showNodeProperties(currentSelection);
					}
				}
			} catch (error) {
				alert('Error loading images file: ' + error.message);
			}
		};
		reader.readAsText(file);
	}

}

// Export
window.FileManager = FileManager;