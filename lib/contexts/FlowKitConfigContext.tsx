import * as React from "react";
import { EdgeCollapseMode, EdgePathType, IEdge } from "../interfaces/IEdge";
import { IEndpoint } from "../interfaces/IEndpoint";

/** Arguments passed to canConnect before FlowKit accepts a new connection. */
export interface ICanConnectArgs {
    /** Endpoint where the drag started. */
    source: IEndpoint<any>;
    /** Endpoint currently targeted by the drag/drop. */
    target: IEndpoint<any>;
}

/** Return false to reject a proposed connection. */
export type CanConnect = (args: ICanConnectArgs) => boolean;

/** Emitted when the built-in edge fold control changes an edge collapse state. */
export interface IEdgeCollapsedChangeArgs {
    /** Next collapsed state requested by the control. */
    collapsed: boolean;
    /** Edge whose collapse state changed. */
    edge: IEdge<any>;
    /** Collapse mode selected by the user. */
    mode: EdgeCollapseMode;
}

/** Emitted while hovering collapse menu options so consumers can add previews. */
export interface IEdgeCollapsePreviewChangeArgs {
    /** Edge currently being previewed. */
    edge: IEdge<any>;
    /** Previewed collapse mode, or null when preview should clear. */
    mode: EdgeCollapseMode | null;
}

/** Shared configuration consumed by FlowKit internals and extension components. */
export interface FlowKitConfigContextValue {
    /** Enables animated edge paths by default. Per-edge animated overrides this. */
    animatedEdges?: boolean;
    /** Optional validator for new endpoint connections. */
    canConnect?: CanConnect;
    /** Enables built-in edge collapse controls by default. Per-edge collapsible overrides this. */
    collapsibleEdges?: boolean;
    /** Default edge path algorithm. Per-edge pathType overrides this. */
    edgePathType?: EdgePathType;
    /** Controlled callback for persisting edge collapse state. */
    onEdgeCollapsedChange?: (args: IEdgeCollapsedChangeArgs) => void;
    /** Optional callback fired when collapse menu hover preview changes. */
    onEdgeCollapsePreviewChange?: (args: IEdgeCollapsePreviewChangeArgs) => void;
    /** Disables graph-editing interactions while preserving pan, zoom, and selection. */
    readOnly?: boolean;
}

export const FlowKitConfigContext =
    React.createContext<FlowKitConfigContextValue | null>(null);

/** Reads FlowKit configuration from components rendered inside FlowKit. */
export function useFlowKitConfig(): FlowKitConfigContextValue {
    const context = React.useContext(FlowKitConfigContext);

    if (context == null) {
        throw new Error("useFlowKitConfig must be used inside FlowKit.");
    }

    return context;
}
