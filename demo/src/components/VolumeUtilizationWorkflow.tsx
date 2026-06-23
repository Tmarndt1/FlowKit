import * as React from "react";
import {
  applyContainerChanges,
  EdgeCollapseMode,
  EdgePathType,
  FlowKit,
  FlowKitControls,
  FlowKitEvents,
  FlowKitGrid,
  FlowKitGridSnap,
  FlowKitLegend,
  FlowKitLegendItem,
  FlowKitMiniMap,
  IEdge,
  INode,
  Position,
  createWorkflowEdge,
  createWorkflowNode,
  isWorkflowConnectionValid,
  workflowNodeTypes,
} from "../../../lib/index";
import { WorkflowContainer, WorkflowEdge, WorkflowNode as WorkflowNodeType } from "../types";

type VolumeUtilizationWorkflowProps = {
  animatedEdges: boolean;
  collapsibleEdges: boolean;
  edgePathType: EdgePathType;
};

const metricValues = {
  percentUsed: 82.4,
  storageSize: "1.82 TB",
  storageUsed: "1.50 TB",
};

const volumeLegendItems: FlowKitLegendItem[] = [
  { key: "metric", label: "Runtime variables", marker: "square", value: 2, color: "#49d4e6" },
  { key: "math", label: "Math", marker: "square", value: 3, color: "#f5bd22" },
  { key: "policy", label: "Decision table", marker: "square", value: 1, color: "#ff9f43" },
  { key: "alert", label: "Alert outputs", marker: "square", value: 3, color: "#ff6767" },
];

const miniMapNodeColors = {
  input: { background: "rgba(73, 212, 230, .5)", borderColor: "rgba(73, 212, 230, .9)" },
  math: { background: "rgba(245, 189, 34, .48)", borderColor: "rgba(245, 189, 34, .9)" },
  policy: { background: "rgba(255, 159, 67, .48)", borderColor: "rgba(255, 159, 67, .92)" },
  utility: { background: "rgba(73, 214, 111, .46)", borderColor: "rgba(73, 214, 111, .9)" },
  output: { background: "rgba(255, 103, 103, .48)", borderColor: "rgba(255, 103, 103, .9)" },
};

function makeMetricNode(
  key: string,
  offset: { x: number; y: number },
  title: string,
  variableKey: string,
  value: string
): WorkflowNodeType {
  const node = createWorkflowNode("variable-input", key, offset, {
    subtitle: variableKey,
    title,
    value,
    valueSource: "SNMP hrStorageTable sample",
    variableKey,
    variableQuery: `snmp.hrStorage('${variableKey}')`,
  });

  return {
    ...node,
    endpoints: node.endpoints.map((endpoint) =>
      endpoint.position === Position.Right
        ? { ...endpoint, data: { ...endpoint.data, valueType: "number" } }
        : endpoint
    ),
  };
}

const initialVolumeNodes: WorkflowNodeType[] = [
  makeMetricNode("hr-storage-used", { x: 70, y: 170 }, "hrStorageUsed", "hrStorageUsed", metricValues.storageUsed),
  makeMetricNode("hr-storage-size", { x: 70, y: 390 }, "hrStorageSize", "hrStorageSize", metricValues.storageSize),
  createWorkflowNode("math-divide", "storage-divide", { x: 330, y: 270 }, { title: "Used / Size" }),
  createWorkflowNode("number-input", "percent-scale", { x: 340, y: 505 }, { subtitle: "Scale", value: "100" }),
  createWorkflowNode("math-multiply", "percent-multiply", { x: 590, y: 285 }, { title: "Percent Used" }),
  createWorkflowNode("math-round", "percent-round", { x: 830, y: 285 }, { title: "Round Percent" }),
  createWorkflowNode("policy-decision-table", "volume-threshold", { x: 1080, y: 260 }, {
    subtitle: ">= 90 critical, >= 75 warning",
    title: "Volume Decision",
  }),
  createWorkflowNode("result-output", "volume-normal", { x: 1360, y: 110 }, {
    subtitle: "Volume normal",
    title: "Normal",
    variant: "success",
  }),
  createWorkflowNode("alert-output", "volume-warning", { x: 1360, y: 300 }, {
    subtitle: "Warning alert",
    title: "Warn Ops",
    variant: "warning",
  }),
  createWorkflowNode("alert-output", "volume-critical", { x: 1360, y: 500 }, {
    subtitle: "Critical alert",
    title: "Page On Call",
    variant: "warning",
  }),
];

const initialVolumeEdges: WorkflowEdge[] = [
  { ...createWorkflowEdge("edge-used-divide", "hr-storage-used-out-0", "storage-divide-in-0") },
  { ...createWorkflowEdge("edge-size-divide", "hr-storage-size-out-0", "storage-divide-in-1") },
  { ...createWorkflowEdge("edge-divide-multiply", "storage-divide-out-0", "percent-multiply-in-0") },
  { ...createWorkflowEdge("edge-scale-multiply", "percent-scale-out-0", "percent-multiply-in-1") },
  { ...createWorkflowEdge("edge-multiply-round", "percent-multiply-out-0", "percent-round-in-0") },
  {
    ...createWorkflowEdge("edge-round-threshold", "percent-round-out-0", "volume-threshold-in-0"),
    className: "volume-link-warning",
  },
  {
    ...createWorkflowEdge("edge-threshold-normal", "volume-threshold-threshold-normal", "volume-normal-in-0"),
    className: "volume-link-muted",
  },
  {
    ...createWorkflowEdge("edge-threshold-warning", "volume-threshold-threshold-warning", "volume-warning-in-0"),
    className: "volume-link-warning",
  },
  {
    ...createWorkflowEdge("edge-threshold-critical", "volume-threshold-threshold-critical", "volume-critical-in-0"),
    className: "volume-link-critical",
  },
];

