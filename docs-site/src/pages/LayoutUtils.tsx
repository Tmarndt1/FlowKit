import { CodeBlock } from "../components/CodeBlock";

export function LayoutUtils() {
    return (
        <div>
            <div className="page-tag">Layout</div>
            <h1 className="page-title">Layout Utilities</h1>
            <p className="page-desc">
                FlowKit includes utility functions for positioning nodes, building graph adjacency structures,
                and finding free space on the canvas.
            </p>

            <div className="section">
                <h2 className="section-title">placeConnected</h2>
                <p className="section-desc">
                    Positions newly added nodes near their connected neighbors — useful when adding nodes one at a time.
                </p>
                <CodeBlock code={`import { placeConnected } from "@flowkit";

// Place a new node near its connected source
const positioned = placeConnected(
  newNode,          // INode to position
  existingNodes,    // all current nodes
  connectedId,      // id of a node to place near
  { gap: 80 }       // optional spacing options
);

setNodes(prev => [...prev, positioned]);`} />
            </div>

            <div className="section">
                <h2 className="section-title">findFreePosition</h2>
                <p className="section-desc">
                    Finds an unoccupied (x, y) position on the canvas that doesn't overlap existing nodes.
                </p>
                <CodeBlock code={`import { findFreePosition } from "@flowkit";

const { x, y } = findFreePosition(
  existingNodes,
  { width: 120, height: 40 },   // size of the node to place
  { startX: 0, startY: 0, gap: 20 }
);

const newNode: INode = {
  id: "new",
  type: "card",
  offset: { x, y },
  data: { label: "New Node" },
};`} />
            </div>

            <div className="section">
                <h2 className="section-title">buildAdjacency</h2>
                <p className="section-desc">
                    Builds an adjacency map from nodes and edges. Useful for graph traversal logic.
                </p>
                <CodeBlock code={`import { buildAdjacency } from "@flowkit";

const adjacency = buildAdjacency(nodes, edges);
// Returns: Map<nodeId, { incoming: string[], outgoing: string[] }>

const { outgoing } = adjacency.get("node-a")!;
// outgoing = ["node-b", "node-c"]`} />
            </div>

            <div className="section">
                <h2 className="section-title">topoRanks</h2>
                <p className="section-desc">
                    Assigns a rank (depth level) to each node based on topological sort.
                    Useful for custom layout algorithms.
                </p>
                <CodeBlock code={`import { topoRanks, buildAdjacency, toLayoutNodes, toLayoutEdges } from "@flowkit";

const layoutNodes = toLayoutNodes(nodes);
const layoutEdges = toLayoutEdges(edges);
const adjacency = buildAdjacency(nodes, edges);
const ranks = topoRanks(layoutNodes, adjacency);
// Returns: Map<nodeId, number>  (0 = root, 1 = first level, etc.)`} />
            </div>

            <div className="section">
                <h2 className="section-title">getFoldGraphState</h2>
                <p className="section-desc">
                    Computes which nodes and edges should be hidden when a container is collapsed.
                </p>
                <CodeBlock code={`import { getFoldGraphState } from "@flowkit";
import type { IFoldGraphState } from "@flowkit";

const foldState: IFoldGraphState = getFoldGraphState(
  nodes,
  edges,
  containers,
  "group-frontend"   // id of the container being collapsed
);

// foldState.hiddenNodeIds  — nodes inside the container
// foldState.hiddenEdgeIds  — edges that cross the container boundary
// foldState.collapsedEdges — replacement edges to show collapsed connectivity`} />
            </div>
        </div>
    );
}
