import { CodeBlock } from "../components/CodeBlock";

export function PresetShapes() {
    return (
        <div>
            <div className="page-tag">Presets</div>
            <h1 className="page-title">Shapes Preset</h1>
            <p className="page-desc">
                The shapes preset provides geometric node types — squares, circles, diamonds, triangles, and
                arrow-rectangles — useful for flowcharts, diagrams, and custom canvas editors.
            </p>

            <div className="section">
                <h2 className="section-title">Setup</h2>
                <CodeBlock code={`import { FlowKit, shapeNodeTypes } from "@flowkit";
import type { INode, IEdge, NodeChange, EdgeChange } from "@flowkit";

export function App() {
  const [nodes, setNodes] = useState<INode[]>(initialNodes);
  const [edges, setEdges] = useState<IEdge[]>(initialEdges);

  return (
    <FlowKit
      nodes={nodes}
      edges={edges}
      nodeTypes={shapeNodeTypes}
      onNodesChange={(changes: NodeChange[]) =>
        setNodes(prev => applyNodeChanges(changes, prev))
      }
      onEdgesChange={(changes: EdgeChange[]) =>
        setEdges(prev => applyEdgeChanges(changes, prev))
      }
    />
  );
}`} />
            </div>

            <div className="section">
                <h2 className="section-title">Creating Shape Nodes</h2>
                <CodeBlock code={`import { createShapeNode } from "@flowkit";
import type { INode } from "@flowkit";

// createShapeNode(type, key, offset) — returns a fully constructed INode
const square:   INode = createShapeNode("square",          "s1", { x: 60,  y: 60 });
const circle:   INode = createShapeNode("circle",          "s2", { x: 220, y: 60 });
const diamond:  INode = createShapeNode("diamond",         "s3", { x: 380, y: 60 });
const arrow:    INode = createShapeNode("arrow-rectangle", "s4", { x: 540, y: 60 });
const triangle: INode = createShapeNode("triangle",        "s5", { x: 700, y: 60 });`} />
            </div>

            <div className="section">
                <h2 className="section-title">Available Shapes</h2>
                <table className="props-table">
                    <thead><tr><th>Type string</th><th>Description</th></tr></thead>
                    <tbody>
                        {[
                            ['"square"', "Filled rectangle."],
                            ['"circle"', "Filled circle."],
                            ['"diamond"', "Filled rotated square (rhombus)."],
                            ['"arrow-rectangle"', "Rectangle with a right-pointing chevron on the trailing edge."],
                            ['"triangle"', "Upward-pointing filled triangle."],
                        ].map(([t, d]) => (
                            <tr key={t}>
                                <td><span className="prop-name">{t}</span></td>
                                <td className="prop-desc">{d}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="section">
                <h2 className="section-title">Individual Shape Components</h2>
                <p className="section-desc">
                    Each shape is exported as a standalone React component for embedding in custom node renderers.
                </p>
                <CodeBlock code={`import {
  ShapeSquare,
  ShapeCircle,
  ShapeDiamond,
  ShapeArrowRectangle,
  ShapeTriangle,
} from "@flowkit";

// Props interface shared by all shape components
interface ShapeProps {
  width?: number;           // default 80
  height?: number;          // default 80
  fill?: string;            // CSS fill color
  stroke?: string;          // CSS stroke color
  strokeWidth?: number;     // stroke thickness in px
  label?: string;           // text rendered inside the shape
  selected?: boolean;       // render selection highlight
  style?: React.CSSProperties;
  className?: string;
}

// Use inside a custom node component
import type { IEndpoint } from "@flowkit";

interface DiamondNodeProps {
  data: { label: string; fill?: string };
  selected: boolean;
  offset: { x: number; y: number };
  endpoints: IEndpoint[];
}

function DiamondNode({ data, selected }: DiamondNodeProps) {
  return (
    <ShapeDiamond
      width={100}
      height={100}
      fill={data.fill ?? "#3ecf8e"}
      label={data.label}
      selected={selected}
    />
  );
}`} />
            </div>

            <div className="section">
                <h2 className="section-title">Connecting Shapes</h2>
                <CodeBlock code={`import { FlowKit, shapeNodeTypes } from "@flowkit";
import type { INode, IEdge, Connection } from "@flowkit";

export function ShapeCanvas() {
  const [nodes, setNodes] = useState<INode[]>([
    createShapeNode("diamond", "start", { x: 100, y: 100 }),
    createShapeNode("square",  "step1", { x: 300, y: 100 }),
  ]);
  const [edges, setEdges] = useState<IEdge[]>([]);

  return (
    <FlowKit
      nodes={nodes}
      edges={edges}
      nodeTypes={shapeNodeTypes}
      onNodesChange={changes => setNodes(prev => applyNodeChanges(changes, prev))}
      onEdgesChange={changes => setEdges(prev => applyEdgeChanges(changes, prev))}
      onConnect={(connection: Connection) => {
        const edge: IEdge = {
          key: crypto.randomUUID(),
          type: "edge",
          sourceId: connection.sourceId,
          targetId: connection.targetId,
          anchorMode: "floating",
          arrows: "target",
        };
        setEdges(prev => [...prev, edge]);
      }}
    />
  );
}`} />
            </div>
        </div>
    );
}
