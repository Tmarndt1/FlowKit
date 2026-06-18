import * as React from "react";
import { useNodeFlowSnapStore } from "../NodeFlowContext";

interface IProps {
    containers?: boolean;
    enabled?: boolean;
    size?: number;
}

export const FlowKitGridSnap: React.FC<IProps> = (props) => {
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
