import * as React from "react";
import {
  FlowKit, FlowKitControls, FlowKitDots, FlowKitMiniMap,
  flowKitThemes, FlowKitThemeName, EdgePathType, INode, IEdge, INodeContainer,
} from "../../../lib/index";

type PreviewNode = INode<{ label: string; detail: string }, never>;
const nodes: PreviewNode[] = [
  { key: "source", type: "preview", offset: { x: 30, y: 70 }, endpoints: [], data: { label: "Source", detail: "Receive data" } },
  { key: "transform", type: "preview", offset: { x: 190, y: 70 }, endpoints: [], data: { label: "Transform", detail: "Apply rules" } },
  { key: "result", type: "preview", offset: { x: 350, y: 70 }, endpoints: [], data: { label: "Result", detail: "Publish output" } },
];
const edges: IEdge<never>[] = [
  { key: "first", sourceId: "source", targetId: "transform", anchorMode: "floating", markerEnd: "arrow" },
  { key: "second", sourceId: "transform", targetId: "result", anchorMode: "floating", markerEnd: "arrow" },
];
const containers: INodeContainer[] = [{ key: "pipeline", label: "Data pipeline", nodeKeys: ["source", "transform", "result"], padding: 20 }];

function PreviewNodeComponent({ data, style }: { data?: PreviewNode["data"]; style?: React.CSSProperties }) {
  return <div className="theme-preview-node" style={style}><strong>{data?.label}</strong><span>{data?.detail}</span></div>;
}
const nodeTypes = { preview: PreviewNodeComponent };
const descriptions: Record<FlowKitThemeName, string> = {
  dark: "Cool slate surfaces with a soft blue accent.",
  light: "Clean white cards on a pale canvas.",
  ocean: "Deep blue surfaces with bright turquoise connections.",
  forest: "Evergreen surfaces with soft mint highlights.",
  sunset: "Warm plum surfaces with peach highlights.",
};

export function ThemeShowcase({ theme, onThemeChange, edgePathType, animatedEdges }: {
  theme: FlowKitThemeName;
  onThemeChange: (theme: FlowKitThemeName) => void;
  edgePathType: EdgePathType;
  animatedEdges: boolean;
}) {
  const displayEdges = React.useMemo(() => edges.map((edge) => ({ ...edge, animated: animatedEdges })), [animatedEdges]);
  return (
    <section className="theme-showcase" aria-label="Theme showcase">
      <div className="theme-showcase-heading">
        <span className="theme-eyebrow">MAKE IT YOURS</span>
        <h1>One canvas. Five different moods.</h1>
        <p>Compare the same graph in every built-in theme. Select nodes, pan, and zoom each preview, or apply a palette to the demo.</p>
      </div>
      <div className="theme-gallery">
        {(Object.keys(flowKitThemes) as FlowKitThemeName[]).map((name) => (
          <article className={`theme-card${theme === name ? " theme-card-active" : ""}`} key={name} style={flowKitThemes[name]}>
            <div className="theme-card-preview">
              <FlowKit nodes={nodes} edges={displayEdges} containers={containers} nodeTypes={nodeTypes} theme={name} edgePathType={edgePathType} centerOnLoad readOnly>
                <FlowKitDots spacing={18} />
                <FlowKitControls />
                <FlowKitMiniMap nodes={nodes} width={90} height={56} />
              </FlowKit>
            </div>
            <div className="theme-card-details">
              <div><h2>{name[0].toUpperCase() + name.slice(1)}</h2><p>{descriptions[name]}</p></div>
              <div className="theme-swatches" aria-hidden="true">
                {["background", "surface", "border-color", "accent", "color"].map((token) => <span key={token} style={{ background: `var(--flow-kit-${token})` }} />)}
              </div>
              <button type="button" aria-pressed={theme === name} onClick={() => onThemeChange(name)}>{theme === name ? "Selected" : "Use theme"}</button>
            </div>
          </article>
        ))}
      </div>
      <div className="theme-custom-hint">
        <strong>Your brand, your palette.</strong>
        <p>Start with a preset and override its CSS variables. Custom node components can use the same variables.</p>
        <pre><code>{`<FlowKit theme={{\n  ...flowKitThemes.light,\n  "--flow-kit-edge-color": "#a855f7",\n  "--flow-kit-node-selected-color": "#a855f7",\n}} nodes={nodes} edges={edges} />`}</code></pre>
      </div>
    </section>
  );
}
