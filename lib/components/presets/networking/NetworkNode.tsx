import * as React from "react";
import { Endpoint } from "../../nodes/Endpoint";
import { NetworkNode as NetworkNodeType } from "../../../presets/networking/types";
import { NetworkNodeIcon } from "./NetworkNodeIcon";

const statusColors: Record<string, string> = {
    online: "#3aaa5c",
    offline: "#ff4d4d",
    warning: "#f5a623",
    unknown: "#4a5e76",
};

/** Default renderer for nodes created from the networking preset definitions. */
export function NetworkNode(props: NetworkNodeType & { selected?: boolean }) {
    const data = props.data;
    const category = data?.category ?? "infrastructure";
    const status = data?.status ?? "unknown";

    return (
        <div className={`network-node network-node-${category}`}>
            <div className="network-node-icon">
                <NetworkNodeIcon nodeType={props.type} />
            </div>

            <div className="network-node-label">{data?.hostname ?? data?.label}</div>

            {data?.ip != null ? (
                <div className="network-node-ip">{data.ip}</div>
            ) : null}

            <div
                className="network-node-status"
                style={{ background: statusColors[status] }}
                title={status}
            />

            {props.endpoints.map((endpoint) => (
                <Endpoint key={endpoint.id} endpoint={endpoint} />
            ))}
        </div>
    );
}
