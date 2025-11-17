// Excel Converter for Knowledge Graph Editor
// Handles conversion of Excel files to graph structure

class ExcelConverter {
    constructor(graph, renderer) {
        this.graph = graph;
        this.renderer = renderer;
        
        // File inputs
        this.excelConverterInput = document.getElementById('excel-converter-input');
        this.excelDataInput = document.getElementById('excel-data-input');
        this.mappingJsonInput = document.getElementById('mapping-json-input');
        
        // Store mapping data
        this.currentMapping = null;
        
        this.setupEventListeners();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Create Excel Converter button
        document.getElementById('btn-create-excel-converter')?.addEventListener('click', () => {
            this.excelConverterInput.click();
        });
        
        // Convert Excel button - needs to load mapping first, then excel data
        document.getElementById('btn-convert-excel')?.addEventListener('click', () => {
            this.startConvertExcel();
        });
        
        // Excel file selected for creating converter
        this.excelConverterInput?.addEventListener('change', (e) => {
            this.handleCreateConverter(e);
        });
        
        // Mapping JSON file selected
        this.mappingJsonInput?.addEventListener('change', (e) => {
            this.handleMappingJsonLoad(e);
        });
        
        // Excel data file selected
        this.excelDataInput?.addEventListener('change', (e) => {
            this.handleExcelDataLoad(e);
        });
    }

    /**
     * Handle Create Excel Converter
     * Reads Excel file and creates header and placeholder nodes
     */
    async handleCreateConverter(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const data = await this.readExcelFile(file);
            if (!data || data.length === 0) {
                alert('Excel file is empty or could not be read.');
                return;
            }

            // Get headers (first row)
            const headers = Object.keys(data[0]);
            
            // Get first data row values
            const firstRow = data[0];
            
            // Clear current graph
            if (!confirm('This will clear the current graph and create a new mapping template. Continue?')) {
                return;
            }
            
            this.graph.clear();
            
            // Create nodes for headers (top row)
            const headerNodes = [];
            const startX = 200;
            const startY = 200;
            const columnSpacing = 200;
            
            for (let i = 0; i < headers.length; i++) {
                const header = headers[i];
                const x = startX + (i * columnSpacing);
                const y = startY;
                
                const node = await this.graph.addNode({
                    name: header,
                    x: x,
                    y: y,
                    fx: x,
                    fy: y,
                    color: '#3498db',
                    size: 12,
                    description: `Column header: ${header}`,
                    category: 'Header',
                    subCat: 'Excel Column'
                });
                
                headerNodes.push(node);
            }
            
            // Create nodes for first row values (bottom row - placeholders)
            const valueNodes = [];
            const valueY = startY + 150;
            
            for (let i = 0; i < headers.length; i++) {
                const header = headers[i];
                const value = firstRow[header];
                const x = startX + (i * columnSpacing);
                const y = valueY;
                
                const node = await this.graph.addNode({
                    name: String(value),
                    x: x,
                    y: y,
                    fx: x,
                    fy: y,
                    color: '#2ecc71',
                    size: 10,
                    description: `First row value from column: ${header}`,
                    category: 'Value',
                    subCat: 'Excel Data',
                    excelColumn: header  // Store which column this belongs to
                });
                
                valueNodes.push(node);
            }
            
            // Render the graph
            this.renderer.render();
            
            alert(`Excel Converter Template Created!\n\nHeaders: ${headers.length}\nFirst Row Values: ${headers.length}\n\nNow create edges to define relationships, then export this as your mapping JSON file.`);
            
        } catch (error) {
            console.error('Error creating Excel converter:', error);
            alert('Error reading Excel file: ' + error.message);
        }
        
