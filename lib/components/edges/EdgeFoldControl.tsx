import * as React from "react";
import { EdgeCollapseMode } from "../../interfaces/IEdge";
import { IPathFoldMetrics } from "./useEdgeFoldMetrics";

type FoldMenuActionEvent = {
    preventDefault: () => void;
    stopPropagation: () => void;
};

interface IProps {
    collapsed: boolean;
    menuOpen: boolean;
    onChooseMode: (e: FoldMenuActionEvent, mode: EdgeCollapseMode) => void;
    onClearPreview: () => void;
    onKeyDown: (e: React.KeyboardEvent<SVGGElement>) => void;
    onPreviewMode: (mode: EdgeCollapseMode) => void;
    onToggle: (e: React.MouseEvent<SVGGElement, MouseEvent>) => void;
    pathFoldMetrics: IPathFoldMetrics;
    portalPosition: { x: number; y: number } | null;
}

const collapseOptions: { label: string; mode: EdgeCollapseMode }[] = [
    { label: "Connection", mode: "edge" },
    { label: "Downstream", mode: "downstream" },
    { label: "Upstream", mode: "upstream" },
    { label: "Both sides", mode: "both" }
];

export const EdgeFoldControl: React.FC<IProps> = ({
    collapsed,
    menuOpen,
    onChooseMode,
    onClearPreview,
    onKeyDown,
    onPreviewMode,
    onToggle,
    pathFoldMetrics,
    portalPosition,
}) => {
    const hostRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        if (!menuOpen || collapsed || portalPosition == null || typeof document === "undefined") {
            hostRef.current?.remove();
            hostRef.current = null;
            return;
        }

        const host = document.createElement("div");
        const panel = document.createElement("div");

        host.className = "flow-kit-edge-fold-menu";
        host.style.left = `${portalPosition.x + 16}px`;
        host.style.top = `${portalPosition.y - 74}px`;
        panel.className = "flow-kit-edge-fold-menu-panel";

        collapseOptions.forEach((option) => {
            const button = document.createElement("button");

            button.type = "button";
            button.textContent = option.label;
            button.addEventListener("click", (event) => onChooseMode(event, option.mode));
            button.addEventListener("mouseenter", () => onPreviewMode(option.mode));
            button.addEventListener("mouseleave", onClearPreview);
            button.addEventListener("mousemove", () => onPreviewMode(option.mode));
            button.addEventListener("pointerenter", () => onPreviewMode(option.mode));
            button.addEventListener("pointerleave", onClearPreview);
            button.addEventListener("pointermove", () => onPreviewMode(option.mode));
            panel.appendChild(button);
        });

        host.appendChild(panel);
        document.body.appendChild(host);
        hostRef.current = host;

        return () => {
            host.remove();
            if (hostRef.current === host) hostRef.current = null;
        };
    }, [
        collapsed,
        menuOpen,
        onChooseMode,
        onClearPreview,
        onPreviewMode,
        portalPosition
    ]);

    return (
        <>
        <g
            aria-label={collapsed ? "Expand edge" : "Collapse edge"}
            className={`flow-kit-edge-fold-control${collapsed ? " flow-kit-edge-fold-control-folded" : ""}${menuOpen ? " flow-kit-edge-fold-control-open" : ""}`}
            onClick={onToggle}
            onKeyDown={onKeyDown}
            role="button"
            tabIndex={0}
            transform={`translate(${pathFoldMetrics.midpoint.x} ${pathFoldMetrics.midpoint.y})`}
        >
            <circle r={12} />
            <path d={collapsed ? "M -5 0 L 5 0 M 0 -5 L 0 5" : "M -5 0 L 5 0"} />
        </g>
        </>
    );
};
