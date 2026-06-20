import { EdgePathType } from "../../../lib/index";

export type DemoView = "floating" | "utilization" | "workflow";

type TopBarProps = {
  animatedEdges: boolean;
  collapsibleEdges: boolean;
  demoView: DemoView;
  edgeCount: number;
  edgePathType: EdgePathType;
  lastRunLabel: string;
  nodeCount: number;
  onAnimatedEdgesChange: (animated: boolean) => void;
  onCollapsibleEdgesChange: (enabled: boolean) => void;
  onDemoViewChange: (view: DemoView) => void;
  onEdgePathTypeChange: (pathType: EdgePathType) => void;
  onRun: () => void;
  status: "idle" | "success";
};

export function TopBar({
  animatedEdges,
  collapsibleEdges,
  demoView,
  edgeCount,
  edgePathType,
  lastRunLabel,
  nodeCount,
  onAnimatedEdgesChange,
  onCollapsibleEdgesChange,
  onDemoViewChange,
  onEdgePathTypeChange,
  onRun,
  status,
}: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="brand-lockup">
        <span className="brand-mark">G</span>
        <strong>FlowKit</strong>
        <span>Engine</span>
      </div>

      <div className="workflow-title">
        <span>Untitled Workflow</span>
        <button aria-label="Rename workflow" type="button">
          edit
        </button>
        <div className="demo-view-toggle" aria-label="Demo view">
          <button
            aria-pressed={demoView === "workflow"}
            className={demoView === "workflow" ? "active" : undefined}
            onClick={() => onDemoViewChange("workflow")}
            type="button"
          >
            Standard
          </button>
          <button
            aria-pressed={demoView === "floating"}
            className={demoView === "floating" ? "active" : undefined}
            onClick={() => onDemoViewChange("floating")}
            type="button"
          >
            Floating
          </button>
          <button
            aria-pressed={demoView === "utilization"}
            className={demoView === "utilization" ? "active" : undefined}
            onClick={() => onDemoViewChange("utilization")}
            type="button"
          >
            Utilization
          </button>
        </div>
      </div>

      <div className="run-controls" aria-label="Execution controls">
        <button className="button button-green" onClick={onRun} type="button">
          Run
        </button>
        <button className="button" type="button">
          Step
        </button>
        <button className="button" type="button">
          Stop
        </button>
        <span className={`idle-dot idle-dot-${status}`} />
        <span className="idle-text">{status === "success" ? `Resolved ${lastRunLabel}` : "Idle"}</span>
      </div>

      <div className="view-controls">
        <span>{nodeCount} nodes</span>
        <span>{edgeCount} edges</span>
        <button
          aria-pressed={animatedEdges}
          className={`edge-animation-toggle${animatedEdges ? " active" : ""}`}
          onClick={() => onAnimatedEdgesChange(!animatedEdges)}
          type="button"
        >
          Flow
        </button>
        <button
          aria-pressed={collapsibleEdges}
          className={`edge-animation-toggle edge-fold-toggle${collapsibleEdges ? " active" : ""}`}
          onClick={() => onCollapsibleEdgesChange(!collapsibleEdges)}
          type="button"
        >
          Fold
        </button>
        <div className="edge-path-toggle" aria-label="Edge path style">
          <button
            aria-pressed={edgePathType === "bezier"}
            className={edgePathType === "bezier" ? "active" : undefined}
            onClick={() => onEdgePathTypeChange("bezier")}
            type="button"
          >
            Bezier
          </button>
          <button
            aria-pressed={edgePathType === "smooth-step"}
            className={edgePathType === "smooth-step" ? "active" : undefined}
            onClick={() => onEdgePathTypeChange("smooth-step")}
            type="button"
          >
            Smooth
          </button>
          <button
            aria-pressed={edgePathType === "straight"}
            className={edgePathType === "straight" ? "active" : undefined}
            onClick={() => onEdgePathTypeChange("straight")}
            type="button"
          >
            Line
          </button>
        </div>
      </div>
    </header>
  );
}
