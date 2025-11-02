# Knowledge Graph Editor

A powerful, zero-dependency HTML/JavaScript visual tool for building, editing, and visualizing knowledge graphs with an intuitive interface. Built with D3.js v7 for professional graph visualization and analysis.

## 🚀 Features

### Core Features
- **Visual Graph Editor**: Interactive canvas for creating and editing nodes and edges with real-time force-directed layout
- **Property Panel**: Dynamic property editing for nodes and edges with unlimited custom properties
- **File Management**: Import/export JSON files with drag-and-drop support
- **Auto-save & Recovery**: Automatic saving to localStorage every 30 seconds with 24-hour recovery window
- **Undo/Redo**: Full history management with 50-level undo/redo stack

### Advanced Features
- **Real-time Search**: Find nodes by any property value with instant highlighting
- **Multiple Tabs**: Work with multiple graphs simultaneously, each with independent state
- **Shortest Path**: Dijkstra's algorithm to find weighted shortest paths between nodes
- **Node Clustering**: Group nodes by property values with automatic color coding
- **Interactive Minimap**: Live navigation overview with viewport indicator for large graphs
- **Edge Labels**: Display edge IDs directly on connections for easy identification
- **Multiple Export Formats**: Export as JSON, PNG, or SVG with customizable options

### Visualization & Interaction
- **Force-Directed Layout**: Physics-based automatic layout with collision detection
- **Smooth Zoom & Pan**: Mouse wheel and trackpad support with transform persistence
- **Node Dragging**: Reposition nodes manually with position locking
- **Custom Styling**: Full control over colors, sizes, and visual properties
- **Directed/Undirected Edges**: Support for both edge types with arrow markers
- **Edge Weighting**: Numeric weights for pathfinding algorithms

## 📋 Getting Started

### Installation
1. Download all files maintaining the directory structure
2. Open `index.html` in a modern web browser (Chrome, Firefox, Safari, or Edge)
3. **No server installation required!** – Pure client-side application

### Quick Start
See **[QUICKSTART.md](QUICKSTART.md)** for a 3-step guide to get started immediately.

### Directory Structure
```
knowledge-graph-editor/
├── index.html              # Main application entry point
├── README.md               # This file
├── QUICKSTART.md          # Quick start guide
├── styles/
│   ├── main.css           # Core styles and layout
│   ├── toolbar.css        # Top toolbar styling
│   ├── properties.css     # Property panel styling
│   └── minimap.css        # Minimap component styling
├── js/
│   ├── app.js             # Main application controller
│   ├── graph.js           # Graph data model
│   ├── renderer.js        # D3.js visualization renderer
│   ├── properties.js      # Property panel manager
│   ├── fileManager.js     # Import/export operations
│   ├── history.js         # Undo/redo history manager
│   ├── tabManager.js      # Multi-tab management
│   ├── search.js          # Search and filter functionality
│   ├── algorithms.js      # Graph algorithms (Dijkstra, clustering)
│   ├── minimap.js         # Minimap navigation component
│   └── utils.js           # Utility functions
└── JSON Samples/
    ├── sample_graph.json      # Example AI/ML knowledge graph
    └── sample_graph-resave.json  # Additional sample
```

## 🎯 Usage Guide

### Basic Operations

#### Creating Nodes
1. Click the **"⊕ Add Node"** tool button (or press `N`)
2. Click anywhere on the canvas
3. Enter a unique node ID when prompted
4. The node appears with default properties (blue color, size 10)

**Tips:**
- Use descriptive IDs for better organization
- IDs must be unique within the graph
- New nodes automatically join the force simulation

#### Creating Edges
1. Click the **"→ Add Edge"** tool button (or press `E`)
2. Click on the **source node** (it will be highlighted)
3. Click on the **target node**
4. The edge is created automatically with the edge ID displayed on the connection

**Tips:**
- Self-loops are not allowed
- Duplicate edges between the same nodes are prevented
- Edge labels show the edge ID for easy identification

#### Editing Properties
1. Click the **"◯ Select"** tool (or press `V`)
2. Click on any node or edge
3. The property panel appears on the right side
4. Edit any properties:
   - **Standard properties**: Color, size, description, type, weight, direction
   - **Custom properties**: Add unlimited key-value pairs
5. Changes are saved automatically to history

