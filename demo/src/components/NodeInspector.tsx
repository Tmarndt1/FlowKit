import * as React from "react";
import { Position } from "../../../lib/enums/Position";
import { WorkflowNodeIcon } from "../../../lib/components/presets/workflow/WorkflowNodeIcon";
import {
  RuntimeVariable,
  ValueType,
  DecisionBranch,
  WorkflowEndpointData,
  WorkflowNode,
  WorkflowNodeData,
} from "../types";

type NodeInspectorProps = {
  node: WorkflowNode | null;
  onDecisionTableBranchesChange: (nodeKey: string, branches: DecisionBranch[]) => void;
  onEndpointChange: (nodeKey: string, endpointId: string, data: Partial<WorkflowEndpointData>) => void;
  onNodeDataChange: (nodeKey: string, data: Partial<WorkflowNodeData>) => void;
  onVariableConfigChange: (nodeKey: string, config: { identifier?: string; name?: string; valueType?: ValueType }) => void;
  onVariableValueChange: (key: string, value: string) => void;
  runtimeVariables: RuntimeVariable[];
};

type InspectorTab = "config" | "inputs" | "outputs" | "info";

const valueTypes: ValueType[] = ["number", "boolean", "text", "any"];

const tabLabels: Record<InspectorTab, string> = {
  config: "Config",
  inputs: "Inputs",
  outputs: "Outputs",
  info: "Info",
};

function getDecisionBranchId(label: string, fallback: number): string {
  const normalized = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized.length > 0 ? normalized : `row-${fallback}`;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="inspector-field">
      <span className="inspector-field-label">{label}</span>
      {children}
      {hint != null ? <span className="inspector-field-hint">{hint}</span> : null}
    </div>
  );
}

