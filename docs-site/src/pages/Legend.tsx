import { CodeBlock } from "../components/CodeBlock";

export function Legend() {
    return (
        <div>
            <div className="page-tag">Components</div>
            <h1 className="page-title">Legend</h1>
            <p className="page-desc">
                <code>FlowKitLegend</code> renders a floating overlay that describes what each node type or
                color represents on the canvas.
            </p>

            <div className="section">
                <h2 className="section-title">Usage</h2>
                <CodeBlock code={`import { FlowKit, FlowKitLegend } from "@flowkit";
import type { FlowKitLegendItem } from "@flowkit";

const items: FlowKitLegendItem[] = [
  { label: "Server",   color: "#3ecf8e" },
  { label: "Database", color: "#4f8ef7" },
  { label: "Router",   color: "#fd9644" },
  { label: "Firewall", color: "#e06c75" },
];

<FlowKit nodes={nodes} edges={edges} nodeTypes={nodeTypes} ...>
  <FlowKitLegend
    items={items}
    title="Node Types"
    position="bottom-left"
  />
</FlowKit>`} />
            </div>

            <div className="section">
                <h2 className="section-title">FlowKitLegendItem Interface</h2>
                <CodeBlock code={`interface FlowKitLegendItem {
  label: string;     // display text
  color?: string;    // swatch fill color
  icon?: ReactNode;  // custom icon instead of color swatch
}`} />
            </div>

            <div className="section">
                <h2 className="section-title">Props</h2>
                <table className="props-table">
                    <thead><tr><th>Prop</th><th>Type</th><th>Description</th></tr></thead>
                    <tbody>
                        {[
                            ["items", "FlowKitLegendItem[]", "Array of legend entries to display."],
                            ["title", "string", "Optional heading above the item list."],
                            ["position", "string", "Corner: top-left | top-right | bottom-left | bottom-right."],
                            ["style", "CSSProperties", "Inline styles for the legend panel."],
                            ["className", "string", "CSS class for the legend panel."],
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
                <h2 className="section-title">Custom Icons</h2>
                <CodeBlock code={`import { ServerIcon, DatabaseIcon } from "./icons";

const items: FlowKitLegendItem[] = [
  { label: "Server",   icon: <ServerIcon size={14} /> },
  { label: "Database", icon: <DatabaseIcon size={14} /> },
];`} />
            </div>
        </div>
    );
}
