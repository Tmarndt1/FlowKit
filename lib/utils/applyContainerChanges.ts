import { INodeContainer } from "../interfaces/INodeContainer";
import { ContainerChange } from "../types/ContainerChange";

/** Applies a batch of ContainerChange descriptors to an existing container array, returning a new array. */
export function applyContainerChanges<T extends INodeContainer>(containers: T[], changes: ContainerChange[]): T[] {
    let result = containers;

    for (const change of changes) {
        switch (change.type) {
            case "move":
                result = result.map((c) =>
                    c.key === change.key ? { ...c, position: change.position } : c
                );
                break;
            case "resize":
                result = result.map((c) =>
                    c.key === change.key
                        ? { ...c, position: change.position, style: { ...c.style, width: change.width, height: change.height } }
                        : c
                );
                break;
            case "membership":
                result = result.map((c) =>
                    c.key === change.key
                        ? {
                            ...c,
                            nodeKeys: change.nodeKeys,
                            ...(change.position != null ? { position: change.position } : {}),
                            ...(change.width != null || change.height != null
                                ? {
                                    style: {
                                        ...c.style,
                                        ...(change.width != null ? { width: change.width } : {}),
                                        ...(change.height != null ? { height: change.height } : {}),
                                    },
                                }
                                : {}),
                        }
                        : c
                );
                break;
            case "add":
                result = [...result, change.container as T];
                break;
            case "remove":
                result = result.filter((c) => c.key !== change.key);
                break;
        }
    }

    return result;
}
