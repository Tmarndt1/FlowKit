import { IOffset } from "../interfaces/IOffset";

export interface EdgeRoutingObstacle {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ComputedEdgeRoutingOptions {
    avoidNodes?: boolean;
    obstacles?: EdgeRoutingObstacle[];
    parallelOffset?: number;
}

export function removeDuplicatePoints(points: IOffset[]): IOffset[] {
    return points.filter((point, index) => {
        if (index === 0) return true;

        const previous = points[index - 1];

        return previous.x !== point.x || previous.y !== point.y;
    });
}

export function removeCollinearPoints(points: IOffset[]): IOffset[] {
    return points.filter((point, index) => {
        const previous = points[index - 1];
        const next = points[index + 1];

        if (previous == null || next == null) return true;

        return !(
            (previous.x === point.x && point.x === next.x) ||
            (previous.y === point.y && point.y === next.y)
        );
    });
}

export function offsetInteriorPoints(points: IOffset[], amount = 0): IOffset[] {
    if (amount === 0 || points.length < 3) return points;

    const start = points[0];
    const end = points[points.length - 1];
    const horizontal = Math.abs(end.x - start.x) >= Math.abs(end.y - start.y);

    return points.map((point, index) => {
        if (index === 0 || index === points.length - 1) return point;

        return horizontal
            ? { x: point.x, y: point.y + amount }
            : { x: point.x + amount, y: point.y };
    });
}

function isPointInsideObstacle(point: IOffset, obstacle: EdgeRoutingObstacle): boolean {
    return (
        point.x > obstacle.x &&
        point.x < obstacle.x + obstacle.width &&
        point.y > obstacle.y &&
        point.y < obstacle.y + obstacle.height
    );
}

function horizontalIntersectsRect(from: IOffset, to: IOffset, rect: EdgeRoutingObstacle): boolean {
    if (from.y !== to.y) return false;

    const minX = Math.min(from.x, to.x);
    const maxX = Math.max(from.x, to.x);

    return from.y > rect.y && from.y < rect.y + rect.height && maxX > rect.x && minX < rect.x + rect.width;
}

function verticalIntersectsRect(from: IOffset, to: IOffset, rect: EdgeRoutingObstacle): boolean {
    if (from.x !== to.x) return false;

    const minY = Math.min(from.y, to.y);
    const maxY = Math.max(from.y, to.y);

    return from.x > rect.x && from.x < rect.x + rect.width && maxY > rect.y && minY < rect.y + rect.height;
}

function segmentIntersectsObstacle(from: IOffset, to: IOffset, obstacle: EdgeRoutingObstacle): boolean {
    return horizontalIntersectsRect(from, to, obstacle) || verticalIntersectsRect(from, to, obstacle);
}

function isSegmentClear(from: IOffset, to: IOffset, obstacles: EdgeRoutingObstacle[]): boolean {
    if (from.x !== to.x && from.y !== to.y) return false;

    return !obstacles.some((obstacle) => segmentIntersectsObstacle(from, to, obstacle));
}

function getDirection(from: IOffset, to: IOffset): "horizontal" | "vertical" {
    return from.x === to.x ? "vertical" : "horizontal";
}

function getDistance(from: IOffset, to: IOffset): number {
    return Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
}

function getLaneDeviation(point: IOffset, from: IOffset, to: IOffset): number {
    return Math.abs(to.x - from.x) >= Math.abs(to.y - from.y)
        ? Math.abs(point.y - from.y)
        : Math.abs(point.x - from.x);
}

function buildCandidatePoints(from: IOffset, to: IOffset, obstacles: EdgeRoutingObstacle[]): IOffset[] {
    const laneOffset = 8;
    const xs = new Set<number>([from.x, to.x]);
    const ys = new Set<number>([from.y, to.y]);

    obstacles.forEach((obstacle) => {
        xs.add(obstacle.x - laneOffset);
        xs.add(obstacle.x + obstacle.width + laneOffset);
        ys.add(obstacle.y - laneOffset);
        ys.add(obstacle.y + obstacle.height + laneOffset);
    });

    return Array.from(xs).flatMap((x) =>
        Array.from(ys)
            .map((y) => ({ x, y }))
            .filter((point) => !obstacles.some((obstacle) => isPointInsideObstacle(point, obstacle)))
    );
}

function getBestUnvisited(unvisited: Set<number>, distances: Map<number, number>): number | null {
    let bestIndex: number | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    unvisited.forEach((index) => {
        const distance = distances.get(index) ?? Number.POSITIVE_INFINITY;

        if (distance < bestDistance) {
            bestDistance = distance;
            bestIndex = index;
        }
    });

    return bestIndex;
}

function reconstructPath(points: IOffset[], previous: Map<number, number>, targetIndex: number): IOffset[] {
    const path: IOffset[] = [];
    let currentIndex: number | undefined = targetIndex;

    while (currentIndex != null) {
        path.unshift(points[currentIndex]);
        currentIndex = previous.get(currentIndex);
    }

    return path;
}

function routeSegment(from: IOffset, to: IOffset, obstacles: EdgeRoutingObstacle[]): IOffset[] {
    if (isSegmentClear(from, to, obstacles)) return [from, to];

    const boundaryRoute = routeAroundFirstObstacle(from, to, obstacles);

    if (boundaryRoute != null) return boundaryRoute;

    const horizontalFirst = [{ x: to.x, y: from.y }, to];

    if (
        !obstacles.some((obstacle) => isPointInsideObstacle(horizontalFirst[0], obstacle)) &&
        isSegmentClear(from, horizontalFirst[0], obstacles) &&
        isSegmentClear(horizontalFirst[0], to, obstacles)
    ) {
        return [from, ...horizontalFirst];
    }

    const verticalFirst = [{ x: from.x, y: to.y }, to];

    if (
        !obstacles.some((obstacle) => isPointInsideObstacle(verticalFirst[0], obstacle)) &&
        isSegmentClear(from, verticalFirst[0], obstacles) &&
        isSegmentClear(verticalFirst[0], to, obstacles)
    ) {
        return [from, ...verticalFirst];
    }

    const points = buildCandidatePoints(from, to, obstacles);
    const sourceIndex = points.findIndex((point) => point.x === from.x && point.y === from.y);
    const targetIndex = points.findIndex((point) => point.x === to.x && point.y === to.y);

    if (sourceIndex === -1 || targetIndex === -1) return [from, to];

    const unvisited = new Set(points.map((_, index) => index));
    const distances = new Map<number, number>([[sourceIndex, 0]]);
    const previous = new Map<number, number>();
    const previousDirection = new Map<number, "horizontal" | "vertical">();
    const bendPenalty = 90;
    const laneDeviationPenalty = 0.8;

    while (unvisited.size > 0) {
        const currentIndex = getBestUnvisited(unvisited, distances);

        if (currentIndex == null) break;
        if (currentIndex === targetIndex) break;

        unvisited.delete(currentIndex);

        const current = points[currentIndex];
        const currentDistance = distances.get(currentIndex) ?? Number.POSITIVE_INFINITY;

        points.forEach((candidate, candidateIndex) => {
            if (!unvisited.has(candidateIndex)) return;
            if (current.x !== candidate.x && current.y !== candidate.y) return;
            if (!isSegmentClear(current, candidate, obstacles)) return;

            const direction = getDirection(current, candidate);
            const turnCost = previousDirection.get(currentIndex) != null &&
                previousDirection.get(currentIndex) !== direction
                    ? bendPenalty
                    : 0;
            const deviationCost = (
                getLaneDeviation(current, from, to) +
                getLaneDeviation(candidate, from, to)
            ) * laneDeviationPenalty;
            const nextDistance = currentDistance + getDistance(current, candidate) + turnCost + deviationCost;
            const candidateDistance = distances.get(candidateIndex) ?? Number.POSITIVE_INFINITY;

            if (nextDistance >= candidateDistance) return;

            distances.set(candidateIndex, nextDistance);
            previous.set(candidateIndex, currentIndex);
            previousDirection.set(candidateIndex, direction);
        });
    }

    return previous.has(targetIndex)
        ? reconstructPath(points, previous, targetIndex)
        : [from, to];
}

function getFirstBlockingObstacle(
    from: IOffset,
    to: IOffset,
    obstacles: EdgeRoutingObstacle[]
): EdgeRoutingObstacle | null {
    const blockers = obstacles.filter((obstacle) => segmentIntersectsObstacle(from, to, obstacle));

    if (blockers.length < 1) return null;

    if (from.y === to.y) {
        const direction = to.x >= from.x ? 1 : -1;

        return blockers.sort((a, b) => {
            const aEdge = direction > 0 ? a.x : a.x + a.width;
            const bEdge = direction > 0 ? b.x : b.x + b.width;

            return Math.abs(aEdge - from.x) - Math.abs(bEdge - from.x);
        })[0];
    }

    if (from.x === to.x) {
        const direction = to.y >= from.y ? 1 : -1;

        return blockers.sort((a, b) => {
            const aEdge = direction > 0 ? a.y : a.y + a.height;
            const bEdge = direction > 0 ? b.y : b.y + b.height;

            return Math.abs(aEdge - from.y) - Math.abs(bEdge - from.y);
        })[0];
    }

    return null;
}

function routeAroundFirstObstacle(
    from: IOffset,
    to: IOffset,
    obstacles: EdgeRoutingObstacle[]
): IOffset[] | null {
    const obstacle = getFirstBlockingObstacle(from, to, obstacles);
    const laneOffset = 8;

    if (obstacle == null) return null;

    if (from.y === to.y) {
        const direction = to.x >= from.x ? 1 : -1;
        const beforeX = direction > 0 ? obstacle.x - laneOffset : obstacle.x + obstacle.width + laneOffset;
        const afterX = direction > 0 ? obstacle.x + obstacle.width + laneOffset : obstacle.x - laneOffset;
        const topY = obstacle.y - laneOffset;
        const bottomY = obstacle.y + obstacle.height + laneOffset;
        const laneY = Math.abs(topY - from.y) <= Math.abs(bottomY - from.y) ? topY : bottomY;
        const route = [
            from,
            { x: beforeX, y: from.y },
            { x: beforeX, y: laneY },
            { x: afterX, y: laneY },
            { x: afterX, y: to.y },
            to,
        ];

        return isRouteClear(route, obstacles) ? route : null;
    }

    if (from.x === to.x) {
        const direction = to.y >= from.y ? 1 : -1;
        const beforeY = direction > 0 ? obstacle.y - laneOffset : obstacle.y + obstacle.height + laneOffset;
        const afterY = direction > 0 ? obstacle.y + obstacle.height + laneOffset : obstacle.y - laneOffset;
        const leftX = obstacle.x - laneOffset;
        const rightX = obstacle.x + obstacle.width + laneOffset;
        const laneX = Math.abs(leftX - from.x) <= Math.abs(rightX - from.x) ? leftX : rightX;
        const route = [
            from,
            { x: from.x, y: beforeY },
            { x: laneX, y: beforeY },
            { x: laneX, y: afterY },
            { x: to.x, y: afterY },
            to,
        ];

        return isRouteClear(route, obstacles) ? route : null;
    }

    return null;
}

function isRouteClear(points: IOffset[], obstacles: EdgeRoutingObstacle[]): boolean {
    return points.slice(1).every((point, index) => {
        const previous = points[index];

        return isSegmentClear(previous, point, obstacles);
    });
}

export function avoidObstacles(points: IOffset[], obstacles: EdgeRoutingObstacle[] = []): IOffset[] {
    if (points.length < 2 || obstacles.length < 1) return points;

    const routedPoints = points.slice(1).reduce<IOffset[]>((route, point) => {
        const from = route[route.length - 1];
        const segmentRoute = routeSegment(from, point, obstacles);

        route.push(...segmentRoute.slice(1));

        return route;
    }, [points[0]]);

    return removeCollinearPoints(removeDuplicatePoints(routedPoints));
}
