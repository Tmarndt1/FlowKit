import * as React from "react";
import {
  FlowKit,
  FlowKitControls,
  FlowKitHandle,
  EdgePathType,
  workflowNodeTypes,
  createWorkflowNode,
  createWorkflowEdge,
  hierarchicalLayout,
  forceLayout,
  placeConnected,
  findFreePosition,
  LayoutNode,
  LayoutEdge,
} from "../../../lib/index";
import { Position } from "../../../lib/enums/Position";
import type { WorkflowEdge, WorkflowNode } from "../types";

type LayoutMode = "hierarchical-lr" | "hierarchical-tb" | "force" | "incremental";

function makeEdge(key: string, sourceId: string, targetId: string): WorkflowEdge {
  return createWorkflowEdge(key, sourceId, targetId) as WorkflowEdge;
}

const INITIAL_NODES: WorkflowNode[] = [
  createWorkflowNode("number-input",  "al-a",  { x: 420, y:  80 }, { subtitle: "Input A",   value: "10" }),
  createWorkflowNode("number-input",  "al-b",  { x: 120, y: 320 }, { subtitle: "Input B",   value: "5"  }),
  createWorkflowNode("number-input",  "al-c",  { x: 580, y: 440 }, { subtitle: "Constant",  value: "2"  }),
  createWorkflowNode("math-multiply", "al-mul",{ x: 700, y: 160 }),
  createWorkflowNode("math-add",      "al-add",{ x: 280, y: 500 }),
  createWorkflowNode("math-divide",   "al-div",{ x: 520, y: 620 }),
  createWorkflowNode("logic-greater-than", "al-gt", { x: 100, y: 640 }),
  createWorkflowNode("logic-if-else",      "al-if", { x: 780, y: 420 }),
  createWorkflowNode("result-output", "al-ok",  { x:  60, y: 180 }, { variant: "success" }),
  createWorkflowNode("result-output", "al-warn",{ x: 940, y: 560 }, { variant: "warning" }),
] as WorkflowNode[];

function srcR(node: WorkflowNode) {
  return node.endpoints.find((e) => e.position === Position.Right)?.id ?? node.key;
}
function tgtL(node: WorkflowNode) {
  return node.endpoints.find((e) => e.position === Position.Left)?.id ?? node.key;
}

function nodeById(key: string) {
  return INITIAL_NODES.find((n) => n.key === key)!;
}

const INITIAL_EDGES: WorkflowEdge[] = [
  makeEdge("al-e1",  srcR(nodeById("al-a")),   tgtL(nodeById("al-mul"))),
  makeEdge("al-e2",  srcR(nodeById("al-b")),   tgtL(nodeById("al-add"))),
  makeEdge("al-e3",  srcR(nodeById("al-c")),   tgtL(nodeById("al-div"))),
  makeEdge("al-e4",  srcR(nodeById("al-mul")), tgtL(nodeById("al-if"))),
  makeEdge("al-e5",  srcR(nodeById("al-add")), tgtL(nodeById("al-gt"))),
  makeEdge("al-e6",  srcR(nodeById("al-add")), tgtL(nodeById("al-div"))),
  makeEdge("al-e7",  srcR(nodeById("al-gt")),  tgtL(nodeById("al-if"))),
  makeEdge("al-e8",  srcR(nodeById("al-if")),  tgtL(nodeById("al-ok"))),
  makeEdge("al-e9",  srcR(nodeById("al-if")),  tgtL(nodeById("al-warn"))),
];

function toLayoutNodes(nodes: WorkflowNode[]): LayoutNode[] {
  return nodes.map((n) => ({
    key: n.key,
    x: n.offset.x,
    y: n.offset.y,
    width: document.getElementById(n.key)?.offsetWidth ?? 160,
    height: document.getElementById(n.key)?.offsetHeight ?? 80,
  }));
}

function toLayoutEdges(nodes: WorkflowNode[], edges: WorkflowEdge[]): LayoutEdge[] {
  const endpointToNode = new Map<string, string>();
  nodes.forEach((n) => {
    endpointToNode.set(n.key, n.key);
    n.endpoints.forEach((e) => endpointToNode.set(e.id, n.key));
  });
  return edges.flatMap((e) => {
    const s = endpointToNode.get(e.sourceId);
    const t = endpointToNode.get(e.targetId);
    return s && t ? [{ sourceId: s, targetId: t }] : [];
  });
}

