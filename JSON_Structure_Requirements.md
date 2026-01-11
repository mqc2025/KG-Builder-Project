# Knowledge Graph Builder - JSON Structure Requirements

**Version:** 1.0  
**Last Updated:** 2026-01-11  
**Purpose:** Complete reference for JSON file structure requirements for the NodeBook Knowledge Graph Builder

---

## Table of Contents

1. [Overview](#overview)
2. [Root Structure](#root-structure)
3. [Metadata Section](#metadata-section)
4. [Settings Section](#settings-section)
5. [Nodes Array](#nodes-array)
6. [Edges Array](#edges-array)
7. [Workflow Module Requirements](#workflow-module-requirements) moved to a seperate file
8. [Custom Properties](#custom-properties)
9. [Validation Limits](#validation-limits)
10. [Complete Examples](#complete-examples)
11. [Best Practices](#best-practices)

---

## Overview

The Knowledge Graph Builder (NodeBook) uses a specific JSON format to store and load graph data. All JSON files must follow this structure to be compatible with the application.

**Key Principles:**
- JSON must be valid and well-formed
- The root object must contain a `graph` property
- All required fields must be present
- Field values must respect validation limits
- Custom properties are supported and preserved

---

## Root Structure

```json
{
  "graph": {
    "metadata": { },
    "settings": { },
    "nodes": [ ],
    "edges": [ ]
  }
}
```

**Required Top-Level Properties:**
- `graph` (object) - Contains all graph data
  - `metadata` (object) - Graph metadata
  - `settings` (object) - Display and physics settings
  - `nodes` (array) - Array of node objects
  - `edges` (array) - Array of edge objects

---

## Metadata Section

### Structure

```json
"metadata": {
  "name": "string",
  "title": "string",
  "description": "string",
  "created": "ISO-8601 date string",
  "modified": "ISO-8601 date string"
}
```

### Field Specifications

| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| `name` | string | Yes | 200 chars | Internal graph identifier |
| `title` | string | Yes | 500 chars | Display title for the graph |
| `description` | string | Yes | 10,000 chars | Detailed description |
| `created` | string | Yes | 50 chars | ISO 8601 timestamp of creation |
| `modified` | string | Yes | 50 chars | ISO 8601 timestamp of last modification |

### Example

```json
"metadata": {
  "name": "client_acquisition_workflow",
  "title": "Client Acquisition Process",
  "description": "Complete workflow for acquiring first client in aerospace quality consulting",
  "created": "2026-01-11T00:00:00.000Z",
  "modified": "2026-01-11T00:00:00.000Z"
}
```

---

## Settings Section

### Structure

```json
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
}
```

### Field Specifications

| Field | Type | Required | Range | Default | Description |
|-------|------|----------|-------|---------|-------------|
| `nodeLabelSize` | number | Yes | 8-24 | 12 | Font size for node labels (points) |
| `edgeLabelSize` | number | Yes | 6-20 | 10 | Font size for edge labels (points) |
| `worldBoundary.enabled` | boolean | Yes | - | false | Enable canvas boundaries |
| `worldBoundary.minX` | number | Yes | -10000 to 0 | -2000 | Minimum X coordinate |
| `worldBoundary.maxX` | number | Yes | 0 to 10000 | 2000 | Maximum X coordinate |
| `worldBoundary.minY` | number | Yes | -10000 to 0 | -2000 | Minimum Y coordinate |
| `worldBoundary.maxY` | number | Yes | 0 to 10000 | 2000 | Maximum Y coordinate |

### Example

```json
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
}
```

---

## Nodes Array

### Structure

```json
"nodes": [
  {
    "id": "unique_identifier",
    "name": "Node Name",
    "color": "#3498db",
    "size": 15,
    "description": "Description",
    "icon": "🎯",
    "category": "Category",
    "subCat": "SubCategory",
    "priority": "Medium",
    "deadline": "",
    "userDate": "",
    "link1": "",
    "link2": "",
    "link3": "",
    "link4": "",
    "x": 400,
    "y": 300,
    "fx": null,
    "fy": null,
    "createdDate": "2026-01-11T00:00:00.000Z",
    "modifiedDate": "2026-01-11T00:00:00.000Z"
  }
]
```

### Field Specifications

#### Required Fields

| Field | Type | Range/Format | Description |
|-------|------|--------------|-------------|
| `id` | string | max 500 chars | **Unique identifier** - must be unique across all nodes |
| `name` | string | max 500 chars | Display name shown on node |
| `color` | string | #RRGGBB | Hex color code (e.g., "#3498db") |
| `size` | number | 5-30 | Visual diameter in pixels |
| `x` | number | any | X coordinate on canvas |
| `y` | number | any | Y coordinate on canvas |

#### Optional Fields

| Field | Type | Range/Format | Default | Description |
|-------|------|--------------|---------|-------------|
| `description` | string | max 10,000 chars | "" | Detailed description of the node |
| `icon` | string | max 10 chars | "" | Emoji or symbol (e.g., "🎯") |
| `category` | string | max 200 chars | "" | Primary classification |
| `subCat` | string | max 200 chars | "" | Secondary classification |
| `priority` | string | - | "Medium" | Low, Medium, High, or Critical |
| `deadline` | string | date | "" | Deadline date |
| `userDate` | string | date | "" | Custom date field |
| `link1` | string | max 2000 chars | "" | URL or reference link |
| `link2` | string | max 2000 chars | "" | URL or reference link |
| `link3` | string | max 2000 chars | "" | URL or reference link |
| `link4` | string | max 2000 chars | "" | URL or reference link |
| `fx` | number/null | any | null | Fixed X coordinate when pinned |
| `fy` | number/null | any | null | Fixed Y coordinate when pinned |
| `createdDate` | string | ISO-8601 | current | Creation timestamp |
| `modifiedDate` | string | ISO-8601 | current | Last modification timestamp |

### Node Examples

**Minimal Node (Only Required Fields):**
```json
{
  "id": "node1",
  "name": "Task A",
  "color": "#3498db",
  "size": 15,
  "x": 100,
  "y": 200
}
```

**Complete Node (All Standard Fields):**
```json
{
  "id": "task_gap_analysis",
  "name": "Conduct Gap Analysis",
  "color": "#e74c3c",
  "size": 14,
  "icon": "📊",
  "description": "Free 30-60 minute assessment of current processes against AS9100 requirements",
  "category": "task",
  "subCat": "Value Demonstration",
  "priority": "Critical",
  "deadline": "2026-02-15",
  "userDate": "2026-01-20",
  "link1": "https://example.com/gap-analysis-guide",
  "link2": "",
  "link3": "",
  "link4": "",
  "x": 1500,
  "y": 400,
  "fx": 1500,
  "fy": 400,
  "createdDate": "2026-01-11T00:00:00.000Z",
  "modifiedDate": "2026-01-11T00:00:00.000Z"
}
```

---

## Edges Array

### Structure

```json
"edges": [
  {
    "id": "unique_edge_id",
    "name": "Edge Label",
    "source": "source_node_id",
    "target": "target_node_id",
    "description": "Description of relationship",
    "relationship": "connects to",
    "color": "#95a5a6",
    "weight": 1,
    "directed": true
  }
]
```

### Field Specifications

#### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | **Unique identifier** - must be unique across all edges |
| `source` | string | **Must match an existing node.id** - starting node |
| `target` | string | **Must match an existing node.id** - ending node |

#### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `name` | string | "" | Edge label displayed on canvas |
| `description` | string | "" | Detailed description of the relationship |
| `relationship` | string | "" | Type of connection (e.g., "next", "input", "output", "depends on") |
| `color` | string | "#95a5a6" | Hex color code for the edge |
| `weight` | number (1-5) | 1 | Visual thickness of the edge |
| `directed` | boolean | false | If true, shows directional arrow |

### Edge Examples

**Minimal Edge:**
```json
{
  "id": "edge1",
  "source": "node1",
  "target": "node2"
}
```

**Complete Edge:**
```json
{
  "id": "edge_start_to_prepare",
  "name": "begin",
  "source": "start",
  "target": "task_prepare_materials",
  "description": "Start by preparing core marketing materials",
  "relationship": "next",
  "color": "#27ae60",
  "weight": 2,
  "directed": true
}
```

---

## Workflow Module Requirements (moved to a seperate file)
---

## Custom Properties

You can add unlimited custom properties to any node or edge beyond the standard fields.

### Rules for Custom Properties

1. **Property names (keys):**
   - Can be any valid JSON string
   - Avoid starting with underscore `_` (reserved for internal use)
   - Avoid names matching standard fields
   - Maximum 100 custom properties per node/edge

2. **Property values:**
   - Can be any valid JSON data type (string, number, boolean, object, array)
   - String values respect the 10,000 character limit

3. **Preservation:**
   - Custom properties are preserved when saving/loading
   - Displayed in the properties panel
   - Included in Excel exports
   - Maintained during graph operations

### Custom Property Examples

```json
{
  "id": "node1",
  "name": "Client Meeting",
  "color": "#3498db",
  "size": 15,
  "x": 0,
  "y": 0,
  
  // Custom properties
  "attendees": "John, Sarah, Mike",
  "duration_minutes": 60,
  "action_items": 5,
  "status": "completed",
  "meeting_notes_url": "https://docs.example.com/meeting-123",
  "tags": ["sales", "discovery", "high-priority"],
  "metadata": {
    "created_by": "user123",
    "department": "Sales"
  }
}
```

---

## Validation Limits

### Security and Performance Limits

| Limit Type | Maximum Value | Description |
|------------|---------------|-------------|
| **Maximum Nodes** | 10,000 | Total nodes per graph |
| **Maximum Edges** | 50,000 | Total edges per graph |
| **String Length** | 10,000 chars | Any string field (except URLs) |
| **URL Length** | 2,000 chars | link1, link2, link3, link4 fields |
| **Custom Properties** | 100 | Per node or edge |
| **Node Size** | 5-30 pixels | Visual diameter |
| **Node Label Size** | 8-24 points | Font size |
| **Edge Label Size** | 6-20 points | Font size |
| **Edge Weight** | 1-5 | Visual thickness |

### Field Validation

**Colors:**
- Must be valid hex color codes: `#RRGGBB`
- Examples: `#3498db`, `#e74c3c`, `#27ae60`

**Numbers:**
- Must be within specified ranges
- No NaN, Infinity, or -Infinity values

**Dates:**
- ISO 8601 format recommended: `2026-01-11T00:00:00.000Z`
- Other formats accepted but ISO 8601 preferred

**IDs:**
- Must be unique across all nodes (for node IDs)
- Must be unique across all edges (for edge IDs)
- Can be any string up to 500 characters
- SHA-256 hashes recommended for auto-generated IDs

---

## Complete Examples

### Example 1: Minimal Valid Graph

```json
{
  "graph": {
    "metadata": {
      "name": "Empty Graph",
      "title": "Empty Knowledge Graph",
      "description": "A minimal empty graph",
      "created": "2026-01-11T00:00:00.000Z",
      "modified": "2026-01-11T00:00:00.000Z"
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
    "nodes": [],
    "edges": []
  }
}
```

### Example 2: Simple Two-Node Graph

```json
{
  "graph": {
    "metadata": {
      "name": "simple_example",
      "title": "Simple Two-Node Example",
      "description": "Basic example with two connected nodes",
      "created": "2026-01-11T00:00:00.000Z",
      "modified": "2026-01-11T00:00:00.000Z"
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
        "id": "node_a",
        "name": "Node A",
        "color": "#3498db",
        "size": 15,
        "description": "First node",
        "category": "example",
        "x": 100,
        "y": 200
      },
      {
        "id": "node_b",
        "name": "Node B",
        "color": "#e74c3c",
        "size": 15,
        "description": "Second node",
        "category": "example",
        "x": 300,
        "y": 200
      }
    ],
    "edges": [
      {
        "id": "edge_a_to_b",
        "source": "node_a",
        "target": "node_b",
        "relationship": "connects to",
        "directed": true
      }
    ]
  }
}
```

### Example 3: Workflow with Start and End

```json
{
  "graph": {
    "metadata": {
      "name": "simple_workflow",
      "title": "Simple Workflow Example",
      "description": "Basic workflow with start, task, and end nodes",
      "created": "2026-01-11T00:00:00.000Z",
      "modified": "2026-01-11T00:00:00.000Z"
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
        "id": "start",
        "name": "Start",
        "color": "#27ae60",
        "size": 18,
        "icon": "▶️",
        "category": "start-end",
        "description": "Workflow beginning",
        "x": 100,
        "y": 300
      },
      {
        "id": "task1",
        "name": "Process Data",
        "color": "#3498db",
        "size": 15,
        "icon": "⚙️",
        "category": "task",
        "description": "Main processing task",
        "x": 300,
        "y": 300
      },
      {
        "id": "end",
        "name": "End",
        "color": "#c0392b",
        "size": 18,
        "icon": "🏁",
        "category": "start-end",
        "description": "Workflow complete",
        "x": 500,
        "y": 300
      }
    ],
    "edges": [
      {
        "id": "edge_start_to_task",
        "name": "begin",
        "source": "start",
        "target": "task1",
        "relationship": "next",
        "directed": true,
        "color": "#27ae60",
        "weight": 2
      },
      {
        "id": "edge_task_to_end",
        "name": "complete",
        "source": "task1",
        "target": "end",
        "relationship": "next",
        "directed": true,
        "color": "#3498db",
        "weight": 2
      }
    ]
  }
}
```

---

## Best Practices

### 1. Node IDs

**Recommended:**
- Use descriptive, human-readable IDs: `task_gap_analysis`, `decision_qualified`
- Use consistent naming conventions: `task_`, `decision_`, `input_`, `output_`
- For auto-generated IDs, use SHA-256 hashes

**Avoid:**
- Generic IDs like `node1`, `node2`
- Special characters that could cause issues
- Very long IDs (keep under 100 chars for readability)

### 2. Edge IDs

**Recommended:**
- Include source and target in ID: `edge_start_to_task1`
- Use descriptive names: `edge_proposal_to_negotiation`

**Avoid:**
- Sequential numbering only: `edge1`, `edge2`

### 3. Colors

**Use Consistent Color Schemes:**
- Start nodes: Green (#27ae60)
- End nodes: Red (#c0392b)
- Tasks: Blue (#3498db, #2980b9)
- Decisions: Orange/Yellow (#f39c12, #e67e22)
- Inputs: Gray (#95a5a6)
- Outputs: Gray (#7f8c8d)

### 4. Workflow Design

**For Workflow Navigator to work properly:**
1. Always include exactly ONE start node (name="Start", category="start-end")
2. Always include exactly ONE end node (name="End", category="start-end")
3. Use `relationship="next"` for workflow progression
4. Use `relationship="input"` for data inputs
5. Use `relationship="output"` for deliverables
6. Ensure all workflow nodes are connected in a chain

### 5. Documentation

**Always document:**
- Use descriptive `name` fields
- Fill in `description` fields for important nodes
- Use `category` and `subCat` for organization
- Add relevant `link1-4` references

### 6. Coordinates

**Position Planning:**
- Plan your layout before creating nodes
- Use consistent spacing (e.g., 200 pixels between nodes)
- Workflows typically flow left-to-right or top-to-bottom
- Group related nodes together spatially

### 7. File Organization

**Naming Convention:**
- Use descriptive filenames: `Client_Acquisition_Workflow.json`
- Use underscores or hyphens, not spaces
- Include version or date if maintaining multiple versions

### 8. Validation

**Before saving:**
- Ensure all required fields are present
- Verify all edge source/target IDs match existing nodes
- Check that colors are valid hex codes
- Confirm sizes and weights are within valid ranges
- Test workflow validation if using Workflow Navigator

---

## Common Issues and Solutions

### Issue 1: File Won't Load
**Symptom:** JSON file fails to open  
**Solutions:**
- Validate JSON syntax using a JSON validator
- Ensure `graph` root object exists
- Check all required fields are present
- Verify no trailing commas in arrays/objects

### Issue 2: Workflow Navigator Doesn't Work
**Symptom:** Workflow navigation unavailable or shows errors  
**Solutions:**
- Verify start node has `name="Start"` and `category="start-end"`
- Verify end node has `name="End"` and `category="start-end"`
- Check that workflow edges use `relationship="next"`
- Ensure all workflow nodes are connected

### Issue 3: Nodes Not Visible
**Symptom:** Nodes exist but don't appear on canvas  
**Solutions:**
- Check x, y coordinates are reasonable (e.g., within ±2000)
- Verify `size` is within 5-30 range
- Ensure `color` is a valid hex code
- Try "Shuffle" to reset layout

### Issue 4: Edges Not Connecting
**Symptom:** Edges defined but not visible  
**Solutions:**
- Verify `source` and `target` IDs exactly match node IDs
- Check for typos in node IDs
- Ensure nodes exist before edges reference them
- Verify edge `color` is not same as background

---

## Reference Files

**Sample files included with NodeBook:**
- `sample_graph.json` - Basic example with AI/ML concepts
- `workflow_showcase.json` - Comprehensive workflow demonstration
- `as9100_implementation.json` - AS9100 implementation process
- `iso9001_certification.json` - ISO 9001 certification workflow
- `quality_management_systems.json` - QMS framework overview

**Location:** `JSON samples/` directory

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-11 | Initial comprehensive documentation |

---

## Additional Resources

- **Help Documentation:** `help.html` in the application
- **Sample Graphs:** Check `JSON samples/` folder
- **Workflow Module:** Right-click any workflow node → "Open Workflow Navigator"

---

**End of Document**