        // Reset input
        event.target.value = '';
    }

    /**
     * Start Convert Excel process
     * First prompts for mapping JSON, then Excel data file
     */
    startConvertExcel() {
        alert('Step 1: Select the mapping JSON file (created from "Create Excel Converter")');
        this.mappingJsonInput.click();
    }

    /**
     * Handle Mapping JSON Load
     */
    async handleMappingJsonLoad(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const json = JSON.parse(text);
            
            // Validate it's a valid graph structure
            if (!json.graph || !json.graph.nodes || !json.graph.edges) {
                alert('Invalid mapping JSON file. Please use a file exported from "Create Excel Converter".');
                return;
            }
            
            // Store the mapping
            this.currentMapping = json;
            
            // Now prompt for Excel data file
            alert('Step 2: Select the Excel file to convert');
            this.excelDataInput.click();
            
        } catch (error) {
            console.error('Error loading mapping JSON:', error);
            alert('Error reading mapping JSON file: ' + error.message);
        }
        
        // Reset input
        event.target.value = '';
    }

    /**
     * Handle Excel Data Load
     * Uses the mapping to convert Excel data to graph structure
     */
    async handleExcelDataLoad(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!this.currentMapping) {
            alert('No mapping loaded. Please start the process again.');
            return;
        }

        try {
            const data = await this.readExcelFile(file);
            if (!data || data.length === 0) {
                alert('Excel file is empty or could not be read.');
                return;
            }

            // Parse the mapping to understand structure
            const mappingNodes = this.currentMapping.graph.nodes;
            const mappingEdges = this.currentMapping.graph.edges;
            
            // Identify header nodes and value nodes from mapping
            const headerNodes = mappingNodes.filter(n => n.category === 'Header');
            const valueNodes = mappingNodes.filter(n => n.category === 'Value');
            
            // Clear current graph
            if (!confirm('This will clear the current graph and create the converted data. Continue?')) {
                return;
            }
            
            this.graph.clear();
            
            // Create nodes for all data
            const createdNodes = {};
            const headers = Object.keys(data[0]);
            
            // First, create column header nodes (similar to mapping)
            const columnHeaderNodes = {};
            const startX = 200;
            const startY = 200;
            const columnSpacing = 200;
            
            for (let i = 0; i < headers.length; i++) {
                const header = headers[i];
                const x = startX + (i * columnSpacing);
                const y = startY;
                
                const node = await this.graph.addNode({
                    name: header,
                    x: x,
                    y: y,
                    fx: x,
                    fy: y,
                    color: '#3498db',
                    size: 12,
                    description: `Column header: ${header}`,
                    category: 'Header',
                    subCat: 'Excel Column'
                });
                
                columnHeaderNodes[header] = node;
            }
            
            // Create nodes for each data row
            const rowSpacing = 100;
            let currentY = startY + 150;
            
            for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
                const row = data[rowIndex];
                
                for (let colIndex = 0; colIndex < headers.length; colIndex++) {
                    const header = headers[colIndex];
                    const value = row[header];
                    const x = startX + (colIndex * columnSpacing);
                    const y = currentY;
                    
                    const node = await this.graph.addNode({
                        name: String(value),
                        x: x,
                        y: y,
                        color: '#2ecc71',
                        size: 8,
                        description: `Row ${rowIndex + 1}, Column: ${header}`,
                        category: 'Data',
                        subCat: 'Excel Value',
                        excelRow: rowIndex + 1,
                        excelColumn: header
                    });
                    
                    // Store reference for creating edges
                    if (!createdNodes[rowIndex]) {
                        createdNodes[rowIndex] = {};
                    }
                    createdNodes[rowIndex][header] = node;
                }
                
                currentY += rowSpacing;
            }
            
            // Create edges based on mapping pattern
            // Find edges in mapping that connect headers to values
            for (const mappingEdge of mappingEdges) {
                const sourceNode = mappingNodes.find(n => n.id === mappingEdge.source);
                const targetNode = mappingNodes.find(n => n.id === mappingEdge.target);
                
                if (!sourceNode || !targetNode) continue;
                
                // If edge connects a header to a value
                if (sourceNode.category === 'Header' && targetNode.category === 'Value') {
                    const headerName = sourceNode.name;
                    const headerNode = columnHeaderNodes[headerName];
                    
                    if (!headerNode) continue;
                    
                    // Create similar edges for all data rows
                    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
                        const dataNode = createdNodes[rowIndex][headerName];
                        
                        if (dataNode) {
                            await this.graph.addEdge({
                                name: `${headerName}_to_Row${rowIndex + 1}`,
                                source: headerNode.id,
                                target: dataNode.id,
                                relationship: mappingEdge.relationship || 'contains',
                                color: mappingEdge.color || '#95a5a6',
                                weight: mappingEdge.weight || 1,
                                directed: mappingEdge.directed !== undefined ? mappingEdge.directed : true,
                                description: `${headerName} contains value from row ${rowIndex + 1}`
                            });
                        }
                    }
                }
                
                // If edge connects value to value (same row)
                if (sourceNode.category === 'Value' && targetNode.category === 'Value') {
                    const sourceColumn = sourceNode.excelColumn;
                    const targetColumn = targetNode.excelColumn;
                    
                    if (sourceColumn && targetColumn) {
                        // Create similar edges for all data rows
                        for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
                            const sourceDataNode = createdNodes[rowIndex][sourceColumn];
                            const targetDataNode = createdNodes[rowIndex][targetColumn];
                            
                            if (sourceDataNode && targetDataNode) {
                                await this.graph.addEdge({
                                    name: `Row${rowIndex + 1}_${sourceColumn}_to_${targetColumn}`,
                                    source: sourceDataNode.id,
                                    target: targetDataNode.id,
                                    relationship: mappingEdge.relationship || 'related',
                                    color: mappingEdge.color || '#95a5a6',
                                    weight: mappingEdge.weight || 1,
                                    directed: mappingEdge.directed !== undefined ? mappingEdge.directed : true,
                                    description: `Relationship in row ${rowIndex + 1}: ${sourceColumn} to ${targetColumn}`
                                });
                            }
                        }
                    }
                }
            }
            
            // Render the graph
            this.renderer.render();
            
            alert(`Excel Conversion Complete!\n\nRows processed: ${data.length}\nColumns: ${headers.length}\nTotal data nodes: ${data.length * headers.length}\n\nYou can now export this as a JSON file.`);
            
            // Clear mapping
            this.currentMapping = null;
            
        } catch (error) {
            console.error('Error converting Excel data:', error);
            alert('Error converting Excel file: ' + error.message);
        }
        
        // Reset input
        event.target.value = '';
    }

    /**
     * Read Excel file and return data as array of objects
     */
    async readExcelFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    // Get first sheet
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    
                    // Convert to JSON
                    const json = XLSX.utils.sheet_to_json(worksheet);
                    
                    resolve(json);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    }
}

// Export for use in other modules
window.ExcelConverter = ExcelConverter;