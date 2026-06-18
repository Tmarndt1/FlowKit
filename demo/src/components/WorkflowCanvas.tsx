import {
  FlowKit,
  FlowKitControls,
  FlowKitEvents,
  FlowKitGrid,
  FlowKitGridSnap,
  FlowKitKeyboardCommands,
  FlowKitMiniMap,
  IConnection,
  IEdge,
  INode,
  NodeTypes,
} from "../../../lib/index";
import { WorkflowContainer, WorkflowEdge, WorkflowNode as WorkflowNodeType } from "../types";
import { isWorkflowConnectionValid } from "../workflowModel";

const miniMapNodeColors = {
  input: { background: "rgba(73, 212, 230, .5)", borderColor: "rgba(73, 212, 230, .9)" },
  math: { background: "rgba(245, 189, 34, .48)", borderColor: "rgba(245, 189, 34, .9)" },
  logic: { background: "rgba(164, 119, 255, .48)", borderColor: "rgba(164, 119, 255, .9)" },
  utility: { background: "rgba(73, 214, 111, .46)", borderColor: "rgba(73, 214, 111, .9)" },
  output: { background: "rgba(255, 103, 103, .48)", borderColor: "rgba(255, 103, 103, .9)" },
};

type WorkflowCanvasProps = {
  containers: WorkflowContainer[];
  edges: WorkflowEdge[];
  nodes: WorkflowNodeType[];
  nodeTypes: NodeTypes;
  onConnect: (connection: IConnection) => void;
  onContainersChange: (containers: WorkflowContainer[]) => void;
  onRemove: (node: INode<any, any> | null, removedEdges: IEdge<any>[]) => void;
  onSelectionChange: (key: string | null) => void;
};

export function WorkflowCanvas({
  containers,
  edges,
  nodes,
  nodeTypes,
  onConnect,
  onContainersChange,
  onRemove,
  onSelectionChange,
}: WorkflowCanvasProps) {
  return (
    <section className="canvas-panel">
      <FlowKit
        centerOnLoad
        containers={containers}
        edges={edges}
        nodes={nodes}
        nodeTypes={nodeTypes}
        proximityConnect={{ radius: 56 }}
        zoomMax={2}
        zoomMin={0.35}
        canConnect={isWorkflowConnectionValid}
      >
        <FlowKitGrid size={32} color="rgba(125, 151, 188, .12)" />
        <FlowKitControls />
        <FlowKitEvents
          onConnect={onConnect}
          onContainersChange={onContainersChange}
          onSelectionChange={(element) => onSelectionChange(element?.key ?? null)}
        />
        <FlowKitGridSnap size={28} containers />
        <FlowKitKeyboardCommands edges={edges} nodes={nodes} onRemove={onRemove} />
        <FlowKitMiniMap
          height={122}
          nodes={nodes}
          width={270}
          nodeClassName={(node) => `node-flow-mini-map-node-${node.data?.category ?? "utility"}`}
          nodeStyle={(node) => miniMapNodeColors[node.data?.category ?? "utility"]}
        />
      </FlowKit>
    </section>
  );
}
