import { CodeBlock } from "../components/CodeBlock";

export function Grid() {
    return (
        <div>
            <div className="page-tag">Components</div>
            <h1 className="page-title">Grid & Background</h1>
            <p className="page-desc">
                FlowKit ships three background components — <code>FlowKitDots</code>, <code>FlowKitGrid</code>, and{" "}
                <code>FlowKitGridSnap</code> — rendered as children of <code>FlowKit</code>.
            </p>

            <div className="section">
                <h2 className="section-title">Dot Pattern</h2>
                <CodeBlock code={`import { FlowKit, FlowKitDots } from "@flowkit";

<FlowKit nodes={nodes} edges={edges} nodeTypes={nodeTypes} ...>
  <FlowKitDots
    gap={20}
    size={1.5}
    color="#3a3a4a"
  />
</FlowKit>`} />
            </div>

            <div className="section">
                <h2 className="section-title">Line Grid</h2>
                <CodeBlock code={`import { FlowKit, FlowKitGrid } from "@flowkit";

<FlowKit nodes={nodes} edges={edges} nodeTypes={nodeTypes} ...>
  <FlowKitGrid
    gap={40}
    stroke="#2a2a3a"
    strokeWidth={1}
  />
</FlowKit>`} />
            </div>

            <div className="section">
                <h2 className="section-title">Snapping Grid</h2>
                <p className="section-desc">
                    <code>FlowKitGridSnap</code> renders a grid and snaps node positions to the nearest cell when
                    dragging. Pass the same <code>gap</code> to both the component and the <code>snapToGrid</code> prop.
                </p>
                <CodeBlock code={`import { FlowKit, FlowKitGridSnap } from "@flowkit";

<FlowKit
  nodes={nodes}
  edges={edges}
  nodeTypes={nodeTypes}
  snapToGrid={20}
>
  <FlowKitGridSnap
    gap={20}
    stroke="#2a2a3a"
    strokeWidth={1}
  />
</FlowKit>`} />
            </div>

            <div className="section">
                <h2 className="section-title">Props</h2>
                <table className="props-table">
                    <thead><tr><th>Prop</th><th>Type</th><th>Applies to</th><th>Description</th></tr></thead>
                    <tbody>
                        {[
                            ["gap", "number", "All", "Cell/dot spacing in pixels."],
                            ["size", "number", "FlowKitDots", "Dot radius in pixels."],
                            ["color", "string", "FlowKitDots", "Dot fill color."],
                            ["stroke", "string", "FlowKitGrid / GridSnap", "Grid line color."],
                            ["strokeWidth", "number", "FlowKitGrid / GridSnap", "Grid line thickness."],
                        ].map(([n, t, a, d]) => (
                            <tr key={n}>
                                <td><span className="prop-name">{n}</span></td>
                                <td><span className="prop-type">{t}</span></td>
                                <td className="prop-desc">{a}</td>
                                <td className="prop-desc">{d}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
