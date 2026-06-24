import { CodeBlock } from "../components/CodeBlock";

export function PresetWorkflow() {
    return (
        <div>
            <div className="page-tag">Presets</div>
            <h1 className="page-title">Workflow Preset</h1>
            <p className="page-desc">
                The workflow preset provides node types for automation pipelines — triggers, conditions, actions,
                and outputs — suitable for building visual workflow editors.
            </p>

            <div className="section">
                <h2 className="section-title">Setup</h2>
                <CodeBlock code={`import { FlowKit, workflowNodeTypes } from "@flowkit";
import type { INode, IEdge, NodeChange, EdgeChange } from "@flowkit";

export function App() {
  const [nodes, setNodes] = useState<INode[]>(initialNodes);
  const [edges, setEdges] = useState<IEdge[]>(initialEdges);

  return (
    <FlowKit
      nodes={nodes}
      edges={edges}
      nodeTypes={workflowNodeTypes}
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
                <h2 className="section-title">Creating Nodes</h2>
                <CodeBlock code={`import { createWorkflowNode, createWorkflowEdge } from "@flowkit";
import type { INode, IEdge } from "@flowkit";

// createWorkflowNode(type, key, offset, options?)
const trigger: INode = createWorkflowNode(
  "webhook-trigger",
  "t1",
  { x: 60, y: 60 },
  { label: "Incoming Request" }
);

const condition: INode = createWorkflowNode(
  "logic-if-else",
  "c1",
  { x: 300, y: 60 },
  { label: "Status OK?" }
);

const output: INode = createWorkflowNode(
  "result-output",
  "o1",
  { x: 540, y: 60 },
  { label: "Return Response" }
);

// createWorkflowEdge(key, sourceId, targetId, options?)
const edges: IEdge[] = [
  createWorkflowEdge("e1", "t1", "c1"),
  createWorkflowEdge("e2", "c1", "o1", { label: "Yes" }),
  createWorkflowEdge("e3", "c1", "err1", { label: "No" }),
];`} />
            </div>

            <div className="section">
                <h2 className="section-title">Available Node Types</h2>
                <table className="props-table">
                    <thead><tr><th>Type string</th><th>Category</th><th>Description</th></tr></thead>
                    <tbody>
                        {[
                            ['"webhook-trigger"', "Trigger", "Fires when an HTTP request is received."],
                            ['"schedule-trigger"', "Trigger", "Fires on a cron schedule."],
                            ['"manual-trigger"', "Trigger", "Fires when manually invoked."],
                            ['"logic-if-else"', "Logic", "Branches flow based on a condition."],
                            ['"logic-switch"', "Logic", "Routes to one of several branches."],
                            ['"flow-loop"', "Logic", "Iterates over an array."],
                            ['"flow-set-variable"', "Action", "Sets a variable in the workflow context."],
                            ['"http-request"', "Action", "Makes an outbound HTTP request."],
                            ['"result-output"', "Output", "Returns a result from the workflow."],
                            ['"log-output"', "Output", "Logs a message to the execution log."],
                            ['"error-handler"', "Error", "Catches and handles upstream errors."],
                        ].map(([t, c, d]) => (
                            <tr key={t}>
                                <td><span className="prop-name">{t}</span></td>
                                <td><span className="prop-type">{c}</span></td>
                                <td className="prop-desc">{d}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="section">
                <h2 className="section-title">Validation</h2>
                <CodeBlock code={`import { validateWorkflow } from "@flowkit";
import type { INode, IEdge, WorkflowValidationError } from "@flowkit";

function submitWorkflow(nodes: INode[], edges: IEdge[]) {
  const errors: WorkflowValidationError[] = validateWorkflow(nodes, edges);

  if (errors.length > 0) {
    // WorkflowValidationError shape:
    // { nodeKey: string; message: string; severity: "error" | "warning" }
    const errorNodes = new Set(errors.map(e => e.nodeKey));
    setNodes(prev =>
      prev.map(n =>
        errorNodes.has(n.key)
          ? { ...n, data: { ...n.data, invalid: true } }
          : n
      )
    );
    return;
  }

  runWorkflow(nodes, edges);
}`} />
            </div>
        </div>
    );
}
