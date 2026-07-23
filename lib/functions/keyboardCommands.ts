export type FlowKitKeyboardCommand = "copy" | "delete" | "paste";

/** Resolves a graph keyboard command from platform modifiers and read-only state. */
export function getFlowKitKeyboardCommand(
    key: string,
    options: {
        copy: boolean;
        deleteSelection: boolean;
        paste: boolean;
        readOnly: boolean;
        ctrlKey: boolean;
        metaKey: boolean;
    }
): FlowKitKeyboardCommand | null {
    const normalizedKey = key.toLocaleLowerCase();
    const modifier = options.ctrlKey || options.metaKey;

    if (normalizedKey === "c" && modifier && options.copy) return "copy";
    if (normalizedKey === "v" && modifier && options.paste && !options.readOnly) return "paste";
    if (normalizedKey === "backspace" && options.deleteSelection && !options.readOnly) return "delete";

    return null;
}
