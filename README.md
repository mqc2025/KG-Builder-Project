# NodeBook

**A powerful, privacy-first knowledge graph editor that runs entirely in your browser**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![JavaScript](https://img.shields.io/badge/javascript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![No Dependencies](https://img.shields.io/badge/dependencies-none-green.svg)](#)

## 🌟 Overview

NodeBook is a browser-based knowledge graph visualization and editing tool that allows you to create, visualize, and manipulate complex relationships between nodes (entities) and edges (relationships). All processing happens client-side, ensuring your data remains private and secure.

**Live Demo**: [Try NodeBook](https://your-github-pages-url.github.io/nodebook)

## ✨ Key Features

### 🎨 Visualization
- **Force-directed graph layout** using D3.js physics simulation
- **Customizable nodes** with colors, sizes, icons (emoji support), and rich properties
- **Interactive canvas** with pan, zoom, and drag capabilities
- **Minimap** for easy navigation of large graphs
- **Visual edge relationships** with directional arrows and customizable colors

### 📝 Editing Capabilities
- **Create and edit nodes** with comprehensive property management
- **Inline editing** for quick updates directly on the canvas
- **Custom properties** support for both nodes and edges
- **Node connections** with relationship labels and weights
- **Batch operations** for efficient graph manipulation

### 🔍 Advanced Tools
- **Search & Filter**: Powerful search with category-based filtering
- **Shortest Path**: Find optimal paths between any two nodes
- **Explode Graph**: Transform nodes into ontological structures
- **Excel Integration**: Import/export data via Excel templates
- **Undo/Redo**: Full history management (up to 50 levels)

### 💾 File Operations
- **Multiple export formats**: PNG, SVG, JSON
- **Standard JSON format** based on `sample_graph.json`
- **Save/Load** graph files locally
- **Open in tab** for JSON inspection
- **Drag & drop** file loading

### 🔒 Privacy First
- **100% client-side processing** - no server communication
- **No data collection** or tracking
- **No external dependencies** for core functionality
- **Open source** and auditable code

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- JavaScript enabled
- No installation required!

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nodebook.git
   cd nodebook
   ```

2. **Open in browser**
   ```bash
   # Simply open index.html in your browser
   # Or use a local server (recommended):
   python -m http.server 8000
   # Then visit: http://localhost:8000
   ```

3. **Start exploring**
   - Click "New" to create a new graph
   - Or open one of the sample files from the `JSON Samples` folder
   - Try `sample_graph.json` to see a basic example

## 📖 Usage Guide

### Creating Nodes

1. **Right-click** on the canvas
2. Select **"Add Node"**
3. Edit properties in the right sidebar:
   - Name, description, category
   - Color, size, icon
   - Links, priority, deadline
   - Custom properties

### Creating Edges

1. **Click on a source node** to select it
2. **Shift+Click on a target node**
3. Edit edge properties:
   - Relationship name
   - Direction (directed/undirected)
   - Weight, color
   - Custom properties

### Navigation

- **Pan**: Hold `Space` + drag, or use the Pan tool
- **Zoom**: Mouse wheel or pinch gesture
- **Select**: Click on nodes or edges
- **Multi-select**: Hold `Ctrl/Cmd` + click
- **Freeze/Unfreeze**: Press `F` to toggle physics simulation

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New Graph |
| `Ctrl+O` | Open File |
| `Ctrl+S` | Save |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+F` | Search |
| `F` | Freeze/Unfreeze |
| `Space` | Pan Mode |
| `Delete` | Delete Selected |
| `Ctrl+A` | Select All |
| `Escape` | Deselect All |

## 📁 Project Structure

```
nodebook/
├── index.html              # Main HTML entry point
├── help.html              # Documentation page
├── js/
│   ├── app.js            # Main application controller
│   ├── graph.js          # Graph data model and validation
│   ├── renderer.js       # D3.js visualization rendering
│   ├── properties.js     # Properties panel management
│   ├── contextMenu.js    # Right-click context menu
│   ├── filter.js         # Search and filter functionality
│   ├── fileManager.js    # File I/O operations
│   ├── pathFinder.js     # Shortest path algorithms
│   ├── explodeGraph.js   # Graph transformation tools
│   ├── excelConverter.js # Excel import/export
│   ├── minimap.js        # Minimap visualization
│   └── utils.js          # Utility functions and security
├── styles/
│   ├── main.css          # Core application styles
│   ├── toolbar.css       # Toolbar and header styles
│   ├── properties.css    # Properties panel styles
│   ├── contextMenu.css   # Context menu styles
│   ├── filter.css        # Filter dialog styles
│   └── minimap.css       # Minimap styles
├── JSON Samples/         # Example graph files
│   ├── sample_graph.json
│   ├── as9100_simple_sample.json
│   └── ...
└── README.md             # This file
```

## 🔧 Technical Details

### Technologies Used

- **D3.js v7**: Force-directed graph visualization
- **SheetJS (xlsx)**: Excel file processing
- **Vanilla JavaScript**: No framework dependencies
- **HTML5 Canvas/SVG**: Graphics rendering
- **CSS3**: Modern styling with CSS variables

### Core Components

#### Graph Model (`js/graph.js`)
- Data structure management
- Validation and sanitization
- JSON serialization/deserialization
- Security limits (max nodes, edges, string lengths)

#### Renderer (`js/renderer.js`)
- D3.js force simulation
- Node and edge rendering
- Zoom and pan controls
- Drag-and-drop interactions
- Label rendering with scaling

#### Properties Panel (`js/properties.js`)
- Node/edge property editing
- Inline editing on canvas
- Custom property management
- Icon picker with emoji support

#### File Manager (`js/fileManager.js`)
- Save/load graph files
- Export to PNG, SVG, JSON
- Drag-and-drop file loading
- Filename management

### Data Format

NodeBook uses a standardized JSON format based on `sample_graph.json`:

```json
{
  "graph": {
    "metadata": {
      "name": "Graph Name",
      "title": "Graph Title",
      "description": "Description",
      "created": "2025-11-01",
      "modified": "2025-11-02"
    },
    "settings": {
      "nodeLabelSize": 12,
      "edgeLabelSize": 10,
      "worldBoundary": {
        "enabled": false,
        "minX": -2000,
        "maxX": 2000,
        "minY": -2000,
        "maxY": 2000
      }
    },
    "nodes": [
      {
        "id": "unique-id",
        "name": "Node Name",
        "color": "#3498db",
        "size": 15,
        "icon": "📝",
        "description": "Node description",
        "category": "Category",
        "subCat": "Sub-category",
        "link1": "https://example.com",
        "priority": "High",
        "deadline": "2025-12-31",
        "x": 400,
        "y": 300
      }
    ],
    "edges": [
      {
        "id": "edge-id",
        "source": "source-node-id",
        "target": "target-node-id",
        "relationship": "relates to",
        "directed": true,
        "color": "#95a5a6",
        "weight": 1
      }
    ]
  }
}
```

### Security Features

- **Input sanitization**: All user input is sanitized to prevent XSS
- **Validation limits**: Maximum nodes (10,000), edges (50,000), string lengths
- **Safe HTML rendering**: No direct HTML injection
- **Client-side only**: No server communication or data transmission

## 🎯 Use Cases

- **Knowledge Management**: Organize complex information and relationships
- **Project Planning**: Visualize project dependencies and workflows
- **Research**: Map research concepts and citations
- **Education**: Create learning graphs and concept maps
- **Documentation**: Visualize system architectures and data flows
- **Brainstorming**: Capture ideas and their connections

## 🛠️ Advanced Features

### Explode Graph

The Explode feature transforms your graph into an ontological structure:
- Breaks down nodes based on properties
- Creates meta-nodes for categories and properties
- Maintains relationships between original and exploded nodes
- Useful for analyzing hierarchical data

**Usage**: File → Explode

### Excel Integration

Import structured data from Excel:

1. **Create Template**: File → Create Excel Converter
2. **Fill Template**: Add your nodes and edges in Excel
3. **Import**: File → Convert Excel

### Shortest Path

Find optimal paths between nodes:

1. **Activate**: Tools → Path
2. **Select source node** (click)
3. **Select target node** (click)
4. Path will be highlighted on the graph

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines

1. **Centralized approach**: Respect existing architecture
2. **Simple modifications**: Avoid complex changes without discussion
3. **File location clarity**: Clearly identify file locations in commits
4. **Test thoroughly**: Ensure no existing functionality is broken
5. **Follow standards**: Use `sample_graph.json` as the standard structure

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **D3.js** for the powerful force-directed graph library
- **SheetJS** for Excel file processing
- The open-source community for inspiration and tools

## 📞 Support

- **Documentation**: Open `help.html` in your browser
- **Issues**: [GitHub Issues](https://github.com/yourusername/nodebook/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/nodebook/discussions)

## 🗺️ Roadmap

- [ ] Additional export formats (PDF, GraphML)
- [ ] Collaborative editing (local network)
- [ ] Graph templates library
- [ ] Advanced layout algorithms
- [ ] Plugin system
- [ ] Dark mode theme
- [ ] Mobile optimization
- [ ] Graph comparison tools

---

**Made with ❤️ for knowledge workers everywhere**

*NodeBook - Your privacy-first knowledge graph editor*
