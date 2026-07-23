import * as React from "react";
import { Position } from "../../../enums/Position";
import { Endpoint } from "../../../components/nodes/Endpoint";
import { WorkflowNode as WorkflowNodeType } from "../../../presets/workflow/types";
import { WorkflowNodeIcon } from "./WorkflowNodeIcon";

/** Default renderer for nodes created from the workflow preset definitions. */
export function WorkflowNode(props: WorkflowNodeType & { selected?: boolean }) {
    const data = props.data;
    const inputEndpoints = props.endpoints.filter((endpoint) => endpoint.position === Position.Left);
    const outputEndpoints = props.endpoints.filter((endpoint) => endpoint.position === Position.Right);
    const variantClass = data?.styleVariant == null ? "" : ` workflow-node-${data.styleVariant}`;
    const outputVariant = data?.category === "output" ? data.variant : undefined;
    const [tooltipVisible, setTooltipVisible] = React.useState(false);
    const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const onMouseEnter = (): void => {
        timerRef.current = setTimeout(() => setTooltipVisible(true), 600);
    };

    const onMouseLeave = (): void => {
        if (timerRef.current != null) clearTimeout(timerRef.current);
        setTooltipVisible(false);
    };

    if (data?.styleVariant === "annotation") {
        return (
            <div className="workflow-node workflow-node-annotation">
                <div className="workflow-node-annotation-content">
                    {data.content ?? data.title}
                </div>
            </div>
        );
    }

    return (
        <div
            className={`workflow-node workflow-node-${data?.category ?? "utility"}${variantClass}`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {tooltipVisible && data?.description != null ? (
                <div className="workflow-node-tooltip">{data.description}</div>
            ) : null}
            <div className="workflow-node-title">
                <span className="workflow-node-icon">
                    <WorkflowNodeIcon nodeType={props.type ?? ""} fallback={data?.icon ?? ""} />
                </span>
                <strong>{data?.title ?? props.key}</strong>
            </div>

            {data?.subtitle != null ? <span className="workflow-node-label">{data.subtitle}</span> : null}
            {data?.variableQuery != null ? <span className="workflow-node-query">{data.variableQuery}</span> : null}
            {data?.value != null ? <span className="workflow-node-value">{data.value}</span> : null}
            {data?.valueSource != null ? <span className="workflow-node-source">{data.valueSource}</span> : null}
            {outputVariant != null ? (
                <span className={`workflow-node-badge workflow-node-badge-${outputVariant}`}>
                    {outputVariant === "success" ? "Success" : "Too Small"}
                </span>
            ) : null}

            {data?.styleVariant === "if-else" || data?.styleVariant === "switch-case" || data?.styleVariant === "threshold-policy" ? (
                <span className="workflow-node-condition-label">
                    {data.styleVariant === "switch-case"
                        ? `${data.switchCases?.length ?? 0} ordered cases`
                        : data.styleVariant === "threshold-policy"
                            ? `${data.thresholdPolicy?.branches.length ?? 0} decision rows`
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
