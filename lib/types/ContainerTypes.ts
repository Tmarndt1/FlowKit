import React from "react";

/** Map of container.type values to custom React container renderers. */
export declare type ContainerTypes = {
    [key: string]: React.ComponentClass | React.FunctionComponent<any>;
}
