import * as React from "react";
import {
  ArrowRectangleNodeShape,
  CircleNodeShape,
  DiamondNodeShape,
  Endpoint,
  FlowKitControls,
  FlowKitEvents,
  FlowKitGrid,
  FlowKitGridSnap,
  FlowKitKeyboardCommands,
  FlowKitMiniMap,
  NodeFlow,
  IConnection,
  IEdge,
  IEndpoint,
  INode,
  INodeContainer,
  NodeTypes,
  SquareNodeShape,
  TriangleNodeShape,
} from "../../lib/index";
import { Position } from "../../lib/enums/Position";

type DemoMode = "workflow" | "shapes";
type WorkflowCategory = "input" | "math" | "logic" | "utility" | "output";
type WorkflowShape = "arrow-rectangle" | "circle" | "diamond" | "square" | "triangle";

type WorkflowNodeData = {
  category: WorkflowCategory;
  description: string;
  title: string;
};

type ShapeNodeData = {
  description: string;
  shape: WorkflowShape;
  title: string;
};

type WorkflowEndpointData = {
  label: string;
  valueType: "number" | "boolean" | "text" | "any";
};

type WorkflowEdgeData = Record<string, never>;

type WorkflowPreset = {
  category: WorkflowCategory;
  description: string;
  inputs: WorkflowEndpointData[];
  outputs: WorkflowEndpointData[];
  title: string;
  type: string;
};

const nodeWidth = 176;
const nodeBaseHeight = 96;
const endpointStartY = 48;
const endpointGap = 26;

const presets: WorkflowPreset[] = [
  {
    category: "input",
    description: "Provides a numeric value to the workflow.",
    inputs: [],
    outputs: [{ label: "value", valueType: "number" }],
    title: "Number Input",
    type: "number-input",
  },
  {
    category: "input",
    description: "Provides text for formatting or labels.",
    inputs: [],
    outputs: [{ label: "text", valueType: "text" }],
    title: "Text Input",
    type: "text-input",
  },
  {
    category: "math",
    description: "Adds two numbers together.",
    inputs: [
      { label: "a", valueType: "number" },
      { label: "b", valueType: "number" },
    ],
    outputs: [{ label: "sum", valueType: "number" }],
    title: "Add",
    type: "math-add",
  },
  {
    category: "math",
    description: "Multiplies two numbers.",
    inputs: [
      { label: "a", valueType: "number" },
      { label: "b", valueType: "number" },
    ],
    outputs: [{ label: "product", valueType: "number" }],
    title: "Multiply",
    type: "math-multiply",
  },
  {
    category: "math",
    description: "Rounds a number to the nearest whole value.",
    inputs: [{ label: "value", valueType: "number" }],
    outputs: [{ label: "rounded", valueType: "number" }],
    title: "Round",
    type: "math-round",
  },
  {
    category: "logic",
    description: "Checks whether a number passes a threshold.",
    inputs: [
      { label: "value", valueType: "number" },
      { label: "limit", valueType: "number" },
    ],
    outputs: [{ label: "passed", valueType: "boolean" }],
    title: "Greater Than",
    type: "logic-greater-than",
  },
  {
    category: "logic",
    description: "Routes true and false branches.",
    inputs: [{ label: "condition", valueType: "boolean" }],
    outputs: [
      { label: "true", valueType: "any" },
      { label: "false", valueType: "any" },
    ],
    title: "Branch",
    type: "logic-branch",
  },
  {
    category: "logic",
    description: "Combines two boolean values.",
    inputs: [
      { label: "left", valueType: "boolean" },
      { label: "right", valueType: "boolean" },
    ],
    outputs: [{ label: "result", valueType: "boolean" }],
    title: "And",
    type: "logic-and",
  },
  {
    category: "utility",
    description: "Formats any value into a display string.",
    inputs: [{ label: "value", valueType: "any" }],
    outputs: [{ label: "text", valueType: "text" }],
    title: "Format",
    type: "utility-format",
  },
  {
    category: "utility",
    description: "Merges two values into one downstream payload.",
    inputs: [
      { label: "left", valueType: "any" },
      { label: "right", valueType: "any" },
    ],
    outputs: [{ label: "merged", valueType: "any" }],
    title: "Merge",
    type: "utility-merge",
  },
  {
    category: "output",
    description: "Represents the final result of the workflow.",
    inputs: [{ label: "result", valueType: "any" }],
    outputs: [],
    title: "Result",
    type: "result-output",
  },
];

const presetByType = new Map(presets.map((preset) => [preset.type, preset]));

function getNodeHeight(preset: WorkflowPreset): number {
  return Math.max(
    nodeBaseHeight,
    endpointStartY + Math.max(preset.inputs.length, preset.outputs.length) * endpointGap
  );
}

