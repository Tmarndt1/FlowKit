import * as React from "react";
import {
  applyContainerChanges, applyNodeChanges, Endpoint, FlowKit, FlowKitControls,
  FlowKitDots, FlowKitEvents, Position,
} from "../../../lib/index";
import type {
  ContainerEdgeAggregateArgs, EdgePathType, IEdge, IEndpoint, INode, INodeContainer,
} from "../../../lib/index";
import "../containerEdges.css";

type Status = "green" | "yellow" | "red";
type EdgeData = { status: Status };
type NodeData = { label: string; group: string; floating: boolean };
const colors: Record<Status, string> = { green: "#22c55e", yellow: "#eab308", red: "#ef4444" };
const severity: Record<Status, number> = { green: 0, yellow: 1, red: 2 };
const initialStatuses: Status[] = ["green", "yellow", "red"];

function StatusNode({ data, endpoints }: { data: NodeData; endpoints: IEndpoint<never>[] }) {
  return (
    <div className="container-edge-node">
      <span>{data.group}</span>
      <strong>{data.label}</strong>
      <small>{data.floating ? "Floating" : "Fixed port"}</small>
      {endpoints.map((endpoint) => <Endpoint key={endpoint.id} endpoint={endpoint} />)}
    </div>
  );
}
const nodeTypes = { "container-status-node": StatusNode };
const initialNodes: INode<NodeData, never>[] = ["A", "B"].flatMap((group) =>
  [1, 2, 3].map((index) => ({
    key: `${group}${index}`, type: "container-status-node",
    offset: { x: group === "A" ? 100 : 640, y: 120 + (index - 1) * 120 },
    style: { width: 180, height: 72 },
    data: { label: `${group}${index}`, group: `Container ${group}`, floating: index === 2 },
    endpoints: index === 2 ? [] : [{
      id: `${group}${index}-port`, position: group === "A" ? Position.Right : Position.Left,
      offset: { x: group === "A" ? 180 : 0, y: 36 },
    }],
  }))
);
const initialContainers: INodeContainer[] = ["A", "B"].map((key) => ({
  key, label: `Container ${key}`, nodeKeys: [1, 2, 3].map((index) => `${key}${index}`),
  padding: 28, collapsed: false,
}));

function aggregateStatus({ edges }: ContainerEdgeAggregateArgs<EdgeData>) {
  const status = edges.reduce<Status>((worst, edge) => {
    const current = edge.data?.status ?? "green";
    return severity[current] > severity[worst] ? current : worst;
  }, "green");
  return { data: { status }, style: { stroke: colors[status], strokeWidth: 3 }, label: `${edges.length} links · ${status}` };
}

export function ContainerEdgesDemo({ animatedEdges, edgePathType }: { animatedEdges: boolean; edgePathType: EdgePathType }) {
  const [nodes, setNodes] = React.useState(initialNodes);
  const [containers, setContainers] = React.useState(initialContainers);
  const [statuses, setStatuses] = React.useState(initialStatuses);
  const edges = React.useMemo<IEdge<EdgeData>[]>(() => statuses.map((status, index) => ({
    key: `link-${index + 1}`,
    sourceId: index === 1 ? "A2" : `A${index + 1}-port`,
    targetId: index === 1 ? "B2" : `B${index + 1}-port`,
    anchorMode: index === 1 ? "floating" : "endpoint",
    data: { status }, label: status, style: { stroke: colors[status], strokeWidth: 3 },
    animated: animatedEdges,
  })), [statuses, animatedEdges]);
  const bothCollapsed = containers.every((container) => container.collapsed);
  const rolledUpStatus = statuses.reduce((worst, current) => severity[current] > severity[worst] ? current : worst, "green" as Status);
  const collapsedCount = containers.filter((container) => container.collapsed).length;

  return (
    <section className="container-edges-demo">
      <div className="container-edges-toolbar">
        <div>
          <h1>Container connections</h1>
          <p>Collapse a group to keep its connections visible. Collapse both to see their worst status.</p>
        </div>
        <div className="container-edges-actions">
          {containers.map((container) => (
            <button key={container.key} type="button" className="button"
              aria-pressed={container.collapsed}
              onClick={() => setContainers((current) => current.map((item) => item.key === container.key ? { ...item, collapsed: !item.collapsed } : item))}>
              {container.collapsed ? "Expand" : "Collapse"} {container.key}
            </button>
          ))}
          <button type="button" className="button" onClick={() => setContainers((current) => current.map((item) => ({ ...item, collapsed: !bothCollapsed })))}>
            {bothCollapsed ? "Expand both" : "Collapse both"}
          </button>
        </div>
      </div>
      <div className="container-edges-body">
        <div className="container-edges-canvas">
          <FlowKit centerOnLoad nodes={nodes} edges={edges} containers={containers} nodeTypes={nodeTypes}
            collapsedContainerEdges="aggregate" aggregateContainerEdges={(args) => ({ ...aggregateStatus(args), animated: animatedEdges })}
            edgePathType={edgePathType}>
            <FlowKitDots />
            <FlowKitControls />
            <FlowKitEvents
              onContainersChange={(changes) => setContainers((current) => applyContainerChanges(current, changes))}
              onNodesChange={(changes) => setNodes((current) => applyNodeChanges(current, changes))}
            />
          </FlowKit>
          <div className="container-edges-caption" aria-live="polite">
            {bothCollapsed ? `1 summary edge · ${rolledUpStatus}` : collapsedCount === 1 ? "3 connections · one collapsed group" : "3 connections · 2 fixed ports, 1 floating"}
          </div>
        </div>
        <aside className="container-edges-status-panel">
          <h2>Connection statuses</h2>
          <p>Change any status, even while both groups are collapsed.</p>
          <p>A1 / B1 and A3 / B3 use fixed ports. A2 / B2 float on their node boundaries. Collapsed groups always float.</p>
          {statuses.map((status, index) => (
            <label key={index} className="container-edges-status-row">
              <span><i style={{ background: colors[status] }} aria-hidden="true" />A{index + 1} → B{index + 1}</span>
              <select aria-label={`Status for A${index + 1} to B${index + 1}`} value={status}
                onChange={(event) => {
                  const value = event.target.value as Status;
                  setStatuses((current) => current.map((item, row) => row === index ? value : item));
                }}>
                <option value="green">Green</option>
                <option value="yellow">Yellow</option>
                <option value="red">Red</option>
              </select>
            </label>
          ))}
          <div className="container-edges-rollup" aria-live="polite">
            <span>Worst status</span>
            <strong style={{ color: colors[rolledUpStatus] }}>{rolledUpStatus}</strong>
            <p>{bothCollapsed ? "The summary edge shows this status." : "Collapse both groups to show one edge with this status."}</p>
          </div>
          <button type="button" className="button" onClick={() => setStatuses(initialStatuses)}>Reset statuses</button>
          <p className="container-edges-tip">Drag the nodes or container headers to move them. Expand either group to restore individual connections.</p>
        </aside>
      </div>
    </section>
  );
}
