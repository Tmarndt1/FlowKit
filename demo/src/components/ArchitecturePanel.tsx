const architectureSteps = [
  {
    color: "blue",
    title: "1. Visual Editor",
    tag: "FlowKit",
    items: ["Drag & Drop Nodes", "Connect Endpoints", "Group / Container", "Validate Connections", "Save / Load Graph"],
    icon: "[]",
  },
  {
    color: "cyan",
    title: "2. Graph Model",
    items: ["Nodes", "Edges", "Ports (typed)", "Positions", "Metadata"],
    icon: "/\\",
  },
  {
    color: "violet",
    title: "3. Validation Engine",
    items: ["Type Compatibility", "Connection Rules", "Cycle Detection", "Required Inputs", "Graph Integrity"],
    icon: "V",
  },
  {
    color: "yellow",
    title: "4. Execution Engine",
    items: ["Topological Sort", "Resolve Inputs", "Execute Nodes", "Store Results", "Handle Errors"],
    icon: "*",
  },
  {
    color: "green",
    title: "5. State & Results",
    items: ["Node States", "Output Values", "Errors", "Execution Time", "History"],
    icon: "DB",
  },
  {
    color: "red",
    title: "6. UI Feedback",
    items: ["Node Status", "Result Preview", "Logs", "Debug Info", "Highlight Paths"],
    icon: "~",
  },
];

export function ArchitecturePanel() {
  return (
    <section className="architecture-panel">
      <h2>Engine Architecture</h2>
      <div className="architecture-flow">
        {architectureSteps.map((step, index) => (
          <article className={`architecture-card architecture-card-${step.color}`} key={step.title}>
            <div>
              <h3>
                {step.title} {step.tag != null ? <span>({step.tag})</span> : null}
              </h3>
              <ul>
                {step.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <span className="architecture-icon">{step.icon}</span>
            {index < architectureSteps.length - 1 ? <span className="architecture-arrow">{"->"}</span> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