function isWorkflowConnectionValid(connection: {
  source: IEndpoint<WorkflowEndpointData>;
  target: IEndpoint<WorkflowEndpointData>;
}): boolean {
  const sourceType = connection.source.data?.valueType;
  const targetType = connection.target.data?.valueType;

  if (connection.source.position !== Position.Right) return false;
  if (connection.target.position !== Position.Left) return false;
  if (sourceType == null || targetType == null) return true;
  if (sourceType === "any" || targetType === "any") return true;

  return sourceType === targetType;
}

function createEndpoints(nodeKey: string, preset: WorkflowPreset): IEndpoint<WorkflowEndpointData>[] {
  return [
    ...preset.inputs.map((endpoint, index) => ({
      id: `${nodeKey}-in-${index}`,
      offset: { x: 0, y: endpointStartY + index * endpointGap },
      position: Position.Left,
      data: endpoint,
      isValidConnection: isWorkflowConnectionValid,
    })),
    ...preset.outputs.map((endpoint, index) => ({
      id: `${nodeKey}-out-${index}`,
      offset: { x: nodeWidth, y: endpointStartY + index * endpointGap },
      position: Position.Right,
      data: endpoint,
      isValidConnection: isWorkflowConnectionValid,
    })),
  ];
}

function createNode(
  presetType: string,
  key: string,
  offset: { x: number; y: number }
): INode<WorkflowNodeData, WorkflowEndpointData> {
  const preset = presetByType.get(presetType);

  if (preset == null) throw new Error(`Unknown workflow node preset: ${presetType}`);

  return {
    key,
    type: preset.type,
    offset,
    data: {
      category: preset.category,
      description: preset.description,
      title: preset.title,
    },
    endpoints: createEndpoints(key, preset),
    style: {
      height: getNodeHeight(preset),
      width: nodeWidth,
    },
  };
}

function WorkflowNode(props: INode<WorkflowNodeData, WorkflowEndpointData> & { selected?: boolean }) {
  const data = props.data;

  return (
    <div className={`workflow-node workflow-node-${data?.category ?? "utility"}`}>
      <div className="workflow-node-header">
        <span>{data?.category}</span>
        <strong>{data?.title ?? props.key}</strong>
      </div>
      <p>{data?.description}</p>
      <div className="workflow-node-ports">
        <div>
          {props.endpoints
            .filter((endpoint) => endpoint.position === Position.Left)
            .map((endpoint) => (
              <span key={endpoint.id}>{endpoint.data?.label}</span>
            ))}
        </div>
        <div>
          {props.endpoints
            .filter((endpoint) => endpoint.position === Position.Right)
            .map((endpoint) => (
              <span key={endpoint.id}>{endpoint.data?.label}</span>
            ))}
        </div>
      </div>
      {props.endpoints.map((endpoint) => (
        <Endpoint key={endpoint.id} endpoint={endpoint} />
      ))}
    </div>
  );
}

const shapeComponents: Record<WorkflowShape, React.FC<React.PropsWithChildren<{ className?: string }>>> = {
  "arrow-rectangle": ArrowRectangleNodeShape,
  circle: CircleNodeShape,
  diamond: DiamondNodeShape,
  square: SquareNodeShape,
  triangle: TriangleNodeShape,
};

function ShapeDemoNode(props: INode<ShapeNodeData, WorkflowEndpointData> & { selected?: boolean }) {
  const data = props.data;
  const Shape = shapeComponents[data?.shape ?? "square"];

  return (
    <Shape className={`shape-demo-node shape-demo-node-${data?.shape ?? "square"}`}>
      <div className="shape-demo-node-content">
        <strong>{data?.title ?? props.key}</strong>
        <span>{data?.description}</span>
      </div>
      {props.endpoints.map((endpoint) => (
        <Endpoint key={endpoint.id} endpoint={endpoint} />
      ))}
    </Shape>
  );
}

const nodeTypes: NodeTypes = Object.fromEntries(
  presets.map((preset) => [preset.type, WorkflowNode])
);

const shapeNodeTypes: NodeTypes = {
  shape: ShapeDemoNode,
};

const initialNodes: INode<WorkflowNodeData, WorkflowEndpointData>[] = [
  createNode("number-input", "revenue", { x: 80, y: 90 }),
  createNode("number-input", "cost", { x: 80, y: 250 }),
  createNode("math-multiply", "projected-margin", { x: 330, y: 150 }),
  createNode("logic-greater-than", "margin-check", { x: 590, y: 150 }),
  createNode("logic-branch", "approval-branch", { x: 850, y: 140 }),
  createNode("result-output", "workflow-result", { x: 1110, y: 150 }),
];

