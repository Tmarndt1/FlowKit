import { CodeBlock } from "../components/CodeBlock";

export function Controls() {
    return (
        <div>
            <div className="page-tag">Components</div>
            <h1 className="page-title">Controls</h1>
            <p className="page-desc">
                <code>FlowKitControls</code> adds zoom and re-center buttons to the canvas. The same viewport
                actions are available imperatively via a <code>ref</code> or the <code>useFlowKitControls</code> hook.
            </p>

            <div className="section">
                <h2 className="section-title">FlowKitControls</h2>
                <p className="section-desc">Render as a child of <code>FlowKit</code> to add the built-in control panel.</p>
                <CodeBlock code={`import { FlowKit, FlowKitControls } from "@flowkit";

<FlowKit nodes={nodes} edges={edges} nodeTypes={nodeTypes} ...>
  <FlowKitControls position="bottom-right" />
</FlowKit>`} />
            </div>

            <div className="section">
                <h2 className="section-title">FlowKitHandle</h2>
                <p className="section-desc">
                    The ref handle and the <code>useFlowKitControls</code> hook both expose the same interface.
                </p>
                <CodeBlock code={`/** Imperative API exposed by FlowKit refs for external controls and topology panels. */
interface FlowKitHandle {
  /** Fits all rendered nodes in view and centers the viewport around them. */
  recenter: () => void;

  /** Centers the viewport around a node by key. Returns false when the node cannot be found. */
  panToNode: (nodeKey: string, options?: PanToNodeOptions) => boolean;

  /**
   * Notifies all edges that node positions have changed programmatically
   * (e.g. after applying an auto-layout algorithm). Call this after updating
   * node offsets so that edge paths are recomputed from the new DOM positions.
   */
  notifyLayout: () => void;

  /** Zooms the viewport in one step. */
  zoomIn: () => void;

  /** Zooms the viewport out one step. */
  zoomOut: () => void;
}`} />
            </div>

            <div className="section">
                <h2 className="section-title">Ref Handle</h2>
                <p className="section-desc">
                    Use a ref to control the viewport from outside the <code>FlowKit</code> tree.
                </p>
                <CodeBlock code={`import { useRef } from "react";
import { FlowKit } from "@flowkit";
import type { FlowKitHandle } from "@flowkit";

function App() {
  const ref = useRef<FlowKitHandle>(null);

  return (
    <>
      <div className="toolbar">
        <button onClick={() => ref.current?.recenter()}>Fit View</button>
        <button onClick={() => ref.current?.zoomIn()}>+</button>
        <button onClick={() => ref.current?.zoomOut()}>−</button>
        <button onClick={() => ref.current?.panToNode("node-1")}>Go to Node</button>
      </div>
      <FlowKit ref={ref} nodes={nodes} edges={edges} nodeTypes={nodeTypes} />
    </>
  );
}`} />
            </div>

            <div className="section">
                <h2 className="section-title">useFlowKitControls Hook</h2>
                <p className="section-desc">
                    Use this hook from a component rendered <em>inside</em> the <code>FlowKit</code> tree.
                    It returns the same <code>FlowKitHandle</code> as the ref.
                </p>
                <CodeBlock code={`import { useFlowKitControls } from "@flowkit";
import type { FlowKitHandle } from "@flowkit";

// Must be a child of FlowKit
function InlineToolbar() {
  const controls: FlowKitHandle = useFlowKitControls();

  return (
    <div className="inline-toolbar">
      <button onClick={() => controls.recenter()}>Fit</button>
      <button onClick={() => controls.zoomIn()}>+</button>
      <button onClick={() => controls.zoomOut()}>−</button>
    </div>
  );
}

<FlowKit ...>
  <InlineToolbar />
</FlowKit>`} />
            </div>

            <div className="section">
                <h2 className="section-title">notifyLayout</h2>
                <p className="section-desc">
                    Call <code>notifyLayout</code> after programmatically updating node positions (e.g. after
                    running an auto-layout algorithm) so that edge paths are recomputed from the new DOM positions.
                </p>
                <CodeBlock code={`import { useRef } from "react";
import { FlowKit } from "@flowkit";
import { hierarchicalLayout, toLayoutNodes, toLayoutEdges, applyLayout } from "@flowkit";
import type { FlowKitHandle } from "@flowkit";

function App() {
  const ref = useRef<FlowKitHandle>(null);

  function runLayout() {
    const result = hierarchicalLayout(
      toLayoutNodes(nodes, { width: 160, height: 60 }),
      toLayoutEdges(edges),
      { direction: "TB" },
    );
    setNodes(applyLayout(result, nodes));
    // Edges need to know node positions have changed
    ref.current?.notifyLayout();
  }

  return (
    <>
      <button onClick={runLayout}>Auto Layout</button>
      <FlowKit ref={ref} nodes={nodes} edges={edges} nodeTypes={nodeTypes} />
    </>
  );
}`} />
            </div>

            <div className="section">
                <h2 className="section-title">FlowKitControls Props</h2>
                <table className="props-table">
                    <thead><tr><th>Prop</th><th>Type</th><th>Description</th></tr></thead>
                    <tbody>
                        {[
                            ["position", '"bottom-right" | "bottom-left" | "top-right" | "top-left"', "Panel position (default bottom-right)."],
                            ["style", "React.CSSProperties", "Inline styles for the controls wrapper."],
                            ["className", "string", "CSS class for the controls wrapper."],
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
        </div>
    );
}