const LAYOUT_OPTIONS: { id: LayoutMode; label: string; description: string; accent: string }[] = [
  {
    id: "hierarchical-lr",
    label: "Hierarchical LR",
    description: "Left-to-right DAG layout. Ranks nodes by longest path from sources.",
    accent: "#43dc83",
  },
  {
    id: "hierarchical-tb",
    label: "Hierarchical TB",
    description: "Top-to-bottom DAG layout. Same algorithm, vertical orientation.",
    accent: "#68e8ff",
  },
  {
    id: "force",
    label: "Force-Directed",
    description: "Fruchterman-Reingold spring simulation. Connected nodes attract, all nodes repel.",
    accent: "#a477ff",
  },
  {
    id: "incremental",
    label: "Incremental",
    description: "Places each node near its connected peers. Good for sparse graphs.",
    accent: "#ff9f43",
  },
];

type AutoLayoutDemoProps = {
  animatedEdges: boolean;
  edgePathType: EdgePathType;
};

export function AutoLayoutDemo({ animatedEdges, edgePathType }: AutoLayoutDemoProps) {
  const [nodes, setNodes] = React.useState<WorkflowNode[]>(INITIAL_NODES);
  const [activeLayout, setActiveLayout] = React.useState<LayoutMode | null>(null);
  const [layoutTick, setLayoutTick] = React.useState(0);
  const flowKitRef = React.useRef<FlowKitHandle | null>(null);

  // Recenter the viewport after each layout application.
  // FlowKit handles edge redraws internally via useLayoutEffect when nodes change.
  React.useEffect(() => {
    if (layoutTick === 0) return;
    flowKitRef.current?.recenter();
  }, [layoutTick]);

  const applyLayout = React.useCallback((mode: LayoutMode) => {
    setActiveLayout(mode);
    setNodes((currentNodes) => {
      const lNodes = toLayoutNodes(currentNodes);
      const lEdges = toLayoutEdges(currentNodes, INITIAL_EDGES);
      let results: { key: string; x: number; y: number }[];

      if (mode === "hierarchical-lr") {
        results = hierarchicalLayout(lNodes, lEdges, { direction: "LR", rankSpacing: 180, nodeSpacing: 30 });
      } else if (mode === "hierarchical-tb") {
        results = hierarchicalLayout(lNodes, lEdges, { direction: "TB", rankSpacing: 140, nodeSpacing: 40 });
      } else if (mode === "force") {
        results = forceLayout(lNodes, lEdges, { springLength: 200, iterations: 400 });
      } else {
        const placed = new Map<string, LayoutNode>();
        results = lNodes.map((ln) => {
          const neighbors = lEdges
            .filter((e) => e.sourceId === ln.key || e.targetId === ln.key)
            .map((e) => (e.sourceId === ln.key ? e.targetId : e.sourceId));
          const r = placeConnected(ln, neighbors, placed) ?? findFreePosition(ln, placed, { padding: 30 });
          placed.set(ln.key, { ...ln, x: r.x, y: r.y });
          return r;
        });
      }

      const resultMap = new Map(results.map((r) => [r.key, r]));
      return currentNodes.map((n) => {
        const r = resultMap.get(n.key);
        return r ? { ...n, offset: { x: r.x, y: r.y } } : n;
      });
    });
    setLayoutTick((t) => t + 1);
  }, []);

  const resetLayout = React.useCallback(() => {
    setActiveLayout(null);
    setNodes(INITIAL_NODES);
    setLayoutTick((t) => t + 1);
  }, []);

  return (
    <div className="layout-demo-panel">
      <div className="layout-canvas">
        <FlowKit
          ref={flowKitRef}
          edges={INITIAL_EDGES}
          edgePathType={edgePathType}
          nodes={nodes}
          nodeTypes={workflowNodeTypes}
          readOnly
        >
          <FlowKitControls />
        </FlowKit>
      </div>

      <div className="layout-sidebar">
        <div className="layout-sidebar-header">
          <strong>Auto Layout</strong>
          <span>Apply an algorithm to automatically position nodes on the canvas.</span>
        </div>

        <div className="layout-option-list">
          {LAYOUT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              className={`layout-option${activeLayout === opt.id ? " active" : ""}`}
              onClick={() => applyLayout(opt.id)}
              style={{ "--layout-accent": opt.accent } as React.CSSProperties}
              type="button"
            >
              <span className="layout-option-dot" />
              <span className="layout-option-body">
                <strong>{opt.label}</strong>
                <small>{opt.description}</small>
              </span>
            </button>
          ))}
        </div>

        <div className="layout-sidebar-footer">
          <button className="layout-reset-btn" onClick={resetLayout} type="button">
            Reset to Original
          </button>
        </div>
      </div>
    </div>
  );
}