const initialEdges: IEdge<WorkflowEdgeData>[] = [
  {
    key: "edge-revenue-margin",
    type: "edge",
    sourceId: "revenue-out-0",
    targetId: "projected-margin-in-0",
  },
  {
    key: "edge-cost-margin",
    type: "edge",
    sourceId: "cost-out-0",
    targetId: "projected-margin-in-1",
  },
  {
    key: "edge-margin-check",
    type: "edge",
    sourceId: "projected-margin-out-0",
    targetId: "margin-check-in-0",
  },
  {
    key: "edge-check-branch",
    type: "edge",
    sourceId: "margin-check-out-0",
    targetId: "approval-branch-in-0",
  },
  {
    key: "edge-branch-result",
    type: "edge",
    sourceId: "approval-branch-out-0",
    targetId: "workflow-result-in-0",
  },
];

const initialContainers: INodeContainer[] = [
  {
    key: "business-logic",
    label: "Business Logic",
    nodeKeys: ["projected-margin", "margin-check", "approval-branch"],
  },
];

const shapeNodes: INode<ShapeNodeData, WorkflowEndpointData>[] = [
  createShapeNode("circle", "shape-circle", "Circle", "Compact status or start nodes.", { x: 80, y: 100 }, 136, 136),
  createShapeNode("square", "shape-square", "Square", "General-purpose action blocks.", { x: 290, y: 110 }, 160, 120),
  createShapeNode("triangle", "shape-triangle", "Triangle", "Milestones, alerts, or directional markers.", { x: 520, y: 92 }, 180, 150),
  createShapeNode("diamond", "shape-diamond", "Diamond", "Decision points and branching moments.", { x: 780, y: 90 }, 176, 160),
  createShapeNode("arrow-rectangle", "shape-arrow", "Arrow Rectangle", "Directional process steps.", { x: 1030, y: 115 }, 220, 112),
];

const shapeEdges: IEdge<WorkflowEdgeData>[] = [
  createShapeEdge("edge-circle-square", "shape-circle-out", "shape-square-in"),
  createShapeEdge("edge-square-triangle", "shape-square-out", "shape-triangle-in"),
  createShapeEdge("edge-triangle-diamond", "shape-triangle-out", "shape-diamond-in"),
  createShapeEdge("edge-diamond-arrow", "shape-diamond-out", "shape-arrow-in"),
];

function createShapeNode(
  shape: WorkflowShape,
  key: string,
  title: string,
  description: string,
  offset: { x: number; y: number },
  width: number,
  height: number
): INode<ShapeNodeData, WorkflowEndpointData> {
  return {
    key,
    type: "shape",
    offset,
    data: { description, shape, title },
    endpoints: [
      {
        id: `${key}-in`,
        offset: { x: 0, y: height / 2 },
        position: Position.Left,
        data: { label: "in", valueType: "any" },
      },
      {
        id: `${key}-out`,
        offset: { x: width, y: height / 2 },
        position: Position.Right,
        data: { label: "out", valueType: "any" },
      },
    ],
    style: { height, width },
  };
}

function createShapeEdge(key: string, sourceId: string, targetId: string): IEdge<WorkflowEdgeData> {
  return { key, arrows: "target", type: "edge", sourceId, targetId };
}

function getNodeNumber(nodes: INode<any, any>[]): number {
  return nodes.filter((node) => node.key.startsWith("workflow-node-")).length + 1;
}

