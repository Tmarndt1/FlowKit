import * as React from "react";
import {
  EdgePathType, Endpoint, FlowKit, FlowKitControls, FlowKitEvents, FlowKitGrid, FlowKitHandle,
  useFlowKitChangeHandlers,
} from "../../../lib/index";
import {
  createPerformanceGraph, getPerformanceStats, PERFORMANCE_SIZES,
  PerformanceNode, PerformanceStats,
} from "../performanceModel";

const PerformanceNodeView = React.memo(function PerformanceNodeView(props: PerformanceNode) {
  return (
    <div className="performance-node" style={{ "--worker-color": props.data?.color } as React.CSSProperties}>
      <div className="performance-node-title"><i /><strong>{props.data?.label}</strong></div>
      <div className="performance-node-load"><span>Load</span><span>{props.data?.load}%</span></div>
      <div className="performance-node-bar"><i style={{ width: `${props.data?.load ?? 0}%` }} /></div>
      {props.endpoints.map((endpoint) => <Endpoint key={endpoint.id} endpoint={endpoint} style={{ background: "#92a6bc" }} />)}
    </div>
  );
});
const nodeTypes = { performance: PerformanceNodeView as React.FunctionComponent<any> };

function FrameMeter() {
  const [sample, setSample] = React.useState<{ fps: number; frameMs: number } | null>(null);
  React.useEffect(() => {
    let frame: number;
    let start = performance.now();
    let previous = start;
    let count = 0;
    let longest = 0;
    const measure = (time: number) => {
      if (document.visibilityState !== "visible") {
        start = time;
        count = 0;
        longest = 0;
      } else {
        longest = Math.max(longest, time - previous);
        count++;
        if (time - start >= 1000) {
          setSample({ fps: Math.round(count * 1000 / (time - start)), frameMs: longest });
          start = time;
          count = 0;
          longest = 0;
        }
      }
      previous = time;
      frame = requestAnimationFrame(measure);
    };
    frame = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <div className="performance-frame-meter">
      <div><strong>{sample?.fps ?? "—"}</strong><span>Browser FPS</span></div>
      <div><strong>{sample == null ? "—" : sample.frameMs.toFixed(1)}<small> ms</small></strong><span>Slowest frame / last second</span></div>
    </div>
  );
}

const PerformanceCanvas = React.memo(function PerformanceCanvas({
  nodeCount, revision, animatedEdges, edgePathType, liveUpdates,
}: { nodeCount: number; revision: number; animatedEdges: boolean; edgePathType: EdgePathType; liveUpdates: boolean }) {
  const graph = React.useMemo(() => createPerformanceGraph(nodeCount), [nodeCount, revision]);
  const [nodes, setNodes] = React.useState(graph.nodes);
  const [containers, setContainers] = React.useState(graph.containers);
  const flowRef = React.useRef<FlowKitHandle>(null);
  const liveTickRef = React.useRef(0);
  const handlers = useFlowKitChangeHandlers({ setNodes, setContainers });
  const edges = React.useMemo(() => graph.edges.map((edge) => ({ ...edge, animated: animatedEdges })), [animatedEdges, graph.edges]);

  React.useEffect(() => {
    if (!liveUpdates) return;
    // Leave a pause after each committed batch so slow devices can still process
    // controls instead of accumulating interval callbacks behind a large render.
    const timeout = window.setTimeout(() => {
      const bucket = liveTickRef.current++ % 20;
      setNodes((current) => current.map((node, index) => index % 20 === bucket
        ? { ...node, data: { ...node.data!, load: (node.data!.load + 13) % 100 } }
        : node));
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [liveUpdates, nodes]);

  return (
    <div className="performance-canvas">
      <FlowKit ref={flowRef} nodes={nodes} edges={edges} containers={containers} nodeTypes={nodeTypes}
        centerOnLoad edgePathType={edgePathType} zoomMin={0.025} zoomMax={2}>
        <FlowKitGrid size={32} />
        <FlowKitControls />
        <FlowKitEvents {...handlers} />
      </FlowKit>
      <div className="performance-canvas-actions">
        <button className="button" onClick={() => flowRef.current?.recenter()} type="button">Fit graph</button>
        <button className="button" onClick={() => flowRef.current?.panToNode(`perf-node-${Math.floor(nodeCount / 2)}`, { scale: 0.8 })} type="button">Inspect workers</button>
      </div>
    </div>
  );
});

export function PerformanceDemo({ animatedEdges, edgePathType, onStatsChange }: {
  animatedEdges: boolean;
  edgePathType: EdgePathType;
  onStatsChange: (stats: PerformanceStats) => void;
}) {
  const [nodeCount, setNodeCount] = React.useState(1000);
  const [revision, setRevision] = React.useState(0);
  const [liveUpdates, setLiveUpdates] = React.useState(false);
  const stats = React.useMemo(() => getPerformanceStats(nodeCount), [nodeCount]);
  React.useEffect(() => onStatsChange(stats), [onStatsChange, stats]);

  return (
    <div className="performance-demo-panel">
      <PerformanceCanvas key={`${nodeCount}-${revision}`} nodeCount={nodeCount} revision={revision}
        animatedEdges={animatedEdges} edgePathType={edgePathType} liveUpdates={liveUpdates} />
      <aside className="performance-sidebar">
        <span className="performance-eyebrow">Scale playground</span>
        <h1>More graph.<br />Same canvas.</h1>
        <p>Explore a fleet of connected workers. Pan, zoom, select nodes, or drag a whole cluster.</p>
        <div className="performance-counts">
          <div><strong>{stats.nodes.toLocaleString()}</strong><span>Nodes</span></div>
          <div><strong>{stats.containers.toLocaleString()}</strong><span>Containers</span></div>
          <div><strong>{stats.edges.toLocaleString()}</strong><span>Edges</span></div>
        </div>
        <h2>Choose graph size</h2>
        <div className="performance-size-options">
          {PERFORMANCE_SIZES.map((size) => (
            <button key={size} aria-pressed={nodeCount === size} className={nodeCount === size ? "active" : undefined}
              onClick={() => setNodeCount(size)} type="button">{size.toLocaleString()}<span>nodes</span></button>
          ))}
        </div>
        <label className="performance-live-toggle">
          <input type="checkbox" checked={liveUpdates} onChange={(event) => setLiveUpdates(event.target.checked)} />
          <span><strong>Live worker updates</strong><small>Update 5% of worker loads at a time.</small></span>
        </label>
        <FrameMeter />
        <p className="performance-meter-note">Frame rate measures browser animation frames. Compare it while panning, zooming, or running live updates; results depend on your device and display.</p>
        <button className="button performance-reset" onClick={() => setRevision((current) => current + 1)} type="button">Reset graph positions</button>
        <div className="performance-hint"><strong>Try a closer look</strong><p>Use “Inspect workers” to zoom into the graph, then drag a worker or a cluster header. Enable Flow above to animate the connections.</p></div>
      </aside>
    </div>
  );
}
