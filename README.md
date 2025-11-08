# Knowledge Graph Editor

A powerful, interactive web-based tool for creating, editing, and analyzing knowledge graphs using D3.js force-directed visualization.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![D3.js](https://img.shields.io/badge/D3.js-v7-orange.svg)

## Overview

Knowledge Graph Editor is a production-ready web application that enables users to build and visualize complex relationships and data structures through an intuitive graph interface. Built with vanilla JavaScript and D3.js, it offers professional-grade features while maintaining simplicity and ease of deployment.

### Key Features

- **Interactive Graph Visualization**: Force-directed layout with real-time physics simulation
- **Advanced Editing**: Create, modify, and delete nodes and edges with full property support
- **Property-Based Filtering**: Filter graph elements by custom properties with multiple match types
- **Editable IDs**: Rename nodes and edges on the fly
- **Simulation Controls**: Freeze/unfreeze physics simulation, pin/unpin nodes
- **World Boundaries**: Constrain graph within defined boundaries
- **Priority & Deadline Management**: Built-in support for task management properties
- **Drag-and-Drop**: Import JSON files directly by dropping them on the canvas
- **Edge Breaking**: Split edges at source or target to create intermediate nodes
- **Context Menus**: Right-click menus for quick access to common operations
- **Node Clustering**: Group nodes by property values
- **Node Merging**: Consolidate nodes with conflict resolution
- **Shortest Path Finding**: Dijkstra's algorithm implementation
- **Multi-Tab Support**: Work on multiple graphs simultaneously
- **Auto-Save**: Periodic local storage backup
- **Export Options**: Save as JSON, PNG, or SVG
- **Minimap Navigation**: Overview panel for large graphs
- **Search & Highlight**: Find nodes and edges quickly
- **Undo/Redo**: Complete history management

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage Guide](#usage-guide)
- [Architecture](#architecture)
- [Features Documentation](#features-documentation)
- [File Format](#file-format)
- [Deployment](#deployment)
- [Browser Compatibility](#browser-compatibility)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Installation

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- Web server for hosting (Apache, Nginx, or any static file server)
- For local development: Any local server (Python's SimpleHTTPServer, Node's http-server, etc.)

### Setup

1. **Download or Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/knowledge-graph-editor.git
   cd knowledge-graph-editor
   ```

2. **No Build Process Required**
   
   The application is built with vanilla JavaScript and requires no compilation or build step.

3. **Run Locally (Optional)**
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   ```

4. **Access the Application**
   
   Open your browser and navigate to `http://localhost:8000` (or your server's URL)

## Quick Start

### Creating Your First Graph

1. **Add Nodes**: Click the "Add Node" tool (⊕) and click on the canvas
2. **Connect Nodes**: Click "Add Edge" (→), then click source node and target node
3. **Edit Properties**: Click on any node or edge to view and edit its properties
4. **Save Your Work**: Click "Save" or use Ctrl+S to export as JSON

### Loading Sample Data

1. Click "Open" button or drag-and-drop a JSON file onto the canvas
2. Sample files are provided in the `JSON Samples` directory
3. The graph will automatically layout and fit to view

## Usage Guide

### Toolbar Actions

**File Operations**
- **New**: Create a new empty graph (Ctrl+N)
- **Open**: Load a graph from JSON file (Ctrl+O)
- **Save**: Export current graph as JSON (Ctrl+S)
- **Export**: Choose export format (JSON, PNG, SVG)

**Edit Operations**
- **Undo**: Revert last action (Ctrl+Z)
- **Redo**: Reapply undone action (Ctrl+Y)
- **Delete**: Remove selected elements (Delete key)

**View Operations**
- **Zoom In/Out**: Use mouse wheel or buttons
- **Fit to View**: Auto-scale to show all nodes
- **Minimap**: Toggle overview panel

**Tools**
- **Search**: Find nodes and edges (Ctrl+F)
- **Filter**: Show/hide elements by properties

### Tools Palette

- **Select (V)**: Default selection tool
- **Add Node (N)**: Click canvas to create nodes
- **Add Edge (E)**: Connect two nodes
- **Pan (Space)**: Drag canvas to move view
- **Freeze (F)**: Stop/start physics simulation
- **Layout**: Reorganize graph automatically
- **Shortest Path**: Find optimal path between nodes
- **Cluster**: Group nodes by property
- **Merge**: Combine two nodes into one

### Context Menu Operations

**Right-click on Node**
- Edit Properties
- Change Color
- Pin/Unpin Position
- Connect To...
- Duplicate Node
- Merge with...
- Delete Node

**Right-click on Edge**
- Edit Properties
- Reverse Direction
- Break at Source/Target
- Delete Edge

**Right-click on Canvas**
- Add Node Here
- Select All
- Fit to View
- Reset Zoom
- Freeze/Unfreeze Simulation

### Properties Panel

Access by clicking on any node or edge. Available properties:

**Node Properties**
- ID (editable)
- Label
- Description
- Category
- Priority (None, Low, Medium, High)
- Deadline (date picker)
- Color
- Size
- Custom properties (key-value pairs)

**Edge Properties**
- ID (editable)
- Label
- Description
- Type/Relationship
- Color
- Weight
- Directed/Undirected
- Custom properties

### Filtering System

1. Click the Filter button (🔍)
2. Select filter type: Node or Edge
3. Enter property name and value
4. Choose match type:
   - Exact Match
   - Contains
   - Starts With
   - Ends With
5. Click "Apply Filter"

Filtered elements become semi-transparent and non-interactive.

### Node Merging

1. Right-click first node → "Merge with..."
2. Click second node to merge
3. Resolve conflicts in dialog:
   - Keep properties from either node
   - All edges are preserved and redirected

### Edge Breaking

Right-click on an edge to split it:
- **Break at Source**: Creates intermediate node near source
- **Break at Target**: Creates intermediate node near target

New node inherits edge properties and maintains connectivity.

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| V | Select tool |
| N | Add node tool |
| E | Add edge tool |
| Space | Pan tool |
| F | Freeze/unfreeze simulation |
| Ctrl+N | New graph |
| Ctrl+O | Open file |
| Ctrl+S | Save file |
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Ctrl+F | Search |
| Delete | Delete selected |
| Esc | Clear selection |

## Architecture

### Project Structure

```
knowledge-graph-editor/
├── index.html              # Main HTML file
├── js/                     # JavaScript modules
│   ├── app.js              # Main application controller
│   ├── graph.js            # Graph data model
│   ├── renderer.js         # D3.js visualization
│   ├── properties.js       # Properties panel
│   ├── fileManager.js      # Import/export operations
│   ├── tabManager.js       # Multi-tab management
│   ├── history.js          # Undo/redo system
│   ├── algorithms.js       # Graph algorithms
│   ├── search.js           # Search functionality
│   ├── filter.js           # Filtering system
│   ├── contextMenu.js      # Context menu manager
│   ├── minimap.js          # Minimap navigation
│   └── utils.js            # Utility functions
├── styles/                 # CSS stylesheets
│   ├── main.css            # Main application styles
│   ├── properties.css      # Properties panel styles
│   └── contextMenu.css     # Context menu styles
├── JSON Samples/           # Sample graph files
│   ├── sample_graph.json
│   └── test03_with locations.json
├── README.md               # This file
└── FILE_MANIFEST.md        # Detailed file listing

```

### Core Components

**Graph Model** (`graph.js`)
- Node and edge data management
- JSON serialization/deserialization
- Property validation
- Relationship tracking

**Renderer** (`renderer.js`)
- D3.js force-directed visualization
- SVG rendering
- Zoom and pan controls
- Node/edge interactions

**Properties Panel** (`properties.js`)
- Dynamic form generation
- Property editing interface
- Validation and updates

**File Manager** (`fileManager.js`)
- JSON import/export
- PNG/SVG export
- Auto-save functionality
- Drag-and-drop support

**Tab Manager** (`tabManager.js`)
- Multiple graph instances
- Tab switching
- State preservation

**History Manager** (`history.js`)
- Action recording
- Undo/redo stack
- State restoration

## Features Documentation

### Feature 1: Property-Based Filtering

Filter nodes or edges based on custom property values with flexible matching options.

**Implementation**: `filter.js`

**Usage**:
1. Click Filter button
2. Select element type (Node/Edge)
3. Enter property name and value
4. Choose match type
5. Apply or clear filter

**Match Types**:
- Exact: Property value must match exactly
- Contains: Property value must contain the search term
- Starts With: Property value must begin with the search term
- Ends With: Property value must end with the search term

### Feature 2: Editable Node/Edge IDs

Rename node and edge identifiers directly from the properties panel.

**Implementation**: `properties.js`

**Usage**:
1. Select node or edge
2. Edit ID in properties panel
3. System validates uniqueness
4. All references update automatically

### Feature 3: Freeze Simulation

Stop and start the physics simulation for stable editing or performance.

**Implementation**: `renderer.js`

**Usage**:
- Click Freeze button (❄️)
- Press F key
- Right-click canvas → Freeze/Unfreeze

**Benefits**:
- Reduce CPU usage for large graphs
- Create stable screenshots
- Precise node positioning

### Feature 4: World Boundaries

Constrain graph nodes within a defined rectangular area.

**Implementation**: `renderer.js`, `graph.js`

**Configuration**:
```javascript
settings: {
  worldBoundary: {
    enabled: true,
    minX: -1000,
    maxX: 1000,
    minY: -1000,
    maxY: 1000
  }
}
```

### Feature 5: Priority & Deadline Properties

Built-in support for task management with priority levels and deadlines.

**Implementation**: `properties.js`, `graph.js`

**Priority Levels**:
- None (default)
- Low
- Medium
- High

**Deadline**: Date picker for setting due dates

### Feature 6: Drag-and-Drop JSON

Import graph files by dragging them onto the canvas.

**Implementation**: `fileManager.js`

**Usage**:
1. Drag JSON file from file system
2. Drop onto canvas area
3. File opens in new tab automatically

### Feature 7: Edge Breaking

Split edges to create intermediate nodes for complex relationships.

**Implementation**: `contextMenu.js`, `renderer.js`

**Usage**:
1. Right-click edge
2. Choose "Break at Source" or "Break at Target"
3. New node created with preserved properties

### Feature 8: Color Palette

Quick color selection for nodes through context menu.

**Implementation**: `contextMenu.js`

**Available Colors**:
- Blue (#3498db)
- Green (#2ecc71)
- Red (#e74c3c)
- Orange (#f39c12)
- Purple (#9b59b6)
- Teal (#1abc9c)
- Dark Gray (#34495e)
- Light Gray (#95a5a6)

### Feature 9: Font Size Controls

Adjustable label sizes that scale with zoom level.

**Implementation**: `renderer.js`, `graph.js`

**Configuration**:
```javascript
settings: {
  nodeLabelSize: 12,
  edgeLabelSize: 10
}
```

### Feature 10: Context Menus

Right-click menus for nodes, edges, and canvas with context-appropriate actions.

**Implementation**: `contextMenu.js`

**Menu System**:
- Dynamic menu generation
- Keyboard shortcuts
- Submenu support
- Disabled state handling

### Feature 11: Tab Management

Work on multiple graphs simultaneously with independent tabs.

**Implementation**: `tabManager.js`

**Features**:
- Create/close tabs
- Switch between graphs
- Rename tabs
- Unsaved changes warning

### Feature 12: Node Clustering

Group nodes by common property values for analysis.

**Implementation**: `algorithms.js`, `app.js`

**Usage**:
1. Click Cluster button
2. Enter property name to cluster by
3. View grouped nodes

### Feature 13: Node Merging

Combine two nodes into one with conflict resolution.

**Implementation**: `contextMenu.js`, `app.js`

**Process**:
1. Right-click first node → "Merge with..."
2. Click second node
3. Resolve property conflicts
4. All edges redirected to merged node

## File Format

### JSON Structure

```json
{
  "version": "1.0.0",
  "graph": {
    "metadata": {
      "name": "My Knowledge Graph",
      "description": "Description of the graph",
      "author": "Your Name",
      "created": "2025-01-15",
      "modified": "2025-01-15"
    },
    "settings": {
      "nodeLabelSize": 12,
      "edgeLabelSize": 10,
      "worldBoundary": {
        "enabled": false,
        "minX": -1000,
        "maxX": 1000,
        "minY": -1000,
        "maxY": 1000
      }
    },
    "nodes": [
      {
        "id": "node1",
        "properties": {
          "label": "Node 1",
          "description": "Description",
          "category": "Type A",
          "priority": "High",
          "deadline": "2025-12-31",
          "color": "#3498db",
          "size": 10
        }
      }
    ],
    "edges": [
      {
        "id": "edge1",
        "source": "node1",
        "target": "node2",
        "properties": {
          "label": "connects to",
          "description": "Relationship",
          "type": "association",
          "color": "#95a5a6",
          "weight": 1,
          "directed": true
        }
      }
    ]
  }
}
```

### Property Types

**Supported Data Types**:
- String: Text values
- Number: Numeric values
- Boolean: true/false
- Date: ISO date strings
- Object: Nested properties (serialized)

**Reserved Properties**:
- `id`: Unique identifier (required)
- `label`: Display text
- `color`: Hex color code
- `size`: Node size (number)
- `weight`: Edge weight (number)
- `directed`: Edge directionality (boolean)

## Deployment

### WordPress/cPanel Deployment

1. **Upload Files**
   - Access cPanel File Manager
   - Navigate to `public_html` or subdirectory
   - Upload all project files maintaining structure

2. **Set Permissions**
   ```
   Directories: 755
   Files: 644
   ```

3. **Access Application**
   - Navigate to: `https://yourdomain.com/path-to-app/`
   - Or subdomain: `https://graphs.yourdomain.com/`

### Apache Configuration (Optional)

Create `.htaccess` for clean URLs:

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

### Static Hosting Services

Compatible with:
- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Static Web Apps

Simply upload files and configure root directory.

## Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Fully Supported |
| Firefox | 88+ | ✅ Fully Supported |
| Safari | 14+ | ✅ Fully Supported |
| Edge | 90+ | ✅ Fully Supported |
| Opera | 76+ | ✅ Fully Supported |

**Requirements**:
- ES6 JavaScript support
- SVG rendering
- D3.js v7 compatibility
- LocalStorage API
- FileReader API
- Canvas API (for export)

## Troubleshooting

### Common Issues

**Issue**: Graph doesn't load
- **Solution**: Check browser console for errors
- Ensure D3.js library loads correctly
- Verify JSON file format

**Issue**: Nodes fly off screen
- **Solution**: Enable world boundaries
- Reduce force strength in settings
- Freeze simulation and reposition

**Issue**: Export fails
- **Solution**: Check browser permissions for downloads
- Ensure sufficient memory for large graphs
- Try different export format

**Issue**: Performance degradation
- **Solution**: Freeze simulation when not needed
- Reduce number of visible elements
- Use filtering to focus on subgraphs

**Issue**: Can't see node labels
- **Solution**: Increase font size in settings
- Zoom in closer
- Check node size vs. zoom level

### Debug Mode

Enable detailed logging:

```javascript
// In browser console
localStorage.setItem('debug', 'true');
location.reload();
```

### Performance Tips

1. **Large Graphs (500+ nodes)**:
   - Freeze simulation after initial layout
   - Use filtering extensively
   - Increase node charge/link distance

2. **Many Edges (1000+)**:
   - Reduce edge label visibility
   - Disable edge animations
   - Use edge weight to hide low-importance connections

3. **Complex Operations**:
   - Work in smaller batches
   - Save frequently
   - Use tabs to separate concerns

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit Changes**: `git commit -m 'Add amazing feature'`
4. **Push to Branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Code Style

- Use ES6+ JavaScript features
- Follow existing naming conventions
- Comment complex logic
- Update documentation

### Testing

- Test in multiple browsers
- Verify with large datasets
- Check edge cases
- Validate JSON format

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **D3.js**: Mike Bostock and contributors for the powerful visualization library
- **Community**: For feedback and feature suggestions
- **Contributors**: All who have contributed code and documentation

## Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Contact: your-email@example.com
- Documentation: https://github.com/yourusername/knowledge-graph-editor/wiki

## Roadmap

### Planned Features

- [ ] Real-time collaboration
- [ ] Database backend integration
- [ ] Advanced graph algorithms (PageRank, betweenness centrality)
- [ ] Layout algorithm selection
- [ ] Style themes
- [ ] Plugin system
- [ ] Mobile touch support
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)
- [ ] Graph diff/merge
- [ ] Version control integration

### Under Consideration

- WebGL renderer for very large graphs
- Graph query language
- AI-powered layout suggestions
- Export to other formats (GraphML, GEXF)
- Import from databases
- Embedded analytics

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Status**: Production Ready

For the latest updates and detailed documentation, visit the project repository.