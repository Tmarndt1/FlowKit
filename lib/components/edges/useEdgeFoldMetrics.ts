import * as React from "react";

/** Measurements for an SVG path used to place and render fold controls. */
export interface IPathFoldMetrics {
    /** Path midpoint in SVG coordinates. */
    midpoint: {
        x: number;
        y: number;
    };
    /** Full measured path length. */
    length: number;
    /** Half of the measured path length. */
    midpointLength: number;
}

/** Measures a rendered SVG path so fold controls can sit at its midpoint. */
export function useEdgeFoldMetrics(path: string): {
    measurePathRef: React.RefObject<SVGPathElement | null>;
    pathFoldMetrics: IPathFoldMetrics | null;
} {
    const measurePathRef = React.useRef<SVGPathElement>(null);
    const [pathFoldMetrics, setPathFoldMetrics] = React.useState<IPathFoldMetrics | null>(null);

    React.useLayoutEffect(() => {
        const element = measurePathRef.current;

        if (element == null || path.length === 0) {
            setPathFoldMetrics(null);
            return;
        }

        const length = element.getTotalLength();
        const midpointLength = length / 2;
        const midpoint = element.getPointAtLength(length / 2);

        setPathFoldMetrics({
            midpoint: { x: midpoint.x, y: midpoint.y },
            length,
            midpointLength
        });
    }, [path]);

    return { measurePathRef, pathFoldMetrics };
}
