# Workflow Module Structure Requirements

**Version:** 2.1  
**Last Updated:** 2026-01-11  
**Purpose:** Complete requirements for AS9100-compliant workflow structures in NodeBook Knowledge Graph Builder  
**Compliance:** AS9100D Process Approach, PDCA Cycle, Risk-Based Thinking  
**Implementation:** Structural validations ENFORCED, AS9100 elements OPTIONAL

---

## Table of Contents

1. [Overview](#overview)
2. [Implementation Philosophy](#implementation-philosophy)
3. [AS9100 Process Approach Principles](#as9100-process-approach-principles)
3. [Start Node Requirements](#start-node-requirements)
4. [Task Node Requirements](#task-node-requirements)
5. [Decision Node Requirements](#decision-node-requirements)
6. [End Node Requirements](#end-node-requirements)
7. [Process Flow Requirements](#process-flow-requirements)
8. [Edge Relationship Requirements](#edge-relationship-requirements)
9. [PDCA Cycle Integration](#pdca-cycle-integration)
10. [Risk-Based Thinking Requirements](#risk-based-thinking-requirements)
11. [Documentation and Evidence Requirements](#documentation-and-evidence-requirements)
12. [Workflow Validation Rules](#workflow-validation-rules)
13. [Complete Examples](#complete-examples)

---

## Overview

The Workflow Navigator feature implements AS9100D process approach philosophy, enabling organizations to map, validate, and execute quality management system processes. All workflow structures must conform to process-based requirements including:

- **Process Approach**: Systematic definition and management of processes and their interactions
- **PDCA Cycle**: Plan-Do-Check-Act methodology for continuous improvement
- **Risk-Based Thinking**: Identification and management of risks and opportunities
- **Evidence-Based Decision Making**: Documented information supporting all decisions
- **Traceability**: Complete process flow from inputs through outputs

---

## Implementation Philosophy

### Enforced vs. Optional Validations

The Workflow Module implements **two levels of requirements**:

#### ✅ **ENFORCED - Structural Validations** (Mandatory)

These requirements are **automatically validated** by the Workflow Navigator and will generate **errors or warnings** if violated:

- **Start Node**: Must exist with `name="Start"` and `category="start-end"`, exactly ONE outgoing "next" edge
- **End Node**: Must exist with `name="End"` and `category="start-end"`, exactly ONE incoming "next" edge
- **Task Nodes**: Must have ≥1 incoming "next" edge, exactly ONE outgoing "next" edge
- **Decision Nodes**: Must have ≥1 incoming "next" edge, ≥2 outgoing "next" edges
- **Edge Relationships**: Proper use of `relationship="next"` for workflow progression
- **Connectivity**: All nodes must be reachable from Start and able to reach End

**These validations ensure your workflow is structurally sound and logically navigable.**

#### 📋 **OPTIONAL - AS9100 Process Approach Guidance** (Best Practices)

These requirements are **NOT automatically enforced** but are provided as **best practices** for organizations implementing AS9100 quality management systems:

- Process inputs/outputs documentation
- PDCA cycle phase identification
- Risk-based thinking and assessment
- Evidence-based decision criteria
- Resource requirements specification
- Monitoring and measurement points
- Documentation and traceability references

**These are recommendations to help you create AS9100-compliant workflows. You choose whether and how to implement them based on your organization's needs.**

### Why This Approach?

**Flexibility**: The tool works for any workflow type (software development, business processes, manufacturing, etc.), not just AS9100 quality management.

**Gradual Adoption**: Users can start with basic workflows and progressively add AS9100 elements as they mature their processes.

**User Choice**: Organizations decide which AS9100 elements are relevant to their specific processes and certification scope.

**Educational**: The documentation serves as a guide for those learning AS9100, without forcing compliance.

### How to Use AS9100 Guidance

1. **For AS9100 Certification Projects**: Follow all AS9100 sections to ensure complete process documentation
2. **For General Workflows**: Focus only on the enforced structural requirements
3. **For Training**: Use AS9100 sections as examples of comprehensive process documentation

**Note:** Even though AS9100 elements are not enforced by the software, they may be required by your certification body during AS9100 audits. Use the custom properties feature to document all required AS9100 elements.

---

## AS9100 Process Approach Principles

> **📋 OPTIONAL GUIDANCE**: This section provides best practices for AS9100-compliant workflows. These elements are NOT enforced by the Workflow Navigator but are recommended for organizations pursuing AS9100 certification.

### Core Requirements

Every workflow must demonstrate:

1. **Process Identification**: Clear definition of process boundaries, inputs, and outputs
2. **Process Interaction**: Documented relationships between processes
3. **Process Control**: Monitoring and measurement checkpoints
4. **Resource Management**: Defined resource requirements for each process
5. **Risk Management**: Identified risks and opportunities at decision points
6. **Continual Improvement**: Mechanisms for process optimization

### Process Elements (Per AS9100 Figure 1)

Each process node should consider:
- **Inputs**: Resources, information, or materials required
- **Activities**: Tasks or transformations performed
- **Outputs**: Products, services, or information produced
- **Monitoring Points**: Where and what to measure
- **Control Points**: Decision gates and validation steps

---

## Start Node Requirements

### Structure

```json
{
  "id": "start",
  "name": "Start",
  "category": "start-end",
  "color": "#27ae60",
  "size": 18,
  "icon": "▶️",
  "description": "Process initiation point",
  "x": 100,
  "y": 300
}
```

### Critical Requirements

| Field | Value | Validation Rule |
|-------|-------|-----------------|
| `name` | `"Start"` | MUST be exactly "Start" (case-sensitive) |
| `category` | `"start-end"` | MUST be exactly "start-end" (case-sensitive) |
| Outgoing "next" edges | Exactly 1 | MUST have ONE outgoing edge with `relationship="next"` |
| Incoming "next" edges | 0 | MUST NOT have incoming "next" edges (except end-to-start loop warning) |

### Process Approach Requirements

**Start nodes should define:**
- Initial process inputs (documented in `description` or custom properties)
- Process trigger conditions
- Required resources at initiation
- Initial risk assessment criteria

### Recommended Custom Properties

```json
{
  "processOwner": "Quality Manager",
  "processScope": "AS9100 Implementation",
  "triggerEvent": "Management review decision",
  "initialInputs": ["Management commitment", "Resource allocation"],
  "applicableStandards": ["AS9100D Clause 5.1", "ISO 9001:2015"]
}
```

---

## Task Node Requirements

### Structure

```json
{
  "id": "task_conduct_gap_analysis",
  "name": "Conduct Gap Analysis",
  "category": "task",
  "color": "#3498db",
  "size": 14,
  "icon": "⚙️",
  "description": "Review current processes against AS9100 requirements",
  "subCat": "Analysis",
  "priority": "High",
  "x": 300,
  "y": 300
}
```

### ✅ ENFORCED Requirements (Validated by Workflow Navigator)

| Field | Value | Validation Rule |
|-------|-------|-----------------|
| `category` | `"task"` | MUST be exactly "task" (case-sensitive) |
| Incoming "next" edges | ≥ 1 | MUST have at least ONE incoming edge with `relationship="next"` |
| Outgoing "next" edges | Exactly 1 | MUST have exactly ONE outgoing edge with `relationship="next"` |

**Note:** Task nodes can have MULTIPLE incoming "next" edges (merge points) but only ONE outgoing "next" edge. This allows multiple paths to converge at a task but prevents ambiguous branching (which should only occur at Decision nodes).

**Validation errors generated:**
```
❌ Task node "Conduct Gap Analysis" must have at least ONE incoming "next" edge (found 0)
❌ Task node "Process Review" must have exactly ONE outgoing "next" edge (found 3)
```

---

### 📋 OPTIONAL AS9100 Process Requirements (Best Practices - Not Enforced)

> **Note**: The following AS9100 elements are recommended for quality management workflows but are NOT validated by the system. You can add them using custom properties.

Task nodes represent the "DO" phase of PDCA and should define:

#### 1. Process Inputs
What the task requires to execute:
```json
{
  "inputs": [
    "Current quality manual",
    "AS9100D standard document",
    "Process documentation"
  ],
  "inputEdges": "Use relationship='input' edges from input nodes"
}
```

#### 2. Process Activities
What the task performs:
```json
{
  "activities": [
    "Review documented procedures",
    "Identify gaps vs. standard",
    "Document findings"
  ],
  "method": "Checklist-based assessment",
  "duration": "4-6 hours"
}
```

#### 3. Process Outputs
What the task produces:
```json
{
  "outputs": [
    "Gap analysis report",
    "Risk assessment matrix",
    "Action item list"
  ],
  "outputEdges": "Use relationship='output' edges to output nodes"
}
```

#### 4. Resources Required
```json
{
  "resources": {
    "personnel": ["Lead Auditor", "Quality Manager"],
    "competencies": ["AS9100 interpretation", "Gap analysis methodology"],
    "tools": ["Gap analysis template", "Standard reference documents"],
    "timeRequired": "4-6 hours"
  }
}
```

#### 5. Monitoring and Measurement
```json
{
  "monitoring": {
    "checkpoints": ["Completeness check", "Technical review"],
    "measurementCriteria": "100% of AS9100 clauses reviewed",
    "kpi": "Number of gaps identified",
    "acceptanceCriteria": "Report approved by Quality Manager"
  }
}
```

#### 6. Risk and Opportunity
```json
{
  "risks": [
    "Incomplete gap identification",
    "Misinterpretation of standard requirements"
  ],
  "mitigations": [
    "Use certified auditor",
    "Peer review of findings"
  ],
  "opportunities": [
    "Early identification of improvement areas",
    "Foundation for certification roadmap"
  ]
}
```

---

## Decision Node Requirements

### Structure

```json
{
  "id": "decision_gap_acceptable",
  "name": "Gaps Acceptable?",
  "category": "decision",
  "color": "#f39c12",
  "size": 16,
  "icon": "❓",
  "description": "Evaluate if identified gaps can be addressed within timeline and budget",
  "x": 500,
  "y": 300
}
```

### ✅ ENFORCED Requirements (Validated by Workflow Navigator)

| Field | Value | Validation Rule |
|-------|-------|-----------------|
| `category` | `"decision"` | MUST be exactly "decision" (case-sensitive) |
| Incoming "next" edges | ≥ 1 | MUST have at least ONE incoming edge with `relationship="next"` |
| Outgoing "next" edges | ≥ 2 | MUST have at least TWO outgoing edges with `relationship="next"` for branching |

**Note:** Decision nodes enable branching logic. They can have MULTIPLE incoming "next" edges (merge points) and MUST have at least TWO outgoing "next" edges representing different decision paths.

**Validation errors generated:**
```
❌ Decision node "Gap Acceptable?" must have at least ONE incoming "next" edge (found 0)
❌ Decision node "Approve Design?" must have at least TWO outgoing "next" edges for branching (found 1)
```

---

### 📋 OPTIONAL AS9100 Decision-Making Requirements (Best Practices - Not Enforced)

> **Note**: The following AS9100 elements are recommended for evidence-based decision making but are NOT validated by the system. You can add them using custom properties.

Decision nodes represent the "CHECK" phase of PDCA and should implement evidence-based decision making per AS9100 Clause 0.2:

#### 1. Decision Criteria
```json
{
  "decisionCriteria": [
    "Number of major gaps < 5",
    "Timeline for correction < 6 months",
    "Budget within approved limits"
  ],
  "decisionMethod": "Risk-based evaluation",
  "decisionMaker": "Quality Manager"
}
```

#### 2. Decision Inputs (Evidence Required)
```json
{
  "evidenceRequired": [
    "Gap analysis report",
    "Risk assessment",
    "Resource availability confirmation",
    "Budget approval"
  ],
  "dataSource": "Documented information from previous task"
}
```

#### 3. Decision Paths
Each outgoing edge must represent a clear decision outcome:

```json
{
  "decisionPaths": [
    {
      "outcome": "yes",
      "edgeName": "yes - proceed",
      "edgeColor": "#2ecc71",
      "nextStep": "task_develop_implementation_plan",
      "rationale": "Gaps are manageable within constraints"
    },
    {
      "outcome": "no",
      "edgeName": "no - escalate",
      "edgeColor": "#e74c3c",
      "nextStep": "task_escalate_to_management",
      "rationale": "Gaps require additional resources or timeline"
    }
  ]
}
```

#### 4. Risk-Based Evaluation
```json
{
  "riskAssessment": {
    "identifiedRisks": [
      "Proceeding with major gaps may compromise certification",
      "Delaying may impact customer requirements"
    ],
    "riskLevel": {
      "proceed": "Medium",
      "escalate": "Low"
    },
    "opportunityAssessment": "Early escalation may secure additional resources"
  }
}
```

#### 5. Documentation Requirements
```json
{
  "documentation": {
    "decisionRecord": "Required - must document decision rationale",
    "approvalRequired": true,
    "approver": "Quality Manager",
    "traceabilityReference": "Decision log entry",
    "retentionPeriod": "Life of certification + 3 years"
  }
}
```

### Decision Edge Naming Convention

**Best Practices:**
- **Yes path**: "yes - [outcome]" → Use green color (#2ecc71)
- **No path**: "no - [outcome]" → Use red color (#e74c3c)
- **Alternative paths**: Clearly labeled with decision outcome
- **Edge description**: Include rationale for taking this path

**Example:**
```json
{
  "id": "edge_decision_approved_yes",
  "name": "yes - approved",
  "source": "decision_design_approved",
  "target": "task_implement",
  "description": "Design approved, proceed to implementation",
  "relationship": "next",
  "color": "#2ecc71",
  "weight": 2,
  "directed": true
}
```

---

## End Node Requirements

### Structure

```json
{
  "id": "end",
  "name": "End",
  "category": "start-end",
  "color": "#c0392b",
  "size": 18,
  "icon": "🏁",
  "description": "Process completion - AS9100 implementation certified",
  "x": 900,
  "y": 300
}
```

### Critical Requirements

| Field | Value | Validation Rule |
|-------|-------|-----------------|
| `name` | `"End"` | MUST be exactly "End" (case-sensitive) |
| `category` | `"start-end"` | MUST be exactly "start-end" (case-sensitive) |
| Incoming "next" edges | Exactly 1 | MUST have ONE incoming edge with `relationship="next"` |
| Outgoing "next" edges | 0 | MUST NOT have outgoing "next" edges (except end-to-start loop warning) |

### Process Approach Requirements

**End nodes should define:**
- Final process outputs (documented in `description` or custom properties)
- Process completion criteria
- Success metrics achieved
- Required documentation/evidence

### Recommended Custom Properties

```json
{
  "processOutputs": ["AS9100 certification", "Certified quality manual", "Trained personnel"],
  "completionCriteria": "Certification audit passed with zero major NCs",
  "successMetrics": {
    "certificationAchieved": true,
    "timeToCompletion": "6 months",
    "budgetVariance": "-5%"
  },
  "documentedEvidence": [
    "Certification certificate",
    "Final audit report",
    "Management review minutes"
  ]
}
```

---

## Process Flow Requirements

### Input Nodes

Represent data, documents, or resources that feed INTO a process:

```json
{
  "id": "input_as9100_standard",
  "name": "AS9100D Standard Document",
  "category": "input",
  "color": "#95a5a6",
  "size": 12,
  "icon": "📄",
  "description": "Reference standard for gap analysis",
  "x": 200,
  "y": 200
}
```

**Connect using:**
```json
{
  "id": "edge_input_to_task",
  "name": "reference",
  "source": "input_as9100_standard",
  "target": "task_conduct_gap_analysis",
  "relationship": "input",
  "directed": true,
  "color": "#95a5a6"
}
```

### Output Nodes

Represent deliverables, reports, or products that emerge FROM a process:

```json
{
  "id": "output_gap_report",
  "name": "Gap Analysis Report",
  "category": "output",
  "color": "#7f8c8d",
  "size": 12,
  "icon": "📋",
  "description": "Documented gaps vs. AS9100 requirements",
  "x": 400,
  "y": 200
}
```

**Connect using:**
```json
{
  "id": "edge_task_to_output",
  "name": "produces",
  "source": "task_conduct_gap_analysis",
  "target": "output_gap_report",
  "relationship": "output",
  "directed": true,
  "color": "#7f8c8d"
}
```

### Process Interaction Mapping

**AS9100 requires understanding of process interactions:**

```json
{
  "processInteractions": {
    "upstream": [
      "Management review process",
      "Resource planning process"
    ],
    "downstream": [
      "Implementation planning process",
      "Training process"
    ],
    "supportingProcesses": [
      "Document control",
      "Internal audit"
    ]
  }
}
```

---

## Edge Relationship Requirements

### Standard Relationship Types

| Relationship | Purpose | Color Recommendation | Used For |
|--------------|---------|----------------------|----------|
| `"next"` | Sequential workflow progression | #3498db (blue) | Main workflow path |
| `"input"` | Data/resource flowing INTO process | #95a5a6 (gray) | Inputs to tasks |
| `"output"` | Deliverable/result FROM process | #7f8c8d (dark gray) | Outputs from tasks |
| `"depends on"` | Dependency relationship | #9b59b6 (purple) | Prerequisites |
| `"validates"` | Verification/validation | #16a085 (teal) | Quality checks |
| `"supports"` | Supporting process | #f39c12 (orange) | Enabling processes |

### Workflow Edge Requirements

**For "next" relationship edges (workflow progression):**

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

**Required fields for workflow edges:**
- `relationship`: MUST be "next"
- `directed`: MUST be true
- `source`: MUST reference existing node ID
- `target`: MUST reference existing node ID

### Edge Documentation

**Best practices for edge descriptions:**
- Describe transition condition or trigger
- Reference completion criteria from source node
- Indicate what information flows along this edge
- Document any approval or validation required

---

## PDCA Cycle Integration

> **📋 OPTIONAL GUIDANCE**: PDCA cycle tagging is a best practice for AS9100 workflows but is NOT enforced by the Workflow Navigator. Use custom properties to tag nodes with PDCA phases.

### Plan Phase (Start → Tasks)

**Nodes:** Start, Planning Tasks, Decision Nodes  
**Focus:** Establish objectives, identify risks, allocate resources

```json
{
  "pdcaPhase": "plan",
  "planningElements": {
    "objectives": "Achieve AS9100 certification",
    "scope": "Quality management system implementation",
    "risks": ["Resource constraints", "Timeline pressure"],
    "resources": ["Quality Manager", "Budget allocation"],
    "successCriteria": "Certification achieved within 6 months"
  }
}
```

### Do Phase (Task Nodes)

**Nodes:** Task Nodes  
**Focus:** Execute planned activities

```json
{
  "pdcaPhase": "do",
  "executionElements": {
    "activities": ["Conduct gap analysis", "Develop procedures"],
    "responsibilities": "Quality Manager, Process owners",
    "timeline": "Weeks 1-12",
    "deliverables": ["Gap report", "Documented procedures"]
  }
}
```

### Check Phase (Decision Nodes, Validation Tasks)

**Nodes:** Decision Nodes, Review Tasks  
**Focus:** Monitor, measure, evaluate results

```json
{
  "pdcaPhase": "check",
  "checkElements": {
    "measurements": ["Number of gaps closed", "Procedure completion rate"],
    "evaluationCriteria": "All major gaps addressed",
    "decisionPoint": "Proceed to certification audit?",
    "evidence": ["Internal audit results", "Management review records"]
  }
}
```

### Act Phase (Improvement Tasks, End)

**Nodes:** Corrective Action Tasks, End Node  
**Focus:** Take action on findings, improve

```json
{
  "pdcaPhase": "act",
  "actElements": {
    "improvements": ["Process optimization", "Training enhancements"],
    "correctiveActions": ["Address audit findings", "Update procedures"],
    "lessons": "Document lessons learned",
    "continualImprovement": "Establish monitoring for ongoing compliance"
  }
}
```

---

## Risk-Based Thinking Requirements

> **📋 OPTIONAL GUIDANCE**: Risk-based thinking is a best practice for AS9100 workflows but is NOT enforced by the Workflow Navigator. Use custom properties to document risks and opportunities.

### Risk Identification Points

**Where to identify risks:**
1. **Start Node**: Initial process risks and opportunities
2. **Task Nodes**: Operational risks during execution
3. **Decision Nodes**: Decision-related risks (wrong decision impact)
4. **End Node**: Residual risks and opportunities

### Risk Assessment Structure

```json
{
  "riskAssessment": {
    "identifiedRisks": [
      {
        "id": "risk_001",
        "description": "Incomplete gap analysis",
        "likelihood": "Medium",
        "impact": "High",
        "riskLevel": "High",
        "mitigation": "Use experienced auditor, peer review"
      }
    ],
    "opportunities": [
      {
        "id": "opp_001",
        "description": "Early certification may attract new customers",
        "likelihood": "High",
        "benefit": "High",
        "exploitationStrategy": "Accelerate implementation timeline"
      }
    ]
  }
}
```

### Risk Control Methods

**At each node, consider:**
- **Preventive controls**: Actions to prevent risk occurrence
- **Detective controls**: Monitoring to detect risk occurrence
- **Corrective controls**: Actions if risk occurs

---

## Documentation and Evidence Requirements

> **📋 OPTIONAL GUIDANCE**: Documentation requirements are best practices for AS9100 workflows but are NOT enforced by the Workflow Navigator. Maintain these records per your organization's AS9100 certification requirements.

### Required Documentation

**For each workflow, maintain:**

1. **Process Description**
   ```json
   {
     "processName": "AS9100 Implementation",
     "processOwner": "Quality Manager",
     "processScope": "Complete QMS implementation",
     "processObjective": "Achieve AS9100 certification"
   }
   ```

2. **Process Inputs**
   - What initiates the process
   - Required resources
   - Input specifications

3. **Process Outputs**
   - Expected deliverables
   - Output specifications
   - Acceptance criteria

4. **Monitoring Records**
   - KPIs measured at each node
   - Actual vs. planned performance
   - Trend analysis

5. **Decision Records**
   - Decision criteria
   - Evidence reviewed
   - Decision rationale
   - Approval signatures

### Traceability Requirements

**Every workflow must enable:**
- Forward traceability: From inputs through to outputs
- Backward traceability: From outputs back to inputs
- Decision traceability: Documented rationale for all decisions

```json
{
  "traceability": {
    "inputToOutput": "Complete chain documented",
    "decisionRecords": "All decision points logged",
    "changeHistory": "Version control maintained",
    "auditTrail": "Complete workflow execution history"
  }
}
```

---

## Workflow Validation Rules

### What the Workflow Navigator Validates

The Workflow Navigator automatically validates and enforces these rules:

#### 1. Structural Validation (ERRORS - Block Navigation)
- ✅ Presence of exactly ONE start node (name="Start", category="start-end")
- ✅ Presence of exactly ONE end node (name="End", category="start-end")
- ✅ Start node has exactly ONE outgoing "next" edge
- ✅ End node has exactly ONE incoming "next" edge

#### 2. Node-Type Validation
- ✅ Task nodes: ≥1 incoming, exactly 1 outgoing "next" edges
- ✅ Decision nodes: ≥1 incoming, ≥2 outgoing "next" edges
- ⚠️ Unknown category nodes: Warning if multiple outgoing "next" edges

#### 3. Connectivity Validation
- ✅ All nodes reachable from Start
- ✅ All nodes can reach End
- ⚠️ Warning for end-to-start loops (allowed but flagged)
- ⚠️ Warning for multiple disconnected workflow chains

#### 4. Edge Validation
- ✅ All edge source IDs match existing nodes
- ✅ All edge target IDs match existing nodes
- ✅ "next" edges are directed
- ⚠️ Warning if workflow contains cycles (loops)

### What the Workflow Navigator Does NOT Validate

The following AS9100 process elements are **NOT automatically validated** and remain the user's responsibility:

- ❌ Process inputs/outputs completeness
- ❌ PDCA cycle phase tagging
- ❌ Risk assessment documentation
- ❌ Evidence-based decision criteria
- ❌ Resource allocation specifications
- ❌ Monitoring/measurement point definitions
- ❌ Documentation references and traceability
- ❌ Decision rationale and approval records

**These elements are best practices recommendations, not enforced requirements.** Organizations pursuing AS9100 certification should document these elements using custom node properties.

---

### Validation Messages

**Error Messages (Workflow INVALID):**
```
❌ Missing start node (name="Start", category="start-end")
❌ Start node "Start" must have exactly ONE outgoing "next" edge (found 0)
❌ Task node "Conduct Analysis" must have exactly ONE outgoing "next" edge (found 3)
❌ Decision node "Approve?" must have at least TWO outgoing "next" edges for branching (found 1)
```

**Warning Messages (Workflow VALID but with advisories):**
```
⚠️ End-to-start loop detected (allowed for cyclical processes)
⚠️ Node "Review Process" has multiple outgoing "next" edges (2). Consider using a decision node.
⚠️ Multiple disconnected workflow chains detected
```

---

## Complete Examples

### Example 1: Simple Linear Workflow

**Process:** Document Review and Approval

```json
{
  "nodes": [
    {
      "id": "start",
      "name": "Start",
      "category": "start-end",
      "description": "Begin document review process"
    },
    {
      "id": "task_review",
      "name": "Review Document",
      "category": "task",
      "description": "Technical review of document content",
      "inputs": ["Draft document"],
      "outputs": ["Review comments"],
      "resources": ["Technical reviewer"],
      "duration": "2 hours"
    },
    {
      "id": "decision_approved",
      "name": "Document Approved?",
      "category": "decision",
      "decisionCriteria": ["Technical accuracy", "Completeness", "Format compliance"]
    },
    {
      "id": "task_revise",
      "name": "Revise Document",
      "category": "task",
      "description": "Incorporate review comments"
    },
    {
      "id": "task_publish",
      "name": "Publish Document",
      "category": "task",
      "description": "Release approved document"
    },
    {
      "id": "end",
      "name": "End",
      "category": "start-end",
      "description": "Document published"
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "start",
      "target": "task_review",
      "relationship": "next"
    },
    {
      "id": "e2",
      "source": "task_review",
      "target": "decision_approved",
      "relationship": "next"
    },
    {
      "id": "e3",
      "name": "yes - approved",
      "source": "decision_approved",
      "target": "task_publish",
      "relationship": "next",
      "color": "#2ecc71"
    },
    {
      "id": "e4",
      "name": "no - needs revision",
      "source": "decision_approved",
      "target": "task_revise",
      "relationship": "next",
      "color": "#e74c3c"
    },
    {
      "id": "e5",
      "name": "resubmit",
      "source": "task_revise",
      "target": "task_review",
      "relationship": "next",
      "color": "#f39c12"
    },
    {
      "id": "e6",
      "source": "task_publish",
      "target": "end",
      "relationship": "next"
    }
  ]
}
```

### Example 2: Workflow with Merge Point

**Process:** Multi-Path Convergence

```json
{
  "nodes": [
    {
      "id": "start",
      "name": "Start",
      "category": "start-end"
    },
    {
      "id": "decision_method",
      "name": "Choose Method?",
      "category": "decision",
      "description": "Select implementation approach"
    },
    {
      "id": "task_method_a",
      "name": "Execute Method A",
      "category": "task"
    },
    {
      "id": "task_method_b",
      "name": "Execute Method B",
      "category": "task"
    },
    {
      "id": "task_consolidate",
      "name": "Consolidate Results",
      "category": "task",
      "description": "MERGE POINT: Multiple paths converge here"
    },
    {
      "id": "end",
      "name": "End",
      "category": "start-end"
    }
  ],
  "edges": [
    {
      "source": "start",
      "target": "decision_method",
      "relationship": "next"
    },
    {
      "name": "method A",
      "source": "decision_method",
      "target": "task_method_a",
      "relationship": "next"
    },
    {
      "name": "method B",
      "source": "decision_method",
      "target": "task_method_b",
      "relationship": "next"
    },
    {
      "source": "task_method_a",
      "target": "task_consolidate",
      "relationship": "next",
      "description": "First incoming edge to merge point"
    },
    {
      "source": "task_method_b",
      "target": "task_consolidate",
      "relationship": "next",
      "description": "Second incoming edge to merge point"
    },
    {
      "source": "task_consolidate",
      "target": "end",
      "relationship": "next"
    }
  ]
}
```

**Note:** The task "Consolidate Results" has TWO incoming "next" edges, which is valid for task nodes (merge point). It has only ONE outgoing edge, as required.

### Example 3: Input/Output Process Flow

**Process:** Gap Analysis with Inputs and Outputs

```json
{
  "nodes": [
    {
      "id": "start",
      "name": "Start",
      "category": "start-end"
    },
    {
      "id": "input_standard",
      "name": "AS9100 Standard",
      "category": "input",
      "color": "#95a5a6"
    },
    {
      "id": "input_current_qms",
      "name": "Current QMS Documentation",
      "category": "input",
      "color": "#95a5a6"
    },
    {
      "id": "task_gap_analysis",
      "name": "Conduct Gap Analysis",
      "category": "task",
      "pdcaPhase": "do"
    },
    {
      "id": "output_gap_report",
      "name": "Gap Analysis Report",
      "category": "output",
      "color": "#7f8c8d"
    },
    {
      "id": "output_action_plan",
      "name": "Action Plan",
      "category": "output",
      "color": "#7f8c8d"
    },
    {
      "id": "end",
      "name": "End",
      "category": "start-end"
    }
  ],
  "edges": [
    {
      "source": "start",
      "target": "task_gap_analysis",
      "relationship": "next"
    },
    {
      "name": "reference",
      "source": "input_standard",
      "target": "task_gap_analysis",
      "relationship": "input",
      "color": "#95a5a6"
    },
    {
      "name": "baseline",
      "source": "input_current_qms",
      "target": "task_gap_analysis",
      "relationship": "input",
      "color": "#95a5a6"
    },
    {
      "name": "produces",
      "source": "task_gap_analysis",
      "target": "output_gap_report",
      "relationship": "output",
      "color": "#7f8c8d"
    },
    {
      "name": "produces",
      "source": "task_gap_analysis",
      "target": "output_action_plan",
      "relationship": "output",
      "color": "#7f8c8d"
    },
    {
      "source": "task_gap_analysis",
      "target": "end",
      "relationship": "next"
    }
  ]
}
```

---

## AS9100 Compliance Checklist

> **📋 OPTIONAL SELF-ASSESSMENT**: Use this checklist to verify your workflow includes AS9100 best practices. These items are NOT automatically validated by the Workflow Navigator.

When creating workflows for AS9100 certification, verify:

### Process Approach
- [ ] Process boundaries clearly defined (start/end nodes)
- [ ] Process inputs identified (input nodes or custom properties)
- [ ] Process outputs identified (output nodes or custom properties)
- [ ] Process interactions documented (edge relationships)
- [ ] Resource requirements defined (task node properties)

### PDCA Cycle
- [ ] Plan phase nodes identified (planning tasks, decisions)
- [ ] Do phase nodes identified (execution tasks)
- [ ] Check phase nodes identified (review tasks, decision nodes)
- [ ] Act phase nodes identified (improvement tasks)

### Risk-Based Thinking
- [ ] Risks identified at relevant nodes
- [ ] Opportunities identified where applicable
- [ ] Risk mitigation strategies defined
- [ ] Decision nodes include risk assessment

### Evidence-Based Decision Making
- [ ] Decision criteria documented
- [ ] Evidence requirements specified
- [ ] Decision rationale can be recorded
- [ ] Traceability maintained

### Documentation
- [ ] All nodes have descriptions
- [ ] Critical custom properties defined
- [ ] Process owner identified
- [ ] Applicable standards referenced

### Validation
- [ ] Workflow passes structural validation
- [ ] All nodes reachable from Start
- [ ] All nodes can reach End
- [ ] No disconnected nodes
- [ ] Edge relationships correctly typed

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.1 | 2026-01-11 | Clarified implementation philosophy: Structural validations are ENFORCED, AS9100 elements are OPTIONAL guidance |
| 2.0 | 2026-01-11 | Complete AS9100 integration: Added Task and Decision node requirements, PDCA cycle, risk-based thinking, process approach principles, documentation requirements |
| 1.0 | 2025-12-29 | Initial version with Start/End nodes and basic edge relationships |

---

**End of Document**