**Node Properties:**
- `color`: Hex color code (e.g., #3498db)
- `size`: Radius in pixels (5-50)
- `description`: Text description

**Edge Properties:**
- `type`: Edge relationship type/label
- `color`: Hex color code
- `weight`: Numeric weight for pathfinding (default: 1)
- `directed`: Boolean - show arrow direction
- `description`: Text description

#### Deleting Elements
- **Keyboard**: Select element(s) and press `Delete` or `Backspace`
- **Property Panel**: Click "Delete Node" or "Delete Edge" button
- **Note**: Deleting a node also removes all connected edges

### File Operations

#### Saving Your Work
- **Manual Save**: Click **"💾 Save"** button (`Ctrl/Cmd+S`) to download as JSON
- **Auto-save**: Graph automatically saves to browser localStorage every 30 seconds
- **Save As**: Use the Save button to specify a custom filename

#### Opening Graphs
- **Open File**: Click **"📂 Open"** button (`Ctrl/Cmd+O`)
- **Drag & Drop**: Drag JSON files directly onto the canvas (if implemented)
- **Recovery**: On page load, prompted to recover auto-saved work (if within 24 hours)

#### Exporting Graphs
1. Click **"📤 Export"** button
2. Choose format:
   - **JSON**: Full graph data with metadata
   - **PNG**: Raster image with white background
   - **SVG**: Vector image (recommended for quality)

#### Sample Graph
Load the included `sample_graph.json` to explore an AI/ML knowledge graph with 10 nodes and 12 edges demonstrating various relationships.

### Advanced Features

#### Search & Highlighting
1. Use the search box in the toolbar (`Ctrl/Cmd+F`)
2. Type any text to search across:
   - Node IDs
   - Node property values
   - Edge properties
3. Matching nodes highlight in red
4. Press `Enter` to zoom and center on results
5. Click **✕** to clear search

**Search Tips:**
- Search is case-insensitive
- Partial matches are supported
- Results update as you type (debounced 300ms)

#### Multiple Tabs
1. Click **"+"** button next to tabs to create new graph
2. Each tab maintains:
   - Independent graph data
   - Separate history stack
   - Individual metadata
3. Switch tabs by clicking on them
4. Close tabs with **"✕"** button (cannot close last tab)
5. Tab names default to "Graph 1", "Graph 2", etc.

**Tab Features:**
- Graphs are stored per tab
- History is isolated per tab
- Unsaved changes warning on close

#### Shortest Path Finder
1. Click the **"⚡ Path"** button in left toolbar
2. Click on the **start node**
3. Click on the **end node**
4. Click **"Calculate Path"**
5. The shortest path highlights in green
6. Distance calculation considers edge weights

**Algorithm Details:**
- Uses Dijkstra's algorithm
- Supports weighted edges
- Respects directed edge constraints
- Shows "No path found" if disconnected

#### Node Clustering
1. Click the **"⊛ Cluster"** button
2. Enter property name (e.g., "category", "type")
3. Nodes are automatically grouped by matching property values
4. Each cluster receives a distinct color
5. Uses 6 rotating colors: red, blue, green, orange, purple, teal

**Clustering Tips:**
- Works with any custom property
- Best with categorical data
- Colors persist until next clustering operation

#### Auto Layout
- Click **"⊞ Layout"** button to reset and restart force simulation
- All position locks are released
- Nodes rearrange automatically using force-directed algorithm
- State saves automatically after 2 seconds

**Force Simulation Parameters:**
```javascript
.force('link', d3.forceLink().distance(100))      // Edge length
.force('charge', d3.forceManyBody().strength(-300)) // Repulsion force
.force('center', d3.forceCenter())                 // Centering
.force('collision', d3.forceCollide().radius(30))  // Collision detection
```

#### Minimap Navigation
- Appears automatically when graph is non-empty
- Located in bottom-right corner
- **Click**: Jump to location
- **Drag viewport**: Pan main view
- Shows real-time position of visible area
- Scale: 180×120px overview

### Navigation Controls

#### Mouse & Trackpad
- **Zoom In/Out**: Mouse wheel or pinch gesture
- **Pan**: Click and drag on empty canvas
- **Reset View**: Double-click on empty canvas
- **Fit to View**: Automatically fits entire graph in viewport

#### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + N` | New graph |
| `Ctrl/Cmd + O` | Open file |
| `Ctrl/Cmd + S` | Save graph |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Ctrl/Cmd + F` | Focus search |
| `Delete` / `Backspace` | Delete selected |
| `Esc` | Deselect / Cancel current tool |
| `V` | Select tool |
| `N` | Add node tool |
| `E` | Add edge tool |
| `Space` | Pan tool (hold) |

## 📊 JSON Schema

The application uses a structured JSON format for graph persistence:

```json
{
  "graph": {
    "metadata": {
      "name": "My Knowledge Graph",
      "title": "Optional extended title",
      "description": "Graph description",
      "created": "2025-11-01",
      "modified": "2025-11-02"
    },
    "nodes": [
      {
        "id": "unique_node_id",
        "properties": {
          "color": "#3498db",
          "size": 10,
          "description": "Node description",
          "customProperty1": "value1",
          "customProperty2": "value2"
        }
      }
    ],
    "edges": [
      {
        "id": "edge_timestamp_random",
        "source": "source_node_id",
        "target": "target_node_id",
        "properties": {
          "description": "Edge description",
          "type": "relationship_type",
          "color": "#95a5a6",
          "weight": 1,
          "directed": true,
          "customProperty": "custom_value"
        }
      }
    ]
  }
}
```

### Standard Properties

**Node Standard Properties:**
| Property | Type | Default | Range/Format |
|----------|------|---------|--------------|
| `color` | string | `#3498db` | Hex color code |
| `size` | number | `10` | 5-50 pixels |
| `description` | string | `""` | Any text |

**Edge Standard Properties:**
| Property | Type | Default | Range/Format |
|----------|------|---------|--------------|
| `type` | string | `"related"` | Any text label |
| `color` | string | `#95a5a6` | Hex color code |
| `weight` | number | `1` | Positive number |
| `directed` | boolean | `true` | true/false |
| `description` | string | `""` | Any text |

**Custom Properties:**
- Add unlimited key-value pairs
- Keys must be unique per node/edge
- Values stored as strings
- Avoid reserved keys: `x`, `y`, `fx`, `fy`, `vx`, `vy`, `index` (D3 simulation properties)

### D3 Property Handling

The application automatically strips D3 force simulation properties (`x`, `y`, `fx`, `fy`, `vx`, `vy`, `index`) when:
- Saving to JSON
- Updating graph data
- Importing graphs

This ensures clean data persistence without simulation artifacts.

## 🔧 Technical Details

### Technologies Used
- **D3.js v7**: Graph visualization, force simulation, and SVG manipulation
- **Vanilla JavaScript (ES6+)**: Modular architecture with classes
- **HTML5 & CSS3**: Modern web standards, no preprocessors
- **SVG**: Scalable vector graphics for high-quality rendering
- **localStorage API**: Browser-based persistence for auto-save

### Architecture Overview

**Core Components:**
1. **Graph Model** (`graph.js`): Data structure with nodes, edges, metadata
2. **Renderer** (`renderer.js`): D3.js visualization layer
3. **App Controller** (`app.js`): Main application logic and event coordination
4. **History Manager** (`history.js`): Undo/redo state management
5. **File Manager** (`fileManager.js`): Import/export operations
6. **Properties Panel** (`properties.js`): Dynamic property editing UI
7. **Tab Manager** (`tabManager.js`): Multi-graph workspace management
8. **Search Manager** (`search.js`): Search and filtering functionality
9. **Algorithms** (`algorithms.js`): Graph algorithms (Dijkstra, clustering, etc.)
10. **Minimap** (`minimap.js`): Navigation overview component

### Browser Compatibility
| Browser | Version | Support |
|---------|---------|---------|
| Chrome/Edge | 90+ | ✅ Fully supported |
| Firefox | 88+ | ✅ Fully supported |
| Safari | 14+ | ✅ Fully supported |
| Opera | 76+ | ✅ Fully supported |

**Requirements:**
- ES6+ JavaScript support
- SVG rendering support
- localStorage API
- Modern CSS (Flexbox, CSS Grid)

### Performance Characteristics
- **Tested with**: Graphs up to 1000+ nodes and 2000+ edges
- **Force simulation**: Optimized alpha decay for smooth rendering
- **Rendering**: Efficient D3 data binding with enter/update/exit pattern
- **Memory**: Auto-save limited to last 24 hours to manage localStorage
- **Recommended**: <500 nodes for optimal interactive performance

### Force Simulation Tuning

Located in `renderer.js` (lines 27-31):

```javascript
this.simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(d => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(this.width / 2, this.height / 2))
    .force('collision', d3.forceCollide().radius(30));
```

**Tuning Parameters:**
- **Link distance (100)**: Default edge length
- **Charge strength (-300)**: Node repulsion force (negative = repulsion)
- **Collision radius (30)**: Minimum distance between nodes
- **Alpha target (0.3)**: Simulation "heat" level

## 🐛 Troubleshooting

### Common Issues

#### Graph Not Displaying
**Symptoms**: Blank canvas, no error messages
**Solutions:**
1. Check browser console for JavaScript errors (F12)
2. Verify JavaScript is enabled
3. Ensure all JS files loaded (check Network tab)
4. Try hard refresh: `Ctrl+Shift+R` / `Cmd+Shift+R`

#### PNG Export Fails
**Symptoms**: "Error exporting PNG" alert
**Solutions:**
1. Use SVG export instead (fully supported)
2. Check browser console for CORS errors
3. SVG files can be converted to PNG using external tools:
   - Online: CloudConvert, SVG-to-PNG converters
   - Desktop: Inkscape, Adobe Illustrator

#### Auto-Save Not Recovering
**Symptoms**: No recovery prompt on page load
**Possible Causes:**
- Save older than 24 hours (automatically cleared)
- localStorage disabled or full
- Different browser/incognito mode used
- localStorage cleared manually

**Solutions:**
1. Check browser localStorage settings
2. Enable localStorage in browser settings
3. Use manual save (`Ctrl+S`) for important work
4. Export to JSON regularly as backup

#### Slow Performance
**Symptoms**: Laggy interaction, slow rendering
**Causes & Solutions:**
- **Large graph (>500 nodes)**: 
  - Disable force simulation: Stop auto-layout
  - Use search to filter view
  - Split into multiple graphs using tabs
- **Many edges (>1000)**:
  - Reduce visual complexity
  - Increase simulation alpha decay
- **Browser limitations**:
  - Close unused tabs
  - Restart browser
  - Use Chrome/Edge for best performance

#### Undo/Redo Not Working
**Symptoms**: Buttons disabled or no effect
**Solutions:**
- Undo only available after changes
- History limited to 50 states
- Check if at beginning/end of history
- New graph operations clear redo history

#### Edge IDs Overlapping
**Symptoms**: Edge labels hard to read when edges cross
**Note**: This is expected behavior with complex graphs
**Workarounds:**
- Manually reposition nodes to reduce crossings
- Use edge descriptions instead of IDs for important labels
- Click on edges to view properties in detail panel

## 📝 Tips & Best Practices

### Data Organization
1. **Consistent Naming**: Use clear, descriptive node IDs
2. **ID Conventions**: Consider prefixes (e.g., `person_`, `company_`, `event_`)
3. **Custom Properties**: Leverage custom properties for rich metadata
4. **Property Types**: Use consistent property names across similar nodes
5. **Relationships**: Use edge `type` property to categorize connections

### Visual Design
1. **Color Coding**: Assign colors by node type or category
2. **Size Scaling**: Use size to represent importance or hierarchy
3. **Edge Weights**: Set meaningful weights for pathfinding accuracy
4. **Direction**: Use directed edges for hierarchical relationships
5. **Clustering**: Group related nodes using the cluster feature

### Workflow
1. **Regular Saves**: Use `Ctrl/Cmd+S` frequently for backups
2. **Multiple Tabs**: Use tabs to compare versions or work on related graphs
3. **Search First**: Use search to locate nodes in large graphs before editing
4. **Layout Often**: Apply auto-layout periodically for clarity
5. **Export Backups**: Keep JSON backups of important graphs

### Graph Design Patterns

**Hierarchies:**
- Use directed edges from parent to child
- Apply consistent colors per level
- Use clustering by "level" property

**Networks:**
- Use undirected edges for peer relationships
- Weight edges by connection strength
- Use size to indicate centrality

**Timelines:**
- Create nodes for events
- Use directed edges to show sequence
- Add `date` or `timestamp` custom properties

## 🎨 Customization

### Changing Default Colors

Edit CSS variables in `styles/main.css` (lines 8-17):

```css
:root {
    --primary-color: #3498db;      /* Main accent color */
    --secondary-color: #2ecc71;    /* Success/positive actions */
    --danger-color: #e74c3c;       /* Delete/warning actions */
    --dark-bg: #2c3e50;            /* Header/footer background */
    --light-bg: #ecf0f1;           /* Canvas background */
    --border-color: #bdc3c7;       /* Border and separator color */
    --text-primary: #2c3e50;       /* Main text color */
    --text-secondary: #7f8c8d;     /* Secondary/muted text */
    --hover-color: #34495e;        /* Hover state color */
}
```

### Adjusting Force Simulation

Edit parameters in `js/renderer.js` (lines 27-31):

```javascript
this.simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(d => d.id)
        .distance(100))          // Change: Edge length (50-200)
    .force('charge', d3.forceManyBody()
        .strength(-300))         // Change: Repulsion (-500 to -100)
    .force('center', d3.forceCenter(this.width / 2, this.height / 2))
    .force('collision', d3.forceCollide()
        .radius(30));            // Change: Min node distance (20-50)
```

**Customization Effects:**
- **Shorter edges**: Decrease `distance` (e.g., 50)
- **More spacing**: Increase `charge` strength (e.g., -500)
- **Tighter packing**: Decrease `collision` radius (e.g., 20)

### Modifying Node Default Properties

Edit `addNode()` in `js/app.js` (lines 349-362):

```javascript
const node = this.graph.addNode({
    id: nodeId,
    color: '#3498db',    // Change default color
    size: 10,            // Change default size
    description: ''
});
```

### Changing Auto-Save Interval

Edit timer in `js/fileManager.js` (line 46):

```javascript
setInterval(() => {
    this.saveToLocalStorage();
}, 30000);  // Change: milliseconds (30000 = 30 seconds)
```

## 🤝 Use Cases

### Academic & Research
- **Literature Review**: Connect papers, authors, concepts
- **Research Planning**: Map dependencies, milestones, resources
- **Concept Maps**: Visualize theoretical frameworks
- **Citation Networks**: Track paper relationships

### Business & Planning
- **Project Management**: Tasks, dependencies, team assignments
- **Business Processes**: Workflow steps, decision points
- **Organization Charts**: Hierarchies, reporting structures
- **Strategy Maps**: Goals, initiatives, KPIs

### Personal & Creative
- **Mind Maps**: Ideas, themes, associations
- **Learning Paths**: Courses, prerequisites, skills
- **Family Trees**: People, relationships, events
- **Story Planning**: Characters, plot points, connections
- **World Building**: Locations, factions, lore

### Technical & Development
- **Database Schema**: Tables, relationships, fields
- **System Architecture**: Components, dependencies, data flow
- **API Design**: Endpoints, resources, relationships
- **Knowledge Bases**: Documents, topics, references

## 📄 License

This project is open source and available for both educational and commercial use under the MIT License.

## 🙋 Support & Contributing

### Getting Help
1. Check this README for comprehensive documentation
2. Review [QUICKSTART.md](QUICKSTART.md) for basic usage
3. Check browser console (F12) for error messages
4. Try the included `sample_graph.json` to verify functionality

### Contributing
Contributions are welcome! Ways to contribute:
- **Bug Reports**: Submit detailed issue descriptions
- **Feature Requests**: Suggest enhancements with use cases
- **Code Contributions**: Submit pull requests with clear descriptions
- **Documentation**: Improve guides and examples
- **Testing**: Report compatibility issues or edge cases

### Development Guidelines
- Maintain vanilla JavaScript (no build tools)
- Follow existing code style and structure
- Test across multiple browsers
- Update documentation for new features
- Preserve backward compatibility with JSON format

## 🔄 Version History

**Version 1.0.0** (November 2025)
- Initial release with full feature set
- D3.js v7 force-directed visualization
- Multi-tab workspace
- Advanced algorithms (Dijkstra, clustering)
- Auto-save and recovery
- Multiple export formats
- Interactive minimap
- Comprehensive property editing

## 🎯 Roadmap

Potential future enhancements:
- Drag-and-drop file import
- Graph templates library
- Community detection algorithms
- Graph statistics dashboard
- Collaborative editing (real-time)
- Cloud storage integration
- Advanced layout algorithms (hierarchical, circular)
- Plugin system for extensibility
- Mobile/tablet optimization
- Accessibility improvements (ARIA labels, keyboard navigation)

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Built with**: D3.js v7, Vanilla JavaScript, HTML5, CSS3  

**Ready to build your knowledge graph?** Open `index.html` and start creating! 🎉

For quick start instructions, see **[QUICKSTART.md](QUICKSTART.md)**