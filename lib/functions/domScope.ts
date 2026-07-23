/**
 * Finds an element by id inside one FlowKit root.
 *
 * Native getElementById is document-wide, which makes separate canvases interfere
 * when they contain the same application-level node or endpoint ids.
 */
export function findElementById<T extends HTMLElement = HTMLElement>(
    scope: ParentNode | null | undefined,
    id: string
): T | null {
    if (scope == null) return null;

    const escapedId =
        typeof CSS !== "undefined" && typeof CSS.escape === "function"
            ? CSS.escape(id)
            : null;
    const directMatch = escapedId == null
        ? null
        : scope.querySelector<T>(`#${escapedId}`);

    if (directMatch != null) return directMatch;

    const elements = scope.querySelectorAll<T>("[id]");

    for (const element of elements) {
        if (element.id === id) return element;
    }

    return null;
}

/** Returns the FlowKit root containing an internal rendered element. */
export function getFlowKitRoot(element: Element | null | undefined): HTMLElement | null {
    return element?.closest<HTMLElement>(".flow-kit") ?? null;
}

/** True for controls where graph-level keyboard shortcuts should not run. */
export function isEditableOrInteractiveTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) return false;

    return target.closest("input, textarea, select, button, [contenteditable='true']") != null;
}