const initialVolumeContainers: WorkflowContainer[] = [
  {
    key: "volume-inputs",
    label: "SNMP Variables",
    nodeKeys: ["hr-storage-used", "hr-storage-size"],
    resizeToFit: false,
    position: { x: 35, y: 110 },
    width: 230,
    height: 430,
  },
  {
    key: "volume-calculation",
    label: "Utilization Calculation",
    nodeKeys: ["storage-divide", "percent-scale", "percent-multiply", "percent-round"],
    resizeToFit: false,
    position: { x: 295, y: 205 },
    width: 715,
    height: 405,
  },
  {
    key: "volume-policy",
    label: "Alert Policy",
    nodeKeys: ["volume-threshold"],
    resizeToFit: false,
    position: { x: 1045, y: 205 },
    width: 230,
    height: 230,
  },
];

export const volumeWorkflowStats = {
  edgeCount: initialVolumeEdges.length,
  nodeCount: initialVolumeNodes.length,
};

export function VolumeUtilizationWorkflow({
  animatedEdges,
  collapsibleEdges,
  edgePathType,
}: VolumeUtilizationWorkflowProps) {
  const [nodes, setNodes] = React.useState<WorkflowNodeType[]>(initialVolumeNodes);
  const [edges, setEdges] = React.useState<WorkflowEdge[]>(initialVolumeEdges);
  const [containers, setContainers] = React.useState<WorkflowContainer[]>(initialVolumeContainers);

  const displayEdges = edges.map((edge) => ({
    ...edge,
    animated: animatedEdges && edge.className !== "volume-link-muted",
  }));

  const onEdgeCollapsedChange = React.useCallback((edgeKey: string, collapsed: boolean, mode: EdgeCollapseMode) => {
    setEdges((currentEdges) =>
      currentEdges.map((edge) =>
        edge.key === edgeKey
          ? {
              ...edge,
              collapsed,
              collapseMode: collapsed ? mode : undefined,
            }
          : edge
      )
    );
  }, []);

  return (
    <section className="volume-workflow-panel">
      <div className="volume-workflow-canvas">
        <FlowKit
          centerOnLoad
          collapsibleEdges={collapsibleEdges}
          containers={containers}
          edgePathType={edgePathType}
          edges={displayEdges}
          nodes={nodes}
          nodeTypes={workflowNodeTypes}
          canConnect={isWorkflowConnectionValid}
          zoomMax={2}
          zoomMin={0.35}
          onEdgeCollapsedChange={({ collapsed, edge, mode }) => onEdgeCollapsedChange(edge.key, collapsed, mode)}
        >
          <FlowKitGrid size={32} color="rgba(125, 151, 188, .12)" />
          <FlowKitLegend
            className="workflow-legend volume-workflow-legend"
            items={volumeLegendItems}
            position="top-right"
            title="Volume Utilization"
          />
          <FlowKitControls />
          <FlowKitEvents
            onContainersChange={(changes) => setContainers((c) => applyContainerChanges(c, changes))}
            onNodesChange={(changes) => setNodes((currentNodes) => {
              let next = currentNodes;
              changes.forEach((change) => {
                if (change.type === "position") {
                  next = next.map((n) => n.key === change.key ? { ...n, offset: change.offset } : n);
                }
              });
              return next;
            })}
          />
          <FlowKitGridSnap size={28} containers />
          <FlowKitMiniMap
            height={122}
            nodes={nodes}
            width={270}
            nodeClassName={(node) => `flow-kit-mini-map-node-${node.data?.category ?? "utility"}`}
            nodeStyle={(node) => miniMapNodeColors[node.data?.category ?? "utility"]}
          />
        </FlowKit>
      </div>

      <aside className="volume-workflow-details" aria-label="Volume utilization workflow details">
        <div className="volume-policy-header">
          <span className="volume-policy-icon">%</span>
          <div>
            <strong>Volume Utilization</strong>
            <span>hrStorage alert policy</span>
          </div>
          <em>Warning</em>
        </div>

        <section>
          <h2>Runtime Variables</h2>
          <dl className="volume-detail-list">
            <div>
              <dt>hrStorageUsed</dt>
              <dd>{metricValues.storageUsed}</dd>
            </div>
            <div>
              <dt>hrStorageSize</dt>
              <dd>{metricValues.storageSize}</dd>
            </div>
            <div>
              <dt>Percent Used</dt>
              <dd>{metricValues.percentUsed}%</dd>
            </div>
          </dl>
        </section>

        <section>
          <h2>Decision Rows</h2>
          <div className="volume-threshold-list">
            <div className="volume-threshold-row volume-threshold-normal">
              <span />
              <strong>Normal</strong>
              <em>&lt; 75%</em>
            </div>
            <div className="volume-threshold-row volume-threshold-warning active">
              <span />
              <strong>Warning</strong>
              <em>75% - 89%</em>
            </div>
            <div className="volume-threshold-row volume-threshold-critical">
              <span />
              <strong>Critical</strong>
              <em>&gt;= 90%</em>
            </div>
          </div>
        </section>

        <section>
          <h2>Generated Alert</h2>
          <div className="volume-alert-card">
            <strong>Volume utilization warning</strong>
            <p>Volume /var is 82.4% used. Used 1.50 TB of 1.82 TB.</p>
            <span>Severity: warning</span>
          </div>
        </section>
      </aside>
    </section>
  );
}
