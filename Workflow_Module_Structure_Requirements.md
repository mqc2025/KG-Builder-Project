---

## Workflow Module Requirements

The Workflow Navigator feature requires specific node and edge configurations to function properly.

### Start Node Requirements

```json
{
  "id": "start",                    // ID can be anything, but "start" is recommended
  "name": "Start",                  // MUST be exactly "Start"
  "category": "start-end",          // MUST be exactly "start-end"
  "color": "#27ae60",              // Green recommended
  "size": 18,                       // Larger size recommended
  "icon": "▶️",                     // Play icon recommended
  // ...other standard fields
}
```

**Critical Requirements:**
- `name` must be exactly `"Start"` (case-sensitive)
- `category` must be exactly `"start-end"` (case-sensitive)

### End Node Requirements

```json
{
  "id": "end",                      // ID can be anything, but "end" is recommended
  "name": "End",                    // MUST be exactly "End"
  "category": "start-end",          // MUST be exactly "start-end"
  "color": "#c0392b",              // Red recommended
  "size": 18,                       // Larger size recommended
  "icon": "🏁",                     // Flag icon recommended
  // ...other standard fields
}
```

**Critical Requirements:**
- `name` must be exactly `"End"` (case-sensitive)
- `category` must be exactly `"start-end"` (case-sensitive)

### Workflow Edge Relationships

Use these standard relationship types for workflow navigation:

| Relationship | Purpose | Example |
|--------------|---------|---------|
| `"next"` | Main workflow progression | Moving from one task to the next step |
| `"input"` | Data or resource input | Document feeds into a process |
| `"output"` | Deliverable or result | Process produces a report |

**Workflow Edge Example:**
```json
{
  "id": "edge_task1_to_task2",
  "name": "proceed",
  "source": "task1",
  "target": "task2",
  "description": "Proceed to next step after completion",
  "relationship": "next",
  "directed": true,
  "color": "#3498db",
  "weight": 2
}
```

### Workflow Validation

The Workflow Navigator validates:
- ✅ Presence of start node (name="Start", category="start-end")
- ✅ Presence of end node (name="End", category="start-end")
- ✅ Connectivity of workflow chain
- ⚠️ End-to-start loops (warning only)
- ⚠️ Multiple disconnected chains (warning only)
