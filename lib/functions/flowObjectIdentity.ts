import { FlowObject, FlowObjectType } from "../types/FlowObject";

/** Returns the selectable object's kind. */
export function getFlowObjectType(object: FlowObject): FlowObjectType {
    if ("nodeKeys" in object) return "container";
    if ("sourceId" in object && "targetId" in object) return "edge";

    return "node";
}

/** Returns a stable identity for a selectable object across controlled-state updates. */
export function getFlowObjectIdentity(object: FlowObject | null): string | null {
    if (object == null) return null;
    return `${getFlowObjectType(object)}:${object.key}`;
}
