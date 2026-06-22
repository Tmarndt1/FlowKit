import * as React from "react";
import { Position } from "../../../lib/enums/Position";
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

function getDecisionBranchId(label: string, fallback: number): string {
  const normalized = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized.length > 0 ? normalized : `row-${fallback}`;
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

    updateDecisionBranches([
      ...decisionBranches,
      {
        id,
        label,
        valueType: "any",
      },
    ]);
  };

  const updateDecisionBranch = (branchId: string, patch: Partial<DecisionBranch>) => {
    updateDecisionBranches(
      decisionBranches.map((branch) =>
        branch.id === branchId
          ? {
              ...branch,
              ...patch,
            }
          : branch
      )
    );
  };

  const removeDecisionBranch = (branchId: string) => {
    updateDecisionBranches(decisionBranches.filter((branch) => branch.id !== branchId));
  };

  return (
    <aside className="node-inspector">
      <div className="inspector-header">
        <span>Node Inspector</span>
        <button aria-label="Close inspector" type="button">
          x
        </button>
      </div>

      <div className="selected-node-summary">
        <span className={`inspector-icon inspector-icon-${data?.category ?? "math"}`}>
          {data?.icon ?? "x"}
        </span>
        <div>
          <strong>{data?.title ?? "Multiply"}</strong>
          <small>{data?.variableKey ?? `${data?.category ?? "math"}.${(data?.title ?? "multiply").toLowerCase()}`}</small>
        </div>
      </div>

      <div className="inspector-tabs" role="tablist">
        {(["config", "inputs", "outputs", "info"] as InspectorTab[]).map((tab) => (
          <button
            className={activeTab === tab ? "active" : ""}
            key={tab}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "config" ? (
        <section className="inspector-section">
          <h2>{data?.variableKey != null ? "Variable Config" : "Node Config"}</h2>
          <label className="field">
            <span>{data?.variableKey != null ? "Name" : "Label"}</span>
            <input
              disabled={nodeKey == null}
              onChange={(event) =>
                data?.variableKey != null
                  ? updateVariable({ name: event.target.value })
                  : updateNodeData({ title: event.target.value })
              }
              value={data?.title ?? ""}
            />
          </label>
          {data?.variableKey != null ? (
            <>
              <label className="field">
                <span>Identifier</span>
                <input
                  disabled={nodeKey == null}
                  onChange={(event) => updateVariable({ identifier: event.target.value })}
                  value={data.variableKey}
                />
              </label>
              <label className="field">
                <span>Type</span>
                <select
                  disabled={nodeKey == null}
                  onChange={(event) => updateVariable({ valueType: event.target.value as ValueType })}
                  value={outputs[0]?.data?.valueType ?? variable?.valueType ?? "any"}
                >
                  {valueTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Execution Query</span>
                <input readOnly value={data.variableQuery ?? ""} />
              </label>
            </>
          ) : null}
          <label className="field">
            <span>Description</span>
            <input
              disabled={nodeKey == null}
              onChange={(event) => updateNodeData({ description: event.target.value })}
              value={data?.description ?? ""}
            />
          </label>
          <label className="field">
            <span>Category</span>
            <input readOnly value={data?.category ?? ""} />
          </label>
          <label className="checkbox-row">
            <input checked readOnly type="checkbox" />
            <span>Enabled</span>
          </label>
        </section>
      ) : null}

      {activeTab === "inputs" ? (
        <section className="inspector-section">
          <h2>Inputs</h2>
          {inputs.length === 0 ? <p className="empty-state">This node has no inputs.</p> : null}
          {inputs.map((endpoint) => (
            <label className="field" key={endpoint.id}>
              <span>Input</span>
              <input
                onChange={(event) => updateEndpoint(endpoint.id, { label: event.target.value })}
                value={endpoint.data?.label ?? ""}
              />
              <select
                onChange={(event) => updateEndpoint(endpoint.id, { valueType: event.target.value as ValueType })}
                value={endpoint.data?.valueType ?? "any"}
              >
                {valueTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </section>
      ) : null}

      {activeTab === "outputs" ? (
        <section className="inspector-section">
          <div className="inspector-section-title-row">
            <h2>{isDecisionTable ? "Decision Rows" : "Outputs"}</h2>
            {isDecisionTable ? (
              <button disabled={nodeKey == null} onClick={addDecisionBranch} type="button">
                Add endpoint
              </button>
            ) : null}
          </div>
          {outputs.length === 0 ? <p className="empty-state">This node has no outputs.</p> : null}
          {isDecisionTable
            ? decisionBranches.map((branch, index) => {
                const endpoint = outputs.find((item) => item.id === `${nodeKey}-threshold-${branch.id}`);

                return (
                  <div className="decision-row-editor" key={branch.id}>
                    <label className="field">
                      <span>Endpoint Label</span>
                      <input
                        onChange={(event) => updateDecisionBranch(branch.id, { label: event.target.value })}
                        value={branch.label}
                      />
                    </label>
                    <label className="field">
                      <span>Type</span>
                      <select
                        onChange={(event) => updateDecisionBranch(branch.id, { valueType: event.target.value as ValueType })}
                        value={branch.valueType ?? endpoint?.data?.valueType ?? "any"}
                      >
                        {valueTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      <span>Rule</span>
                      <input
                        onChange={(event) => updateDecisionBranch(branch.id, { threshold: event.target.value })}
                        placeholder={branch.default ? "default" : "threshold"}
                        value={branch.threshold ?? ""}
                      />
                    </label>
                    <button
                      disabled={decisionBranches.length <= 1}
                      onClick={() => removeDecisionBranch(branch.id)}
                      type="button"
                    >
                      Remove row {index + 1}
                    </button>
                  </div>
                );
              })
            : outputs.map((endpoint) => (
            <label className="field" key={endpoint.id}>
              <span>Output</span>
              <input
                onChange={(event) => updateEndpoint(endpoint.id, { label: event.target.value })}
                value={endpoint.data?.label ?? ""}
              />
              <select
                onChange={(event) => updateEndpoint(endpoint.id, { valueType: event.target.value as ValueType })}
                value={endpoint.data?.valueType ?? "any"}
              >
                {valueTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {data?.variableKey != null && endpoint === outputs[0] ? <small>Changing this also updates the variable type.</small> : null}
            </label>
          ))}
        </section>
      ) : null}

      {activeTab === "info" ? (
        <>
          {data?.variableKey != null ? (
            <section className="inspector-section">
              <h2>Queryable Variable</h2>
              <label className="field">
                <span>Identifier</span>
                <input readOnly value={data.variableKey} />
              </label>
              <label className="field">
                <span>Execution Query</span>
                <input readOnly value={data.variableQuery ?? ""} />
              </label>
              <label className="field">
                <span>Resolved Value</span>
                <input readOnly value={data.value ?? "Not resolved"} />
              </label>
              <label className="field">
                <span>Resolved At</span>
                <input readOnly value={data.resolvedAt ?? "Run workflow to query"} />
              </label>
            </section>
          ) : null}

          <section className="inspector-section runtime-variable-list">
            <h2>Runtime Variables</h2>
            {runtimeVariables.map((item) => (
              <label className="field" key={item.key}>
                <span>
                  {item.key} ({item.valueType})
                </span>
                <input
                  aria-label={`Runtime value for ${item.key}`}
                  onChange={(event) => onVariableValueChange(item.key, event.target.value)}
                  value={item.value}
                />
                <small>{item.query}</small>
              </label>
            ))}
          </section>

          <section className="inspector-section execution-details">
            <h2>Execution</h2>
            <dl>
              <div>
                <dt>Status</dt>
                <dd>{data?.resolvedAt != null ? "Success" : "Idle"}</dd>
              </div>
              <div>
                <dt>Exec Time</dt>
                <dd>0.12 ms</dd>
              </div>
              <div>
                <dt>Last Run</dt>
                <dd>{data?.resolvedAt ?? "Not run"}</dd>
              </div>
            </dl>
          </section>
        </>
      ) : null}
    </aside>
  );
}
