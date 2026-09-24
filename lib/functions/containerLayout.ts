import type * as React from "react";
import type { INodeContainer } from "../interfaces/INodeContainer";
import type { INode } from "../interfaces/INode";
import { findElementById } from "./domScope";

interface ContainerBounds {
    x: number;
    y: number;
    width: number;
    height: number;
    contentWidth: number;
    contentHeight: number;
}

export interface ContainerLayout {
    container: INodeContainer;
    bounds: ContainerBounds | null;
}

export function getStyleDimension(value: unknown): number | undefined {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && /^\d+(?:\.\d+)?px$/.test(value.trim())) return parseFloat(value);
    return undefined;
}

/** Resolve geometry from committed bounds so toggles and partial fixed sizes stay stable. */
export function getContainerLayout(
    container: INodeContainer,
    nodes: INode<any, any>[],
    root: HTMLElement | null,
    previous: ContainerLayout | null = null
): ContainerLayout {
    const padding = container.padding ?? 24;
    let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
    for (const node of nodes) {
        if (!container.nodeKeys.includes(node.key)) continue;
        const element = findElementById(root, node.key);
        left = Math.min(left, node.offset.x);
        top = Math.min(top, node.offset.y);
        right = Math.max(right, node.offset.x + (element?.offsetWidth ?? 140));
        bottom = Math.max(bottom, node.offset.y + (element?.offsetHeight ?? 80));
    }
    const hasNodes = Number.isFinite(left);
    const fixed = container.resizeToFit === false;
    const old = previous?.container;
    const saved = previous?.bounds;
    const minWidth = Math.max(80, getStyleDimension(container.style?.minWidth) ?? 0);
    const minHeight = Math.max(44, getStyleDimension(container.style?.minHeight) ?? 0);
    // Unchanged model geometry must not restore stale dimensions when leaving auto-fit.
    const retainPosition = fixed && saved != null && old?.position?.x === container.position?.x &&
        old?.position?.y === container.position?.y;
    const position = retainPosition ? saved : container.position;
    if (!hasNodes && position == null && saved == null) return { container, bounds: null };
    const x = fixed ? position?.x ?? saved?.x ?? left - padding : hasNodes ? left - padding : position?.x ?? saved!.x;
    const y = fixed ? position?.y ?? saved?.y ?? top - padding - 28 : hasNodes ? top - padding - 28 : position?.y ?? saved!.y;
    const contentWidth = Math.max(padding * 2, hasNodes ? right - x + padding : 0);
    const contentHeight = Math.max(padding * 2 + 28, hasNodes ? bottom - y + padding : 0);
    const dimension = (axis: "width" | "height", content: number, fallback: number): number => {
        if (!fixed && hasNodes) return content;
        if (fixed && saved != null && old?.style?.[axis] === container.style?.[axis]) return saved[axis];
        return getStyleDimension(container.style?.[axis]) ?? (hasNodes ? content : saved?.[axis] ?? fallback);
    };
    return {
        container,
        bounds: {
            x, y,
            width: Math.max(minWidth, dimension("width", contentWidth, 160)),
            height: Math.max(minHeight, dimension("height", contentHeight, 120)),
            contentWidth: Math.max(minWidth, contentWidth),
            contentHeight: Math.max(minHeight, contentHeight),
        },
    };
}

export function getContainerStyle(container: INodeContainer, bounds: ContainerBounds): React.CSSProperties {
    return {
        ...container.style,
        width: bounds.width,
        height: bounds.height,
        transform: `translate(${bounds.x}px, ${bounds.y}px)`,
    };
}