export function NodeInspector({
  node,
  onDecisionTableBranchesChange,
  onEndpointChange,
  onNodeDataChange,
  onVariableConfigChange,
  onVariableValueChange,
  runtimeVariables,
}: NodeInspectorProps) {
  const [activeTab, setActiveTab] = React.useState<InspectorTab>("config");
  const data = node?.data;
  const inputs = node?.endpoints.filter((endpoint) => endpoint.position === Position.Left) ?? [];
  const outputs = node?.endpoints.filter((endpoint) => endpoint.position === Position.Right) ?? [];
  const variable = runtimeVariables.find((item) => item.key === data?.variableKey);
  const isDecisionTable = data?.styleVariant === "threshold-policy";
  const decisionBranches = isDecisionTable ? data?.thresholdPolicy?.branches ?? [] : [];
  const category = data?.category ?? "utility";

  React.useEffect(() => {
    setActiveTab("config");
  }, [node?.key]);

  const nodeKey = node?.key;

  const updateNodeData = (patch: Partial<WorkflowNodeData>) => {
    if (nodeKey == null) return;
    onNodeDataChange(nodeKey, patch);
  };

  const updateEndpoint = (endpointId: string, patch: Partial<WorkflowEndpointData>) => {
    if (nodeKey == null) return;
    onEndpointChange(nodeKey, endpointId, patch);
  };

  const updateVariable = (config: { identifier?: string; name?: string; valueType?: ValueType }) => {
    if (nodeKey == null) return;
    onVariableConfigChange(nodeKey, config);
  };

  const updateDecisionBranches = (branches: DecisionBranch[]) => {
    if (nodeKey == null) return;
    onDecisionTableBranchesChange(nodeKey, branches);
  };

  const addDecisionBranch = () => {
    const nextNumber = decisionBranches.length + 1;
    const label = `row ${nextNumber}`;
    const existingIds = new Set(decisionBranches.map((branch) => branch.id));
    let id = getDecisionBranchId(label, nextNumber);
    let suffix = nextNumber;

    while (existingIds.has(id)) {
      suffix += 1;
      id = `row-${suffix}`;
    }

    updateDecisionBranches([...decisionBranches, { id, label, valueType: "any" }]);
  };

  const updateDecisionBranch = (branchId: string, patch: Partial<DecisionBranch>) => {
    updateDecisionBranches(
      decisionBranches.map((branch) => branch.id === branchId ? { ...branch, ...patch } : branch)
    );
  };

  const removeDecisionBranch = (branchId: string) => {
    updateDecisionBranches(decisionBranches.filter((branch) => branch.id !== branchId));
  };

  return (
    <aside className="node-inspector">
      <div className={`inspector-accent inspector-accent-${category}`} />

      <div className="inspector-header">
        <span className="inspector-header-label">Node Inspector</span>
      </div>

      <div className="inspector-summary">
        <span className={`inspector-icon inspector-icon-${category}`}>
          <WorkflowNodeIcon nodeType={node?.type ?? ""} fallback={data?.icon ?? ""} />
        </span>
        <div className="inspector-summary-text">
          <strong>{data?.title ?? "—"}</strong>
          <span className={`inspector-category-badge inspector-badge-${category}`}>{category}</span>
        </div>
        {node?.key != null ? (
          <code className="inspector-node-key">{node.key}</code>
        ) : null}
      </div>

      <div className="inspector-tabs" role="tablist">
        {(["config", "inputs", "outputs", "info"] as InspectorTab[]).map((tab) => (
          <button
            aria-selected={activeTab === tab}
            className={`inspector-tab${activeTab === tab ? " active" : ""}`}
            key={tab}
            onClick={() => setActiveTab(tab)}
            role="tab"
            type="button"
          >
            {tabLabels[tab]}
            {tab === "inputs" && inputs.length > 0 ? <span className="inspector-tab-count">{inputs.length}</span> : null}
            {tab === "outputs" && outputs.length > 0 ? <span className="inspector-tab-count">{outputs.length}</span> : null}
          </button>
        ))}
      </div>

      <div className="inspector-body">
        {activeTab === "config" ? (
          <section className="inspector-section">
            <p className="inspector-section-label">{data?.variableKey != null ? "Variable Config" : "Node Config"}</p>
            <Field label={data?.variableKey != null ? "Name" : "Label"}>
              <input
                className="inspector-input"
                disabled={nodeKey == null}
                onChange={(e) => data?.variableKey != null ? updateVariable({ name: e.target.value }) : updateNodeData({ title: e.target.value })}
                value={data?.title ?? ""}
              />
            </Field>
            {data?.variableKey != null ? (
              <>
                <Field label="Identifier">
                  <input
                    className="inspector-input"
                    disabled={nodeKey == null}
                    onChange={(e) => updateVariable({ identifier: e.target.value })}
                    value={data.variableKey}
                  />
                </Field>
                <Field label="Type">
                  <select
                    className="inspector-input inspector-select"
                    disabled={nodeKey == null}
                    onChange={(e) => updateVariable({ valueType: e.target.value as ValueType })}
                    value={outputs[0]?.data?.valueType ?? variable?.valueType ?? "any"}
                  >
                    {valueTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                </Field>
                <Field label="Execution Query">
                  <input className="inspector-input inspector-input-mono" readOnly value={data.variableQuery ?? ""} />
                </Field>
              </>
            ) : null}
            <Field label="Description">
              <input
                className="inspector-input"
                disabled={nodeKey == null}
                onChange={(e) => updateNodeData({ description: e.target.value })}
                value={data?.description ?? ""}
              />
            </Field>
            <Field label="Category">
              <input className="inspector-input" readOnly value={category} />
            </Field>
            <label className="inspector-toggle-row">
              <span>Enabled</span>
              <div className="inspector-toggle">
                <input checked readOnly type="checkbox" />
                <div className="inspector-toggle-track" />
              </div>
            </label>
          </section>
        ) : null}

        {activeTab === "inputs" ? (
          <section className="inspector-section">
            <p className="inspector-section-label">Input Endpoints</p>
            {inputs.length === 0 ? (
              <p className="inspector-empty">No inputs on this node.</p>
            ) : (
              inputs.map((endpoint, i) => (
                <div className="inspector-endpoint-row" key={endpoint.id}>
                  <span className="inspector-endpoint-index">{i + 1}</span>
                  <div className="inspector-endpoint-fields">
                    <Field label="Label">
                      <input
                        className="inspector-input"
                        onChange={(e) => updateEndpoint(endpoint.id, { label: e.target.value })}
                        value={endpoint.data?.label ?? ""}
                      />
                    </Field>
                    <Field label="Type">
                      <select
                        className="inspector-input inspector-select"
                        onChange={(e) => updateEndpoint(endpoint.id, { valueType: e.target.value as ValueType })}
                        value={endpoint.data?.valueType ?? "any"}
                      >
                        {valueTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </Field>
                  </div>
                </div>
              ))
            )}
          </section>
        ) : null}

        {activeTab === "outputs" ? (
          <section className="inspector-section">
            <div className="inspector-section-title-row">
              <p className="inspector-section-label">{isDecisionTable ? "Decision Rows" : "Output Endpoints"}</p>
              {isDecisionTable ? (
                <button className="inspector-add-btn" disabled={nodeKey == null} onClick={addDecisionBranch} type="button">
                  + Add Row
                </button>
              ) : null}
            </div>
            {outputs.length === 0 ? (
              <p className="inspector-empty">No outputs on this node.</p>
            ) : isDecisionTable ? (
              decisionBranches.map((branch, index) => {
                const endpoint = outputs.find((item) => item.id === `${nodeKey}-threshold-${branch.id}`);
                return (
                  <div className="inspector-decision-row" key={branch.id}>
                    <div className="inspector-decision-row-header">
                      <span className="inspector-decision-row-index">Row {index + 1}</span>
                      {branch.default ? <span className="inspector-default-badge">default</span> : null}
                      <button
                        className="inspector-remove-btn"
                        disabled={decisionBranches.length <= 1}
                        onClick={() => removeDecisionBranch(branch.id)}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="inspector-decision-row-fields">
                      <Field label="Label">
                        <input
                          className="inspector-input"
                          onChange={(e) => updateDecisionBranch(branch.id, { label: e.target.value })}
                          value={branch.label}
                        />
                      </Field>
                      <Field label="Type">
                        <select
                          className="inspector-input inspector-select"
                          onChange={(e) => updateDecisionBranch(branch.id, { valueType: e.target.value as ValueType })}
                          value={branch.valueType ?? endpoint?.data?.valueType ?? "any"}
                        >
                          {valueTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                        </select>
                      </Field>
                      <Field label="Threshold">
                        <input
                          className="inspector-input inspector-input-mono"
                          onChange={(e) => updateDecisionBranch(branch.id, { threshold: e.target.value })}
                          placeholder={branch.default ? "default" : "e.g. 90"}
                          value={branch.threshold ?? ""}
                        />
                      </Field>
                    </div>
                  </div>
                );
              })
            ) : (
              outputs.map((endpoint, i) => (
                <div className="inspector-endpoint-row" key={endpoint.id}>
                  <span className="inspector-endpoint-index">{i + 1}</span>
                  <div className="inspector-endpoint-fields">
                    <Field label="Label">
                      <input
                        className="inspector-input"
                        onChange={(e) => updateEndpoint(endpoint.id, { label: e.target.value })}
                        value={endpoint.data?.label ?? ""}
                      />
                    </Field>
                    <Field label="Type">
                      <select
                        className="inspector-input inspector-select"
                        onChange={(e) => updateEndpoint(endpoint.id, { valueType: e.target.value as ValueType })}
                        value={endpoint.data?.valueType ?? "any"}
                      >
                        {valueTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </Field>
                    {data?.variableKey != null && i === 0 ? (
                      <span className="inspector-field-hint">Changing this type also updates the variable.</span>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </section>
        ) : null}

        {activeTab === "info" ? (
          <>
            {data?.variableKey != null ? (
              <section className="inspector-section">
                <p className="inspector-section-label">Queryable Variable</p>
                <div className="inspector-kv-list">
                  <div className="inspector-kv-row">
                    <span>Identifier</span>
                    <code>{data.variableKey}</code>
                  </div>
                  <div className="inspector-kv-row">
                    <span>Query</span>
                    <code>{data.variableQuery ?? "—"}</code>
                  </div>
                  <div className="inspector-kv-row">
                    <span>Value</span>
                    <code className={data.value != null ? "inspector-kv-resolved" : ""}>{data.value ?? "Not resolved"}</code>
                  </div>
                  <div className="inspector-kv-row">
                    <span>Resolved At</span>
                    <code>{data.resolvedAt ?? "—"}</code>
                  </div>
                </div>
              </section>
            ) : null}

            <section className="inspector-section">
              <p className="inspector-section-label">Execution</p>
              <div className="inspector-status-card">
                <div className={`inspector-status-dot ${data?.resolvedAt != null ? "inspector-status-success" : "inspector-status-idle"}`} />
                <span>{data?.resolvedAt != null ? "Success" : "Idle"}</span>
                <span className="inspector-status-time">{data?.resolvedAt ?? "Not run"}</span>
              </div>
              <div className="inspector-kv-list">
                <div className="inspector-kv-row">
                  <span>Exec Time</span>
                  <code>0.12 ms</code>
                </div>
                <div className="inspector-kv-row">
                  <span>Node Key</span>
                  <code>{node?.key ?? "—"}</code>
                </div>
              </div>
            </section>

            <section className="inspector-section">
              <p className="inspector-section-label">Runtime Variables</p>
              <div className="inspector-runtime-list">
                {runtimeVariables.map((item) => (
                  <div className="inspector-runtime-row" key={item.key}>
                    <div className="inspector-runtime-meta">
                      <code className="inspector-runtime-key">{item.key}</code>
                      <span className="inspector-type-chip">{item.valueType}</span>
                    </div>
                    <input
                      aria-label={`Runtime value for ${item.key}`}
                      className="inspector-input inspector-input-mono"
                      onChange={(e) => onVariableValueChange(item.key, e.target.value)}
                      value={item.value}
                    />
                    <span className="inspector-field-hint">{item.query}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </aside>
  );
}
