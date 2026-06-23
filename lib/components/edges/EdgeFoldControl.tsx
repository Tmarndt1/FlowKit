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
    portalPosition
}) => {
    const hostRef = React.useRef<HTMLDivElement | null>(null);

    const callbacksRef = React.useRef<{
        onChooseMode: IProps["onChooseMode"];
        onClearPreview: IProps["onClearPreview"];
        onPreviewMode: IProps["onPreviewMode"];
    }>({
        onChooseMode,
        onClearPreview,
        onPreviewMode
    });

    React.useEffect(() => {
        callbacksRef.current = {
            onChooseMode,
            onClearPreview,
            onPreviewMode
        };
    }, [onChooseMode, onClearPreview, onPreviewMode]);

    React.useEffect(() => {
        hostRef.current?.remove();
        hostRef.current = null;

        if (!menuOpen || collapsed || portalPosition == null || typeof document === "undefined") {
            return;
        }

        const host = document.createElement("div");
        const panel = document.createElement("div");

        host.className = "flow-kit-edge-fold-menu";
        host.style.position = "fixed";
        host.style.left = `${portalPosition.x + 16}px`;
        host.style.top = `${portalPosition.y - 74}px`;
        host.style.zIndex = "2147483647";
        host.style.pointerEvents = "auto";

        panel.className = "flow-kit-edge-fold-menu-panel";
        panel.style.pointerEvents = "auto";

        const stopBubble = (event: Event): void => {
            event.stopPropagation();
        };

        panel.addEventListener("pointerdown", stopBubble);
        panel.addEventListener("mousedown", stopBubble);
        panel.addEventListener("mouseup", stopBubble);
        panel.addEventListener("click", stopBubble);

        collapseOptions.forEach((option) => {
            const button = document.createElement("button");

            button.type = "button";
            button.textContent = option.label;
            button.style.pointerEvents = "auto";

            const chooseMode = (event: PointerEvent | MouseEvent): void => {
                event.preventDefault();
                event.stopPropagation();

                callbacksRef.current.onChooseMode(
                    {
                        preventDefault: () => event.preventDefault(),
                        stopPropagation: () => event.stopPropagation()
                    },
                    option.mode
                );
            };

            const previewMode = (): void => {
                callbacksRef.current.onPreviewMode(option.mode);
            };

            const clearPreview = (): void => {
                callbacksRef.current.onClearPreview();
            };

            button.addEventListener("pointerdown", chooseMode);
            button.addEventListener("mousedown", chooseMode);
            button.addEventListener("click", chooseMode);

            button.addEventListener("pointerenter", previewMode);
            button.addEventListener("mouseenter", previewMode);

            button.addEventListener("pointerleave", clearPreview);
            button.addEventListener("mouseleave", clearPreview);

            panel.appendChild(button);
        });

        host.appendChild(panel);
        document.body.appendChild(host);
        hostRef.current = host;

        return () => {
            host.remove();

            if (hostRef.current === host) {
                hostRef.current = null;
            }
        };
    }, [
        collapsed,
        menuOpen,
        portalPosition?.x,
        portalPosition?.y
    ]);

    return (
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
    );
};