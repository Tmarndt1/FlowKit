import { WorkflowNodeIcon } from "../../../lib/components/presets/workflow/WorkflowNodeIcon";
import { categoryLabels, groupPresets } from "../workflowModel";
import { WorkflowCategory } from "../types";
import { encodeWorkflowPresetDragPayload, workflowPresetDragType } from "../workflowDrag";

const categoryOrder: WorkflowCategory[] = ["input", "math", "logic", "policy", "utility", "output", "data", "text", "trigger", "flow", "annotation"];
const groupedPresets = groupPresets();

export function NodePalette() {
  return (
    <aside className="node-palette">
      <div className="panel-title">Node Palette</div>
      <label className="search-box">
        <span>Search</span>
        <input aria-label="Search nodes" placeholder="Search nodes..." type="search" />
      </label>

      <div className="palette-groups">
        {categoryOrder.map((category) => (
          <section className="palette-group" key={category}>
            <button className="palette-group-header" type="button">
              <span className={`category-swatch category-swatch-${category}`} />
              {categoryLabels[category]}
              <span className="palette-chevron">v</span>
            </button>
            <div className="palette-list">
              {groupedPresets[category].map((preset) => (
                <button
                  className={`palette-node palette-node-${preset.category}`}
                  draggable
                  key={preset.type}
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "copy";
                    event.dataTransfer.setData(workflowPresetDragType, encodeWorkflowPresetDragPayload(preset.type));
                    event.dataTransfer.setData("text/plain", preset.title);
                  }}
                  type="button"
                >
                  <span className="palette-node-icon">
                    <WorkflowNodeIcon nodeType={preset.type} fallback={preset.icon} />
                  </span>
                  <span>
                    <strong>{preset.title}</strong>
                    <small>{preset.description}</small>
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}
