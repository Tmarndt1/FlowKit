import React from "react";

/** Map of node.type values to custom React node renderers. */
export declare type NodeTypes = {
    [key: string]: React.ComponentClass | React.FunctionComponent;
}
