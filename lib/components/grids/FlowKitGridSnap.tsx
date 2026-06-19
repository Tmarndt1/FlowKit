import * as React from "react";
import { useNodeFlowSnapStore } from "../NodeFlowContext";

/** Props for configuring node/container snapping while this component is mounted. */
export interface FlowKitGridSnapProps {
    /** Include containers in snap behavior where supported. */
    containers?: boolean;
    /** Enable snapping. Defaults to true. */
    enabled?: boolean;
    /** Snap interval in canvas units. */
    size?: number;
}

/** Non-visual component that configures drag snapping for nodes and containers. */
export const FlowKitGridSnap: React.FC<FlowKitGridSnapProps> = (props) => {
    const setSnapOptions = useNodeFlowSnapStore((state) => state.setSnapOptions);

    React.useEffect(() => {
        setSnapOptions({
            containers: props.containers ?? false,
            enabled: props.enabled ?? true,
            size: props.size ?? 24,
        });

        return () => {
            setSnapOptions({
                containers: false,
                enabled: false,
                size: 24,
            });
        };
    }, [props.containers, props.enabled, props.size, setSnapOptions]);

    return null;
};
