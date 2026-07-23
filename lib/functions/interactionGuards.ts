/** Returns whether an endpoint may begin a new connection interaction. */
export function canStartEndpointConnection(
    readOnly: boolean | undefined,
    canDrag?: () => boolean
): boolean {
    return readOnly !== true && canDrag?.() !== false;
}
