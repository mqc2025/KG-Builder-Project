# Knowledge Graph Editor

A powerful HTML-based visual tool for building, editing, and visualizing knowledge graphs with an intuitive interface.

## 🚀 Features

### Core Features
- **Visual Graph Editor**: Interactive canvas for creating and editing nodes and edges
- **Property Panel**: Dynamic property editing for nodes and edges with custom properties
- **File Management**: Import/export JSON files, save/load graphs
- **Auto-save**: Automatic saving to localStorage every 30 seconds with recovery
- **Undo/Redo**: Full history management with 50-level undo/redo stack

### Advanced Features
- **Search & Filter**: Find nodes by any property value
- **Multiple Tabs**: Work with multiple graphs simultaneously
- **Shortest Path**: Dijkstra's algorithm to find shortest paths between nodes
- **Node Clustering**: Group nodes by property values with visual color coding
- **Minimap**: Navigation overview for large graphs
- **Export Options**: Export as JSON, PNG, or SVG
- **Relationship Inference**: Suggestions for potential connections

### Visualization
- **Force-Directed Layout**: Physics-based automatic layout
- **Zoom & Pan**: Smooth navigation with mouse/trackpad
- **Node Dragging**: Reposition nodes manually
- **Custom Styling**: Colors, sizes, and properties for nodes and edges
- **Directed/Undirected Edges**: Support for both edge types with arrows

## 📋 Getting Started

### Installation
1. Download all files maintaining the directory structure
2. Open `index.html` in a modern web browser (Chrome, Firefox, Safari, or Edge)
3. No server or installation required!

### Directory Structure
```
knowledge-graph-editor/
├── index.html
├── styles/
│   ├── main.css
│   ├── toolbar.css
│   ├── properties.css
│   └── minimap.css
└── js/
    ├── app.js
    ├── graph.js
    ├── renderer.js
    ├── properties.js
    ├── fileManager.js
    ├── history.js
    ├── tabManager.js
    ├── search.js
    ├── algorithms.js
    ├── minimap.js
    └── utils.js
```

## 🎯 Usage Guide

### Basic Operations

#### Creating Nodes
1. Click the "Add Node" tool button (or press `N`)
2. Click on the canvas where you want to place the node
3. Enter a unique node ID when prompted
4. The node will be created with default properties

#### Creating Edges
1. Click the "Add Edge" tool button (or press `E`)
2. Click on the source node
3. Click on the target node
4. The edge will be created automatically

#### Editing Properties
1. Click the "Select" tool (or press `V`)
2. Click on any node or edge
3. The property panel will appear on the right
4. Edit standard properties (color, size, description, etc.)
5. Add custom properties using the "+ Add Property" button
6. Changes are saved automatically

#### Deleting Elements
- Select a node/edge and press `Delete` or `Backspace`
- Or click "Delete Node/Edge" in the property panel

### File Operations

#### Saving Your Work
- **Save**: Click "Save" button (Ctrl/Cmd+S) to download as JSON
- **Auto-save**: Graph is automatically saved to browser storage every 30 seconds
- **Export**: Click "Export" to choose JSON, PNG, or SVG format

#### Opening Graphs
- **Open**: Click "Open" button (Ctrl/Cmd+O) to import a JSON file
- **Recovery**: On page load, you'll be prompted to recover auto-saved work

#### New Graph
- Click "New" button (Ctrl/Cmd+N) to start fresh
- You'll be prompted to save if there are unsaved changes

### Advanced Features

#### Search & Filter
1. Use the search box in the toolbar (Ctrl/Cmd+F)
2. Type any property value to find matching nodes
3. Matching nodes will be highlighted
4. Press Enter to zoom to results

#### Multiple Tabs
1. Click "+" button next to tabs to create a new graph tab
2. Switch between tabs by clicking on them
3. Each tab maintains its own graph independently
4. Close tabs using the "×" button (cannot close last tab)

#### Shortest Path
1. Click the "Path" button in the left toolbar
2. Click on a start node
3. Click on an end node
4. Click "Calculate Path" to find and highlight the shortest path
5. The algorithm considers edge weights

#### Node Clustering
1. Click the "Cluster" button in the left toolbar
2. Enter the property name to cluster by
3. Nodes with matching property values will be grouped and colored

