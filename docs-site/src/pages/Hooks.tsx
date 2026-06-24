import { CodeBlock } from "../components/CodeBlock";

export function Hooks() {
    return (
        <div>
            <div className="page-tag">Events & Hooks</div>
            <h1 className="page-title">Hooks</h1>
            <p className="page-desc">
                FlowKit exports React hooks for reading canvas state from components rendered inside
                the <code>FlowKit</code> tree.
            </p>

            <div className="section">
                <h2 className="section-title">useNodeFlowSelection</h2>
                <p className="section-desc">
                    Returns the currently selected node or edge as a <code>FlowElement</code> (which is{" "}
                    <code>INode | IEdge</code>), or <code>null</code> when nothing is selected.
                </p>
                <CodeBlock code={`import { useNodeFlowSelection } from "@flowkit";
import type { FlowElement, INode, IEdge } from "@flowkit";

/** Selection union emitted by FlowKit selection events. */
type FlowElement = INode<any, any> | IEdge<any>;

// Must be rendered as a descendant of <FlowKit>
function SelectionPanel() {
  const selected: FlowElement | null = useNodeFlowSelection();

  if (selected == null) return null;

  // Distinguish node vs edge by checking for node-specific fields
  const isNode = "offset" in selected;

  return (
    <div className="selection-panel">
      <p>Type: {isNode ? "Node" : "Edge"}</p>
      <p>Key: {selected.key}</p>
    </div>
  );
}

<FlowKit nodes={nodes} edges={edges} nodeTypes={nodeTypes}>
  <SelectionPanel />
</FlowKit>`} />
            </div>

            <div className="section">
                <h2 className="section-title">useNodeFlowSelectionChange</h2>
                <p className="section-desc">
                    Subscribe to selection changes with callbacks. Each callback receives the full{" "}
                    <code>FlowElement</code> — not just its key.
                </p>
                <CodeBlock code={`import { useNodeFlowSelectionChange } from "@flowkit";
import type { FlowElement } from "@flowkit";

/** Subscribes to selection changes for components rendered inside FlowKit. */
function useNodeFlowSelectionChange(
  onSelected?:       (element: FlowElement) => void,
  onUnselected?:     (element: FlowElement) => void,
  onSelectionChange?: (
    selection: FlowElement | null,
    previousSelection: FlowElement | null,
  ) => void,
): void

// Usage — all three callbacks are optional
function SelectionTracker() {
  useNodeFlowSelectionChange(
    (element) => {
      console.log("selected:", element.key);
    },
    (element) => {
      console.log("deselected:", element.key);
    },
    (current, previous) => {
      analytics.track("selection_change", {
        from: previous?.key ?? null,
        to:   current?.key ?? null,
      });
    },
  );

  return null; // purely side-effect
}

<FlowKit ...>
  <SelectionTracker />
</FlowKit>`} />
            </div>

            <div className="section">
                <h2 className="section-title">useNodeFlowSelectedNodes / useNodeFlowSelectedEdges</h2>
                <p className="section-desc">
                    When multi-select is active, use these hooks to read all currently selected nodes or edges.
                </p>
                <CodeBlock code={`import { useNodeFlowSelectedNodes, useNodeFlowSelectedEdges } from "@flowkit";
import type { INode, IEdge } from "@flowkit";

function MultiSelectionInfo() {
  const selectedNodes: INode<any, any>[] = useNodeFlowSelectedNodes();
  const selectedEdges: IEdge<any>[]      = useNodeFlowSelectedEdges();

  return (
    <div className="multi-select-badge">
      {selectedNodes.length} node{selectedNodes.length !== 1 ? "s" : ""},
      {" "}{selectedEdges.length} edge{selectedEdges.length !== 1 ? "s" : ""} selected
    </div>
  );
}

<FlowKit multiSelect={true} ...>
  <MultiSelectionInfo />
</FlowKit>`} />
            </div>

            <div className="section">
                <h2 className="section-title">useFlowKitControls</h2>
                <p className="section-desc">
                    Exposes the imperative <code>FlowKitHandle</code> API from within the canvas tree.
                    See the <strong>Controls</strong> page for the full handle reference.
                </p>
                <CodeBlock code={`import { useFlowKitControls } from "@flowkit";
import type { FlowKitHandle } from "@flowkit";

function ZoomBar() {
  const controls: FlowKitHandle = useFlowKitControls();

  return (
    <div className="zoom-bar">
      <button onClick={() => controls.zoomOut()}>−</button>
      <button onClick={() => controls.recenter()}>Fit</button>
      <button onClick={() => controls.zoomIn()}>+</button>
    </div>
  );
}

<FlowKit ...>
  <ZoomBar />
</FlowKit>`} />
            </div>

            <div className="section">
                <h2 className="section-title">Detail Panel Pattern</h2>
                <p className="section-desc">
                    The most common pattern: read the current selection inside a panel component that lives
                    inside the <code>FlowKit</code> tree.
                </p>
                <CodeBlock code={`import { useNodeFlowSelection } from "@flowkit";
import type { FlowElement, INode } from "@flowkit";

interface ServiceData {
  label: string;
  host: string;
  port: number;
}

function DetailPanel() {
  // Returns the selected INode or IEdge, or null
  const selected: FlowElement | null = useNodeFlowSelection();

  // Narrow to INode by checking for node-specific fields
  const node = selected != null && "offset" in selected
    ? selected as INode<ServiceData, any>
    : null;

  if (node == null) return null;

  return (
    <aside className="detail-panel">
      <h3>{node.data?.label}</h3>
      <dl>
        <dt>Host</dt><dd>{node.data?.host}</dd>
        <dt>Port</dt><dd>{node.data?.port}</dd>
        <dt>Position</dt>
        <dd>({node.offset.x}, {node.offset.y})</dd>
      </dl>
    </aside>
  );
}

<FlowKit nodes={nodes} edges={edges} nodeTypes={nodeTypes}>
  <DetailPanel />
</FlowKit>`} />
            </div>
        </div>
    );
}
