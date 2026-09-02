import { INode } from "../interfaces/INode";
import { NodeChange } from "../types/NodeChange";

/** Applies node change descriptors while preserving references for unchanged nodes. */
export function applyNodeChanges<T extends INode<any, any>>(
    nodes: T[],
    changes: NodeChange[]
): T[] {
    let result = nodes;

    for (const change of changes) {
        switch (change.type) {
            case "position":
                result = result.map((node) =>
                    node.key === change.key
                        ? { ...node, offset: change.offset }
                        : node
                );
                break;
            case "dimensions":
                result = result.map((node) =>
                    node.key === change.key
                        ? {
                            ...node,
                            style: {
                                ...node.style,
                                width: change.width,
                                height: change.height,
                            },
                        }
                        : node
                );
                break;
            case "add":
                result = [...result, change.node as T];
                break;
            case "remove":
                result = result.filter((node) => node.key !== change.key);
                break;
            case "select":
                // Selection is maintained by FlowKit's selection store rather than node data.
                break;
        }
    }

    return result;
}
