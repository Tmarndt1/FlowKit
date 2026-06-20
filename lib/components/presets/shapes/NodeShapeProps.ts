import * as React from "react";

/** Shared props accepted by the built-in node shape components. */
export interface NodeShapeProps {
    /** Content rendered inside the shape. */
    children?: React.ReactNode;
    /** Additional class for the shape element. */
    className?: string;
    /** Whether built-in shape endpoints should be visible. */
    showEndpoints?: boolean;
    /** Inline styles for the shape element. */
    style?: React.CSSProperties;
}
