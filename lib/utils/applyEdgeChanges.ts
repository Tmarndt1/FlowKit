import { IEdge } from "../interfaces/IEdge";
import { EdgeChange } from "../types/EdgeChange";

/** Minimal connection information emitted by FlowKit when an endpoint drag completes. */
export interface EdgeConnection {
    sourceId: string;
    targetId: string;
}

/** Customizes how connect changes become application edge objects. */
export interface ApplyEdgeChangesOptions<T extends IEdge<any>> {
    createEdge?: (connection: EdgeConnection) => T;
}

function createDefaultEdge<T extends IEdge<any>>(connection: EdgeConnection): T {
    return {
        key: `edge-${connection.sourceId}-${connection.targetId}`,
        sourceId: connection.sourceId,
        targetId: connection.targetId,
    } as T;
}

/** Applies edge change descriptors while preserving references for unchanged edges. */
export function applyEdgeChanges<T extends IEdge<any>>(
    edges: T[],
    changes: EdgeChange[],
    options: ApplyEdgeChangesOptions<T> = {}
): T[] {
    let result = edges;

    for (const change of changes) {
        switch (change.type) {
            case "connect": {
                const connection = { sourceId: change.sourceId, targetId: change.targetId };
                const edge = options.createEdge?.(connection) ?? createDefaultEdge<T>(connection);

                result = result.some((current) => current.key === edge.key)
                    ? result
                    : [...result, edge];
                break;
            }
            case "add":
                result = [...result, change.edge as T];
                break;
            case "remove":
                result = result.filter((edge) => edge.key !== change.key);
                break;
            case "select":
                // Selection is maintained by FlowKit's selection store rather than edge data.
                break;
        }
    }

    return result;
}
