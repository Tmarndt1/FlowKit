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
* Minimap with custom node styles
* Controlled node, edge, and container data

### Nodes

* Draggable nodes
* Custom React node renderers
* Fixed endpoint connections
* Floating node-bound connections
* Selection state
* Group containers with draggable membership
* State classes for fold preview and hidden nodes

### Edges

* Bezier, smooth-step, and step paths
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

## Edge Paths And Animation

Set a default path type on `FlowKit`:

```tsx
<FlowKit edgePathType="bezier" />
<FlowKit edgePathType="smooth-step" />
<FlowKit edgePathType="step" />
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

Animation is opt-in through either `animatedEdges` on `FlowKit` or `animated` on an individual edge.

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

FlowKit is under active development. Planned areas include undo/redo, copy/paste, multi-select, edge labels, auto-layout, and broader keyboard support.

---

## License

MIT
