import { CodeBlock } from "../components/CodeBlock";

export function MiniMap() {
    return (
        <div>
            <div className="page-tag">Components</div>
            <h1 className="page-title">MiniMap</h1>
            <p className="page-desc">
                <code>FlowKitMiniMap</code> renders a thumbnail overview of the entire canvas with a viewport
                indicator. Click or drag inside it to navigate the main canvas.
            </p>

            <div className="section">
                <h2 className="section-title">Usage</h2>
                <CodeBlock code={`import { FlowKit, FlowKitMiniMap } from "@flowkit";

<FlowKit nodes={nodes} edges={edges} nodeTypes={nodeTypes} ...>
  <FlowKitMiniMap
    position="bottom-right"
    width={200}
    height={140}
    pannable={true}
  />
</FlowKit>`} />
            </div>

            <div className="section">
                <h2 className="section-title">Props</h2>
                <table className="props-table">
                    <thead><tr><th>Prop</th><th>Type</th><th>Description</th></tr></thead>
                    <tbody>
                        {[
                            ["position", "string", "Corner to place the minimap: top-left | top-right | bottom-left | bottom-right."],
                            ["width", "number", "Panel width in pixels (default 200)."],
                            ["height", "number", "Panel height in pixels (default 150)."],
                            ["nodeColor", "(node: INode) => string", "Function returning a CSS color string for each node dot."],
                            ["maskColor", "string", "Color of the viewport indicator overlay."],
                            ["pannable", "boolean", "Click inside the minimap to pan the main canvas (default true)."],
                            ["zoomable", "boolean", "Scroll inside the minimap to zoom (default false)."],
                            ["style", "CSSProperties", "Inline styles for the minimap panel."],
                            ["className", "string", "CSS class for the minimap panel."],
                        ].map(([n, t, d]) => (
                            <tr key={n}>
                                <td><span className="prop-name">{n}</span></td>
                                <td><span className="prop-type">{t}</span></td>
                                <td className="prop-desc">{d}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="section">
                <h2 className="section-title">Custom Node Colors</h2>
                <CodeBlock code={`<FlowKitMiniMap
  nodeColor={(node) => {
    const category = node.data?.category;
    if (category === "server")   return "#3ecf8e";
    if (category === "security") return "#e06c75";
    if (category === "cloud")    return "#fd9644";
    return "#4f8ef7";
  }}
/>`} />
            </div>
        </div>
    );
}
