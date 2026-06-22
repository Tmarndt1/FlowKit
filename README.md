# FlowKit

<p align="center">
  <img src="./docs/images/FlowKit.png" alt="FlowKit Example" width="100%" />
</p>

<p align="center">
  A React + TypeScript library for building node editors, workflow designers, network diagrams, and flow-based applications.
</p>

---

## Overview

FlowKit provides the building blocks for interactive node-based experiences in React. It aims to include common graph-editor capabilities in the library itself, while keeping rendering, styling, and state ownership flexible for application teams.

Use it for workflow engines, automation builders, network topology editors, ETL pipelines, visual scripting tools, and low-code interfaces.

---

## Features

### Canvas

* Pannable and zoomable workspace
* Grid backgrounds and grid snapping
* Recenter and zoom controls
* Read-only mode for non-editable diagrams
* Minimap with custom node styles
* Controlled node, edge, and container data

### Nodes

* Draggable nodes
* Custom React node renderers
* Fixed endpoint connections
* Floating node-bound connections
* Selection state
* Group containers with draggable membership
* Optional container resize-to-fit behavior
* State classes for fold preview and hidden nodes

### Edges

* Bezier, smooth-step, step, and straight paths
* Built-in route shaping for node avoidance and parallel edge offsets
* Optional animated flow paths
* Source, target, or bidirectional arrows
* Custom edge renderers
* Edge selection
* Collapsible edge controls
* Upstream, downstream, both-sides, or connection-only folding

### Customization

* CSS class hooks for nodes, edges, endpoints, controls, minimap, and containers
* CSS variables for common colors
* Per-edge path type, animation, collapse, arrows, and styles
* Custom node and edge component maps
* Public helper for advanced fold-state derivation

---

## Installation

```bash
npm install flowkit
```

FlowKit lists React 19 as a peer dependency, so make sure `react` is installed in your app.

Import the components you need and FlowKit's stylesheet once at your app entry point:

```tsx
import { FlowKit } from "flowkit";
import "flowkit/styles.css";
```

