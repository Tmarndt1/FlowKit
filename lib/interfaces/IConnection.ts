/** Minimal connection payload emitted by FlowKitEvents after a valid endpoint drop. */
export interface IConnection {
    /** Source endpoint id. */
    sourceId: string;
    /** Target endpoint id. */
    targetId: string;
}