export function App() {
  const [mode, setMode] = React.useState<DemoMode>("workflow");
  const [nodes, setNodes] = React.useState(initialNodes);
  const [edges, setEdges] = React.useState(initialEdges);
  const [containers, setContainers] = React.useState(initialContainers);
  const [shapeDemoEdges, setShapeDemoEdges] = React.useState(shapeEdges);
  const [selected, setSelected] = React.useState<string>("None");

  const activeNodes = mode === "workflow" ? nodes : shapeNodes;
  const activeEdges = mode === "workflow" ? edges : shapeDemoEdges;

  const onConnect = React.useCallback((connection: IConnection) => {
    const setActiveEdges = mode === "workflow" ? setEdges : setShapeDemoEdges;

    setActiveEdges((currentEdges) => {
      const edgeExists = currentEdges.some(
        (edge) => edge.sourceId === connection.sourceId && edge.targetId === connection.targetId
      );

      if (edgeExists) return currentEdges;

      return [
        ...currentEdges,
        {
          key: `edge-${connection.sourceId}-${connection.targetId}`,
          arrows: mode === "shapes" ? "target" : undefined,
          type: "edge",
          sourceId: connection.sourceId,
          targetId: connection.targetId,
        },
      ];
    });
  }, [mode]);

  const onRemove = React.useCallback(
    (node: INode<any, any> | null, removedEdges: IEdge<any>[]) => {
      if (mode !== "workflow") {
        setShapeDemoEdges((currentEdges) =>
          currentEdges.filter(
            (edge) => !removedEdges.some((removedEdge) => removedEdge.key === edge.key)
          )
        );
        return;
      }

      if (node != null) {
        setNodes((currentNodes) => currentNodes.filter((item) => item.key !== node.key));
        setContainers((currentContainers) =>
          currentContainers.map((container) => ({
            ...container,
            nodeKeys: container.nodeKeys.filter((nodeKey) => nodeKey !== node.key),
          }))
        );
        setEdges((currentEdges) =>
          currentEdges.filter(
            (edge) => !removedEdges.some((removedEdge) => removedEdge.key === edge.key)
          )
        );
        return;
      }

      setEdges((currentEdges) =>
        currentEdges.filter(
          (edge) => !removedEdges.some((removedEdge) => removedEdge.key === edge.key)
        )
      );
    },
    [mode]
  );

  const addNode = React.useCallback((preset: WorkflowPreset) => {
    setNodes((currentNodes) => {
      const nodeNumber = getNodeNumber(currentNodes);
      const nodeKey = `workflow-node-${nodeNumber}`;
      const offset = (nodeNumber - 1) * 28;

      return [
        ...currentNodes,
        createNode(preset.type, nodeKey, { x: 230 + offset, y: 410 + offset }),
      ];
    });
  }, []);

  const groupedPresets = React.useMemo(
    () =>
      presets.reduce<Record<WorkflowCategory, WorkflowPreset[]>>(
        (groups, preset) => {
          groups[preset.category].push(preset);
          return groups;
        },
        { input: [], math: [], logic: [], utility: [], output: [] }
      ),
    []
  );

  return (
    <main className="demo-shell">
      <aside className="demo-palette">
        <div className="demo-brand">
          <h1>NodeFlow Demo</h1>
          <p>Switch between a workflow builder and a reusable node shape gallery.</p>
        </div>

        <div className="demo-mode-toggle" aria-label="Demo mode">
          <button
            className={mode === "workflow" ? "demo-mode-active" : ""}
            onClick={() => setMode("workflow")}
            type="button"
          >
            Workflow
          </button>
          <button
            className={mode === "shapes" ? "demo-mode-active" : ""}
            onClick={() => setMode("shapes")}
            type="button"
          >
            Shapes
          </button>
        </div>

        {mode === "workflow" ? (
          (Object.keys(groupedPresets) as WorkflowCategory[]).map((category) => (
            <section className="demo-palette-section" key={category}>
              <h2>{category}</h2>
              <div className="demo-palette-list">
                {groupedPresets[category].map((preset) => (
                  <button
                    className={`demo-palette-item demo-palette-item-${preset.category}`}
                    key={preset.type}
                    onClick={() => addNode(preset)}
                    type="button"
                  >
                    <strong>{preset.title}</strong>
                    <span>{preset.description}</span>
                  </button>
                ))}
              </div>
            </section>
          ))
        ) : (
          <section className="demo-palette-section">
            <h2>shape components</h2>
            <div className="demo-palette-list">
              {shapeNodes.map((node) => (
                <div className="demo-palette-item demo-palette-shape-item" key={node.key}>
                  <strong>{node.data?.title}</strong>
                  <span>{node.data?.description}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </aside>

      <section className="demo-workspace">
        <header className="demo-header">
          <div>
            <h2>{mode === "workflow" ? "Revenue Approval Workflow" : "Reusable Shape Components"}</h2>
            <p>
              {mode === "workflow"
                ? "Drag nodes, connect endpoints, group nodes in containers, and delete selections with Backspace."
                : "A focused canvas for reusable node shapes without the workflow-specific math styling."}
            </p>
          </div>
          <div className="demo-status">
            <span>Selected</span>
            <strong>{selected}</strong>
          </div>
          <div className="demo-stats">
            <span>{activeNodes.length} nodes</span>
            <span>{activeEdges.length} edges</span>
          </div>
        </header>

        <div className="demo-canvas">
          <NodeFlow
            key={mode}
            nodes={activeNodes}
            edges={activeEdges}
            containers={mode === "workflow" ? containers : []}
            nodeTypes={mode === "workflow" ? nodeTypes : shapeNodeTypes}
            centerOnLoad
            proximityConnect={{ radius: 56 }}
            zoomMin={0.35}
            zoomMax={2}
          >
            <FlowKitGrid size={24} color="rgba(255, 255, 255, .055)" />
            <FlowKitControls />
            <FlowKitEvents
              onConnect={onConnect}
              onContainersChange={mode === "workflow" ? setContainers : undefined}
              onSelectionChange={(element) => setSelected(element?.key ?? "None")}
            />
            <FlowKitGridSnap size={24} containers={mode === "workflow"} />
            <FlowKitKeyboardCommands
              edges={activeEdges}
              nodes={activeNodes}
              onRemove={onRemove}
            />
            <FlowKitMiniMap nodes={activeNodes} />
          </NodeFlow>
        </div>
      </section>
    </main>
  );
}
