import * as React from "react";
import { EdgeCollapseMode } from "../../interfaces/IEdge";
import { IPathFoldMetrics } from "./useEdgeFoldMetrics";

interface IProps {
    collapsed: boolean;
    menuOpen: boolean;
    onChooseMode: (e: React.MouseEvent<HTMLElement, MouseEvent>, mode: EdgeCollapseMode) => void;
    onClearPreview: () => void;
    onKeyDown: (e: React.KeyboardEvent<SVGGElement>) => void;
    onPreviewMode: (mode: EdgeCollapseMode) => void;
    onToggle: (e: React.MouseEvent<SVGGElement, MouseEvent>) => void;
    pathFoldMetrics: IPathFoldMetrics;
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
}) => (
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

        {menuOpen && !collapsed && (
            <foreignObject
                className="flow-kit-edge-fold-menu"
                height={148}
                width={144}
                x={pathFoldMetrics.midpoint.x + 16}
                y={pathFoldMetrics.midpoint.y - 74}
            >
                <div className="flow-kit-edge-fold-menu-panel">
                    {collapseOptions.map((option) => (
                        <button
                            key={option.mode}
                            onClick={(e) => onChooseMode(e, option.mode)}
                            onMouseEnter={() => onPreviewMode(option.mode)}
                            onMouseLeave={onClearPreview}
                            onMouseMove={() => onPreviewMode(option.mode)}
                            onPointerEnter={() => onPreviewMode(option.mode)}
                            onPointerLeave={onClearPreview}
                            onPointerMove={() => onPreviewMode(option.mode)}
                            type="button"
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </foreignObject>
        )}
    </>
);
