// File Manager for Import/Export Operations

class FileManager {
    constructor(graph, renderer) {
        this.graph = graph;
        this.renderer = renderer;
        
        // Track current filename for direct save
        this.currentFilename = null;
        
        this.fileInput = document.getElementById('file-input');
        this.exportModal = document.getElementById('export-modal');
        
        this.setupEventListeners();
        this.setupAutoSave();
        this.setupDragAndDrop();
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

        document.getElementById('export-json')?.addEventListener('click', () => {
            this.exportJSON();
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
     * Handle dropped file
     */
    handleDroppedFile(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                
                // Set the current filename (without .json extension)
                this.currentFilename = file.name.replace('.json', '');
                
                // Load the graph directly
                this.importGraph(json);
                
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
     */
    setupAutoSave() {
        setInterval(() => {
            this.saveToLocalStorage();
        }, 30000);

        this.tryRecoverFromLocalStorage();
    }

    /**
     * Open file dialog
     */
    openFile() {
        this.fileInput?.click();
    }

    /**
     * Handle file selection
     */
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.json')) {
            alert('Please select a JSON file');
            return;
        }

        // Store the filename for future saves (without .json extension)
        this.currentFilename = file.name.replace('.json', '');

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                this.importGraph(json);
                
                // Update status with filename
                if (window.app) {
                    window.app.updateStatus(`Loaded: ${this.currentFilename}.json`);
                }
            } catch (error) {
                alert('Error reading file: ' + error.message);
                console.error('Import error:', error);
            }
        };

        reader.readAsText(file);

        event.target.value = '';
    }

    /**
     * Import graph from JSON
     */
    importGraph(json) {
        Utils.showLoading();

        setTimeout(() => {
            try {
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
     * Save graph directly (Ctrl+S behavior)
     * - If filename exists: save with that name
     * - If no filename: prompt for name (same as Save As)
     */
    save() {
        if (this.currentFilename) {
            // Direct save with existing filename
            const json = this.graph.toJSON();
            const jsonString = JSON.stringify(json, null, 2);
            const filename = `${this.currentFilename}.json`;
            
            Utils.downloadFile(filename, jsonString, 'application/json');
            
            if (window.app) {
                window.app.updateStatus(`Saved: ${filename}`);
            }
        } else {
            // No filename yet, prompt for one
            this.saveAs();
        }
    }

    /**
     * Save graph with custom name (always prompts)
     */
    saveAs() {
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
            
            Utils.downloadFile(filename, jsonString, 'application/json');
            
            if (window.app) {
                window.app.updateStatus(`Saved as: ${filename}`);
            }
        }
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
}

// Export
window.FileManager = FileManager;