The default styles are intended as a starting point — override the CSS class hooks (see [Styling](#styling)) to match your design.

---

## Basic Usage

```tsx
import {
  FlowKit,
  FlowKitControls,
  FlowKitEvents,
  FlowKitGrid,
  FlowKitGridSnap,
  IEdge,
  INode,
  Position,
} from "flowkit";

const nodes: INode<any, any>[] = [
  {
    key: "input",
    type: "node",
    offset: { x: 80, y: 80 },
    endpoints: [{ id: "input-out", offset: { x: 120, y: 20 }, position: Position.Right }],
  },
  {
    key: "result",
    type: "node",
    offset: { x: 360, y: 80 },
    endpoints: [{ id: "result-in", offset: { x: 0, y: 20 }, position: Position.Left }],
  },
];

const edges: IEdge<any>[] = [
  {
    key: "edge-input-result",
    type: "edge",
    sourceId: "input-out",
    targetId: "result-in",
    arrows: "target",
  },
];

export function App() {
  return (
    <FlowKit nodes={nodes} edges={edges} edgePathType="smooth-step" centerOnLoad>
      <FlowKitGrid size={32} />
      <FlowKitControls />
      <FlowKitEvents />
      <FlowKitGridSnap size={24} />
    </FlowKit>
  );
}
```

---

## Floating Edges

Floating edges connect to node bounds instead of fixed endpoint elements. Use `anchorMode: "floating"` and pass node keys as `sourceId` and `targetId`.

```ts
const edge = {
  key: "edge-router-switch",
  type: "edge",
  anchorMode: "floating",
  sourceId: "router",
  targetId: "switch",
  arrows: "target",
};
```

FlowKit measures the source and target nodes and chooses the side of each node that faces the other node. When nodes are dragged, the anchors update automatically.

If your data model still needs endpoint ids, provide explicit node ids:

```ts
const edge = {
  key: "edge-port-port",
  type: "edge",
  anchorMode: "floating",
  sourceId: "router-port-a",
  targetId: "switch-port-b",
  sourceNodeId: "router",
  targetNodeId: "switch",
};
```

---

## Presets

FlowKit ships optional preset node libraries for common starting points. The core canvas stays generic; presets provide reusable node definitions, renderers, and creation helpers.

### Workflow

```tsx
import {
  FlowKit,
  createWorkflowNode,
  workflowNodeTypes,
  workflowPresets,
} from "flowkit";

const nodes = [
  createWorkflowNode("number-input", "number-a", { x: 80, y: 120 }, { value: "10" }),
  createWorkflowNode("logic-if-else", "if-else", { x: 360, y: 120 }),
  createWorkflowNode("logic-switch", "switch-case", { x: 640, y: 120 }),
  createWorkflowNode("policy-decision-table", "decision-table", { x: 920, y: 120 }),
];

export function Workflow() {
  return <FlowKit nodes={nodes} edges={[]} nodeTypes={workflowNodeTypes} />;
}
```

The workflow preset includes the standard demo's input, math, logic, policy, utility, and output nodes, including the styled `logic-if-else`, multi-output `logic-switch`, and orange `policy-decision-table` nodes. The old `policy-threshold` key remains available as a compatibility alias.

### Shapes

```tsx
import { FlowKit, createShapeNode, shapeNodeTypes } from "flowkit";

const nodes = [
  createShapeNode("diamond", "decision", { x: 100, y: 100 }),
  createShapeNode("square", "task", { x: 320, y: 100 }),
];

export function Diagram() {
  return <FlowKit nodes={nodes} edges={[]} nodeTypes={shapeNodeTypes} />;
}
```

---

## Collapsible Edges

Enable built-in folding with `collapsibleEdges`. FlowKit renders a control at the middle of each edge and supports connection-only, downstream, upstream, and both-side collapse modes.

```tsx
<FlowKit
  nodes={nodes}
  edges={edges}
  collapsibleEdges
  onEdgeCollapsedChange={({ edge, collapsed, mode }) => {
    setEdges((current) =>
      current.map((item) =>
        item.key === edge.key
          ? { ...item, collapsed, collapseMode: collapsed ? mode : undefined }
          : item
      )
    );
  }}
/>
```

FlowKit derives affected nodes and edges internally. Apps only need to persist `edge.collapsed` and `edge.collapseMode` when they want controlled state.

Useful state classes:

* `.flow-kit-node-fold-preview`
* `.flow-kit-node-fold-hidden`
* `.flow-kit-edge-fold-preview`
* `.flow-kit-edge-path.folded`
* `.flow-kit-edge-path.fold-stub`

For advanced integrations, `getFoldGraphState` is exported.

---

## Containers

Containers resize around their assigned nodes by default. Disable that behavior per container when you want a container to keep its current rendered size after nodes are dragged in or out.

```ts
const containers = [
  {
    key: "rack-a",
    label: "Rack A",
    nodeKeys: ["router", "switch"],
    resizeToFit: false,
  },
];
```

When `resizeToFit` is `false`, FlowKit preserves the rendered container position and size during membership changes. Users can still move or manually resize the container unless `readOnly` is enabled.

---

## Read-Only Mode

Set `readOnly` when the diagram should be inspectable but not editable.

```tsx
<FlowKit nodes={nodes} edges={edges} readOnly>
  <FlowKitGrid />
  <FlowKitControls />
  <FlowKitEvents />
</FlowKit>
```

Read-only mode preserves pan, zoom, recenter, node/edge selection, minimaps, legends, and labels. It disables node dragging, container dragging/resizing, endpoint connection creation, edge collapse controls, paste, and keyboard deletion.

---

## Edge Paths And Animation

Set a default path type on `FlowKit`:

```tsx
<FlowKit edgePathType="bezier" />
<FlowKit edgePathType="smooth-step" />
<FlowKit edgePathType="step" />
<FlowKit edgePathType="straight" />
```

Override per edge:

```ts
const edge = {
  key: "edge-a-b",
  type: "edge",
  sourceId: "a-out",
  targetId: "b-in",
  pathType: "smooth-step",
  animated: true,
};
```

Animation is opt-in per edge with `animated: true`.

---

## Edge Routing

Use `edgeRouting` to shape built-in edge paths when diagrams get dense.

```tsx
<FlowKit
  nodes={nodes}
  edges={edges}
  edgePathType="smooth-step"
  edgeRouting={{
    avoidNodes: true,
    parallelOffset: 18,
  }}
/>
```

Available options:

* `avoidNodes`: routes edges around rendered node bounds when possible. This is strongest with `smooth-step` and `step` paths, and uses a conservative curved detour for Bezier paths.
* `parallelOffset`: fans out multiple edges that connect the same source/target node pair.

Override per edge:

```ts
const edge = {
  key: "edge-a-b",
  type: "edge",
  sourceId: "a",
  targetId: "b",
  routing: {
    avoidNodes: false,
    parallelOffset: 28,
  },
};
```

---

## External Viewport Controls

Use a `FlowKit` ref when controls live outside the canvas, such as topology search results, alert panels, or device tables.

```tsx
import * as React from "react";
import { FlowKit, FlowKitHandle } from "flowkit";

export function TopologyView() {
  const flowRef = React.useRef<FlowKitHandle>(null);

  return (
    <>
      <button onClick={() => flowRef.current?.panToNode("router-01")}>
        Show router
      </button>
      <button onClick={() => flowRef.current?.recenter()}>
        Recenter topology
      </button>

      <FlowKit ref={flowRef} nodes={nodes} edges={edges} />
    </>
  );
}
```

The same controls are available to components rendered inside `FlowKit` through `useFlowKitControls()`.

---

## Selection

FlowKit supports both single and multi-selection out of the box.

* Click a node or edge to select it, replacing the previous selection.
* Hold `Shift`, `Ctrl`, or `Cmd` and click to add or remove a node or edge from the current selection.
* Hold `Shift` and drag across empty canvas to draw a marquee box; every node it touches is added to the selection. A plain drag still pans the canvas.
* Dragging any selected node moves the whole selection together.

Read the current selection from components rendered inside `FlowKit`:

```tsx
import { useNodeFlowSelectedNodes, useNodeFlowSelectedEdges } from "flowkit";

function SelectionCount() {
  const nodes = useNodeFlowSelectedNodes();
  const edges = useNodeFlowSelectedEdges();

  return <span>{nodes.length} nodes, {edges.length} edges selected</span>;
}
```

`useNodeFlowSelection()` still returns the most recently selected element for single-selection use cases.

Multi-selection is enabled by default. Set `multiSelect={false}` on `FlowKit` to restrict interactions to single selection:

```tsx
<FlowKit nodes={nodes} edges={edges} multiSelect={false} />
```

---

## Styling

FlowKit ships with default CSS classes and expects applications to override them as needed.

Common hooks:

```css
.flow-kit {}
.flow-kit-viewport {}
.flow-kit-node-wrapper {}
.flow-kit-node {}
.flow-kit-endpoint {}
.flow-kit-edge-path {}
.flow-kit-controls {}
.flow-kit-mini-map {}
.flow-kit-node-container {}
```

Example:

```css
.flow-kit-edge-path {
  stroke: #67e8f9;
  stroke-width: 2.5;
}

.flow-kit-node-fold-hidden {
  opacity: 0;
  pointer-events: none;
}
```

---

## Demo

The demo includes a workflow editor and a floating-edge network diagram.

```bash
npm install
npm run build

cd demo
npm install
npm run dev
```

---

## Status

FlowKit is under active development. Planned areas include undo/redo, copy/paste, auto-layout, bundled edges, self-loops, and broader keyboard support.

---

## License

MIT