#### Auto Layout
- Click the "Layout" button to rearrange nodes using force-directed layout
- Nodes will automatically spread out for better visualization

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + N` | New graph |
| `Ctrl/Cmd + O` | Open file |
| `Ctrl/Cmd + S` | Save graph |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Ctrl/Cmd + F` | Focus search |
| `Delete` / `Backspace` | Delete selected |
| `Esc` | Deselect / Cancel tool |
| `V` | Select tool |
| `N` | Add node tool |
| `E` | Add edge tool |

### Navigation
- **Zoom**: Mouse wheel or trackpad pinch
- **Pan**: Click and drag on empty space
- **Fit to View**: Double-click on empty space
- **Minimap**: Click on the minimap to navigate

## 📊 JSON Schema

The application uses the following JSON structure:

```json
{
  "graph": {
    "metadata": {
      "name": "My Knowledge Graph",
      "title": "Optional title",
      "description": "Optional description",
      "created": "2025-11-01",
      "modified": "2025-11-01"
    },
    "nodes": [
      {
        "id": "node1",
        "properties": {
          "color": "#3498db",
          "size": 10,
          "description": "Node description",
          "customProperty": "custom value"
        }
      }
    ],
    "edges": [
      {
        "id": "edge1",
        "source": "node1",
        "target": "node2",
        "properties": {
          "description": "Edge description",
          "type": "related",
          "color": "#95a5a6",
          "weight": 1,
          "directed": true,
          "customProperty": "custom value"
        }
      }
    ]
  }
}
```

### Standard Properties

**Node Properties:**
- `color` (string): Hex color code (e.g., "#3498db")
- `size` (number): Node radius in pixels (5-50)
- `description` (string): Text description

**Edge Properties:**
- `type` (string): Edge type/label
- `color` (string): Hex color code
- `weight` (number): Weight for pathfinding algorithms
- `directed` (boolean): Show arrow (true) or not (false)
- `description` (string): Text description

**Custom Properties:**
You can add any custom properties to nodes and edges using the property panel.

## 🔧 Technical Details

### Technologies Used
- **D3.js v7**: Graph visualization and force simulation
- **Vanilla JavaScript (ES6+)**: No framework dependencies
- **HTML5 & CSS3**: Modern web standards
- **SVG**: Scalable vector graphics for rendering

### Browser Compatibility
- Chrome/Edge: Fully supported
- Firefox: Fully supported
- Safari: Fully supported
- Requires a modern browser with ES6 support

### Performance
- Tested with graphs up to 1000+ nodes
- Force simulation optimized for smooth rendering
- Efficient rendering using D3's data binding

## 🐛 Troubleshooting

### Graph not displaying
- Ensure JavaScript is enabled in your browser
- Check browser console for errors (F12)
- Try refreshing the page

### PNG export not working
- Some browsers may have limitations with PNG export
- Use SVG export as an alternative
- SVG files can be converted to PNG using external tools

### Auto-save not recovering
- Auto-save only keeps the last 24 hours
- Check if localStorage is enabled in your browser
- Try manually saving your work regularly

### Slow performance with large graphs
- Consider reducing the number of visible nodes
- Use the search/filter feature to focus on specific areas
- Disable force simulation for very large graphs

## 📝 Tips & Best Practices

1. **Regular Saves**: Use Ctrl/Cmd+S frequently to download backups
2. **Unique IDs**: Use descriptive, unique node IDs for clarity
3. **Custom Properties**: Leverage custom properties for rich data modeling
4. **Color Coding**: Use consistent colors for node types
5. **Edge Weights**: Set appropriate weights for meaningful pathfinding
6. **Tabs**: Use multiple tabs to compare different graph versions
7. **Search**: Use search to quickly locate specific nodes in large graphs

## 🎨 Customization

### Changing Default Colors
Edit the CSS variables in `styles/main.css`:
```css
:root {
    --primary-color: #3498db;
    --secondary-color: #2ecc71;
    --danger-color: #e74c3c;
    ...
}
```

### Adjusting Force Simulation
Modify parameters in `renderer.js`:
```javascript
.force('link', d3.forceLink().id(d => d.id).distance(100))
.force('charge', d3.forceManyBody().strength(-300))
.force('center', d3.forceCenter(this.width / 2, this.height / 2))
.force('collision', d3.forceCollide().radius(30))
```

## 📄 License

This project is open source and available for educational and commercial use.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📧 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the usage guide
3. Check browser console for error messages

---

**Version**: 1.0.0  
**Last Updated**: November 2025

Happy Graph Building! 🎉
