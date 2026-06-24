import { CodeBlock } from "../components/CodeBlock";

export function Events() {
    return (
        <div>
            <div className="page-tag">Events & Hooks</div>
            <h1 className="page-title">Events</h1>
            <p className="page-desc">
                FlowKit uses two patterns for events: change callbacks are bridged through the{" "}
                <code>FlowKitEvents</code> child component, while collapse and connection events are
                props on <code>FlowKit</code> itself.
            </p>

            <div className="section">
                <h2 className="section-title">FlowKitEvents</h2>
                <p className="section-desc">
                    <code>FlowKitEvents</code> is a non-visual child component that forwards node, edge, and
                    container change deltas to your callbacks. Render it inside <code>FlowKit</code>.
                </p>
                <CodeBlock code={`import { FlowKit, FlowKitEvents, applyNodeChanges, applyEdgeChanges } from "@flowkit";
import type {
  INode, IEdge,
  NodeChange, EdgeChange, ContainerChange,
} from "@flowkit";

export function App() {
  const [nodes, setNodes] = useState<INode<any, any>[]>(initialNodes);
  const [edges, setEdges] = useState<IEdge<any>[]>(initialEdges);

  return (
    <FlowKit nodes={nodes} edges={edges} nodeTypes={nodeTypes}>
      <FlowKitEvents
        onNodesChange={(changes: NodeChange[]) =>
          setNodes(prev => applyNodeChanges(changes, prev))
        }
        onEdgesChange={(changes: EdgeChange[]) =>
          setEdges(prev => applyEdgeChanges(changes, prev))
        }
        onContainersChange={(changes: ContainerChange[]) =>
          setContainers(prev => applyContainerChanges(changes, prev))
        }
      />
    </FlowKit>
  );
}`} />
            </div>

            <div className="section">
                <h2 className="section-title">FlowKitEvents Props</h2>
                <table className="props-table">
                    <thead><tr><th>Prop</th><th>Type</th><th>Description</th></tr></thead>
                    <tbody>
                        {[
                            ["onNodesChange", "(changes: NodeChange[]) => void", "Called with normalized change descriptors when nodes are repositioned, resized, selected, added, or removed."],
                            ["onEdgesChange", "(changes: EdgeChange[]) => void", "Called with normalized change descriptors when edges are connected, selected, added, or removed."],
                            ["onContainersChange", "(changes: ContainerChange[]) => void", "Called with normalized change descriptors when containers are moved, resized, or have membership changes."],
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
                <h2 className="section-title">NodeChange Discriminated Union</h2>
                <CodeBlock code={`type NodeChange =
  | { type: "position";   key: string; offset: { x: number; y: number } }
  | { type: "select";     key: string; selected: boolean }
  | { type: "remove";     key: string }
  | { type: "add";        node: INode<any, any> }
  | { type: "dimensions"; key: string; width: number; height: number };`} />
            </div>

            <div className="section">
                <h2 className="section-title">EdgeChange Discriminated Union</h2>
                <CodeBlock code={`type EdgeChange =
  | { type: "connect"; sourceId: string; targetId: string }
  | { type: "select";  key: string; selected: boolean }
  | { type: "remove";  key: string }
  | { type: "add";     edge: IEdge<any> };`} />
            </div>

            <div className="section">
                <h2 className="section-title">ContainerChange Discriminated Union</h2>
                <CodeBlock code={`type ContainerChange =
  | { type: "move";       key: string; position: { x: number; y: number } }
  | { type: "resize";     key: string; position: { x: number; y: number }; width: number; height: number }
  | { type: "membership"; key: string; nodeKeys: string[] }
  | { type: "add";        container: INodeContainer }
  | { type: "remove";     key: string };`} />
            </div>

            <div className="section">
                <h2 className="section-title">Edge Collapse Events</h2>
                <p className="section-desc">
                    These are props on <code>FlowKit</code> directly, not on <code>FlowKitEvents</code>.
                </p>
                <CodeBlock code={`import type {
  IEdgeCollapsedChangeArgs,
  IEdgeCollapsePreviewChangeArgs,
} from "@flowkit";

/** Emitted when the built-in edge fold control changes an edge collapse state. */
interface IEdgeCollapsedChangeArgs {
  /** Next collapsed state requested by the control. */
  collapsed: boolean;
  /** Edge whose collapse state changed. */
  edge: IEdge<any>;
  /** Collapse mode selected by the user. */
  mode: "edge" | "downstream" | "upstream" | "both";
}

/** Emitted while hovering collapse menu options so consumers can add previews. */
interface IEdgeCollapsePreviewChangeArgs {
  /** Edge currently being previewed. */
  edge: IEdge<any>;
  /** Previewed collapse mode, or null when preview should clear. */
  mode: "edge" | "downstream" | "upstream" | "both" | null;
}

<FlowKit
  nodes={nodes}
  edges={edges}
  nodeTypes={nodeTypes}
  collapsibleEdges={true}
  onEdgeCollapsedChange={(args: IEdgeCollapsedChangeArgs) => {
    setEdges(prev =>
      prev.map(e =>
        e.key === args.edge.key
          ? { ...e, collapsed: args.collapsed, collapseMode: args.mode }
          : e
      )
    );
  }}
  onEdgeCollapsePreviewChange={(args: IEdgeCollapsePreviewChangeArgs) => {
    // Use args.mode === null to clear the preview highlight
    setPreviewEdgeKey(args.mode != null ? args.edge.key : null);
  }}
/>`} />
            </div>

            <div className="section">
                <h2 className="section-title">Connection Validation</h2>
                <p className="section-desc">
                    Pass <code>canConnect</code> to <code>FlowKit</code> to reject connections before they are
                    created. Return <code>false</code> to block the connection.
                </p>
                <CodeBlock code={`import type { CanConnect, ICanConnectArgs } from "@flowkit";

/** Arguments passed to canConnect before FlowKit accepts a new connection. */
interface ICanConnectArgs {
  /** Endpoint where the drag started. */
  source: IEndpoint<any>;
  /** Endpoint currently targeted by the drag/drop. */
  target: IEndpoint<any>;
}

/** Return false to reject a proposed connection. */
type CanConnect = (args: ICanConnectArgs) => boolean;

const canConnect: CanConnect = ({ source, target }) => {
  // Prevent connecting an endpoint to itself
  if (source.id === target.id) return false;
  // Only allow tcp-to-tcp connections
  if (source.data?.protocol !== target.data?.protocol) return false;
  return true;
};

<FlowKit nodes={nodes} edges={edges} nodeTypes={nodeTypes} canConnect={canConnect} />`} />
            </div>

            <div className="section">
                <h2 className="section-title">Manually Processing Changes</h2>
                <p className="section-desc">
                    Inspect the <code>type</code> discriminant to handle specific change variants yourself
                    instead of using <code>applyNodeChanges</code>.
                </p>
                <CodeBlock code={`import type { NodeChange } from "@flowkit";

function handleNodesChange(changes: NodeChange[]) {
  for (const change of changes) {
    switch (change.type) {
      case "position":
        // change.key, change.offset
        persistNodePosition(change.key, change.offset);
        break;
      case "select":
        // change.key, change.selected
        updateSelectionUI(change.key, change.selected);
        break;
      case "remove":
        // change.key
        deleteNodeFromDatabase(change.key);
        break;
    }
  }

  setNodes(prev => applyNodeChanges(changes, prev));
}`} />
            </div>
        </div>
    );
}
