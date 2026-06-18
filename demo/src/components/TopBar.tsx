type TopBarProps = {
  edgeCount: number;
  lastRunLabel: string;
  nodeCount: number;
  onRun: () => void;
  status: "idle" | "success";
};

export function TopBar({ edgeCount, lastRunLabel, nodeCount, onRun, status }: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="brand-lockup">
        <span className="brand-mark">G</span>
        <strong>NodeFlow</strong>
        <span>Engine</span>
      </div>

      <div className="workflow-title">
        <span>Untitled Workflow</span>
        <button aria-label="Rename workflow" type="button">
          edit
        </button>
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
        <button className="icon-button" aria-label="Grid view" type="button">
          #
        </button>
        <button className="icon-button" aria-label="List view" type="button">
          =
        </button>
        <button className="icon-button" aria-label="Zoom out" type="button">
          -
        </button>
        <span className="zoom-chip">100%</span>
        <button className="icon-button" aria-label="Zoom in" type="button">
          +
        </button>
        <button className="save-button" type="button">
          Save
        </button>
        <button className="icon-button" aria-label="More actions" type="button">
          :
        </button>
      </div>
    </header>
  );
}
