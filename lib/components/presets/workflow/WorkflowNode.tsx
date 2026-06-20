import * as React from "react";
import { Position } from "../../../enums/Position";
import { Endpoint } from "../../../components/nodes/Endpoint";
import { WorkflowNode as WorkflowNodeType } from "../../../presets/workflow/types";

/** Default renderer for nodes created from the workflow preset definitions. */
export function WorkflowNode(props: WorkflowNodeType & { selected?: boolean }) {
    const data = props.data;
    const inputEndpoints = props.endpoints.filter((endpoint) => endpoint.position === Position.Left);
    const outputEndpoints = props.endpoints.filter((endpoint) => endpoint.position === Position.Right);
    const variantClass = data?.styleVariant == null ? "" : ` workflow-node-${data.styleVariant}`;

    return (
        <div className={`workflow-node workflow-node-${data?.category ?? "utility"}${variantClass}`}>
            <div className="workflow-node-title">
                <span className="workflow-node-icon">{data?.icon}</span>
                <strong>{data?.title ?? props.key}</strong>
            </div>

            {data?.subtitle != null ? <span className="workflow-node-label">{data.subtitle}</span> : null}
            {data?.variableQuery != null ? <span className="workflow-node-query">{data.variableQuery}</span> : null}
            {data?.value != null ? <span className="workflow-node-value">{data.value}</span> : null}
            {data?.valueSource != null ? <span className="workflow-node-source">{data.valueSource}</span> : null}
            {data?.variant != null ? (
                <span className={`workflow-node-badge workflow-node-badge-${data.variant}`}>
                    {data.variant === "success" ? "Success" : "Too Small"}
                </span>
            ) : null}

            {data?.styleVariant === "if-else" || data?.styleVariant === "switch-case" || data?.styleVariant === "threshold-policy" ? (
                <span className="workflow-node-condition-label">
                    {data.styleVariant === "switch-case"
                        ? `${data.switchCases?.length ?? 0} ordered cases`
                        : data.styleVariant === "threshold-policy"
                            ? `${data.thresholdPolicy?.branches.length ?? 0} threshold branches`
                            : "conditional branch"}
                </span>
            ) : null}

            <div className="workflow-node-ports">
                <div>
                    {inputEndpoints.map((endpoint) => (
                        <span key={endpoint.id}>{endpoint.data?.label}</span>
                    ))}
                </div>
                <div>
                    {outputEndpoints.map((endpoint) => (
                        <span key={endpoint.id}>{endpoint.data?.label}</span>
                    ))}
                </div>
            </div>

            {props.endpoints.map((endpoint) => (
                <Endpoint key={endpoint.id} endpoint={endpoint} />
            ))}
        </div>
    );
}
