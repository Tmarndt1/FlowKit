import {
  FlowKit,
  FlowKitControls,
  FlowKitEvents,
  FlowKitGrid,
  FlowKitGridSnap,
  FlowKitKeyboardCommands,
  FlowKitLegend,
  FlowKitLegendItem,
  FlowKitMiniMap,
  EdgeCollapseMode,
  EdgePathType,
  IEdge,
  INode,
  NodeTypes,
} from "../../../lib/index";
import { WorkflowContainer, WorkflowEdge, WorkflowNode as WorkflowNodeType } from "../types";
import { categoryLabels, isWorkflowConnectionValid } from "../workflowModel";

const miniMapNodeColors = {
  input: { background: "rgba(73, 212, 230, .5)", borderColor: "rgba(73, 212, 230, .9)" },
  math: { background: "rgba(245, 189, 34, .48)", borderColor: "rgba(245, 189, 34, .9)" },
  logic: { background: "rgba(164, 119, 255, .48)", borderColor: "rgba(164, 119, 255, .9)" },
  policy: { background: "rgba(255, 159, 67, .48)", borderColor: "rgba(255, 159, 67, .92)" },
  utility: { background: "rgba(73, 214, 111, .46)", borderColor: "rgba(73, 214, 111, .9)" },
  output: { background: "rgba(255, 103, 103, .48)", borderColor: "rgba(255, 103, 103, .9)" },
};

const workflowLegendColors = {
  input: "#49d4e6",
  math: "#f5bd22",
  logic: "#a477ff",
  policy: "#ff9f43",
  utility: "#49d66f",
  output: "#ff6767",
};

type WorkflowCanvasProps = {
  animatedEdges: boolean;
  collapsibleEdges: boolean;
  containers: WorkflowContainer[];
  edgePathType: EdgePathType;
  edges: WorkflowEdge[];
  nodes: WorkflowNodeType[];
  nodeTypes: NodeTypes;
  onConnect: (sourceId: string, targetId: string) => void;
  onContainersChange: (containers: WorkflowContainer[]) => void;
  onEdgeCollapsedChange: (edgeKey: string, collapsed: boolean, mode: EdgeCollapseMode) => void;
  onRemove: (node: INode<any, any> | null, removedEdges: IEdge<any>[]) => void;
  onSelectionChange: (key: string | null) => void;
};

export function WorkflowCanvas({
  animatedEdges,
  collapsibleEdges,
  containers,
  edgePathType,
  edges,
  nodes,
  nodeTypes,
  onConnect,
  onContainersChange,
  onEdgeCollapsedChange,
  onRemove,
  onSelectionChange,
}: WorkflowCanvasProps) {
  const displayEdges = edges.map((edge) => ({
    ...edge,
    animated: animatedEdges,
  }));
  const legendItems = nodes.reduce<FlowKitLegendItem[]>((items, node) => {
    const category = node.data?.category ?? "utility";
    const existingItem = items.find((item) => item.key === category);

    if (existingItem != null) {
      existingItem.value = Number(existingItem.value ?? 0) + 1;
      return items;
    }

    return [
      ...items,
      {
        key: category,
        label: categoryLabels[category],
        marker: "square",
        value: 1,
        color: workflowLegendColors[category],
      },
    ];
  }, []);

  return (
    <section className="canvas-panel">
      <FlowKit
        centerOnLoad
        collapsibleEdges={collapsibleEdges}
        containers={containers}
        edgePathType={edgePathType}
        edges={displayEdges}
        nodes={nodes}
        nodeTypes={nodeTypes}
        proximityConnect={{ radius: 56 }}
        zoomMax={2}
        zoomMin={0.35}
        canConnect={isWorkflowConnectionValid}
        onEdgeCollapsedChange={({ collapsed, edge, mode }) => onEdgeCollapsedChange(edge.key, collapsed, mode)}
      >
        <FlowKitGrid size={32} color="rgba(125, 151, 188, .12)" />
        <FlowKitLegend
          className="workflow-legend"
          items={legendItems}
          position="top-right"
          title="Workflow Nodes"
        />
        <FlowKitControls />
        <FlowKitEvents
          onContainersChange={onContainersChange}
          onEdgesChange={(changes) => changes.forEach((change) => {
            if (change.type === "connect") onConnect(change.sourceId, change.targetId);
            if (change.type === "select") onSelectionChange(change.selected ? change.key : null);
          })}
          onNodesChange={(changes) => changes.forEach((change) => {
            if (change.type === "select") onSelectionChange(change.selected ? change.key : null);
          })}
        />
        <FlowKitGridSnap size={28} containers />
        <FlowKitKeyboardCommands edges={edges} nodes={nodes} onRemove={onRemove} />
        <FlowKitMiniMap
          height={122}
          nodes={nodes}
          width={270}
          nodeClassName={(node) => `flow-kit-mini-map-node-${node.data?.category ?? "utility"}`}
          nodeStyle={(node) => miniMapNodeColors[node.data?.category ?? "utility"]}
        />
      </FlowKit>
    </section>
  );
}
