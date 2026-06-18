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
        <FlowKitMiniMap nodes={nodes} />
      </FlowKit>
    </section>
  );
}
