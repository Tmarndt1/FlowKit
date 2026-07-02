import { describe, expect, it } from "vitest";
import {
    avoidObstacles,
    offsetInteriorPoints,
    removeCollinearPoints,
    removeDuplicatePoints,
} from "../functions/edgeRouting";
import type { IOffset } from "../interfaces/IOffset";

function pt(x: number, y: number): IOffset {
    return { x, y };
}

// ─── removeDuplicatePoints ────────────────────────────────────────────────────

describe("removeDuplicatePoints", () => {
    it("returns the same array when there are no duplicates", () => {
        const points = [pt(0, 0), pt(10, 0), pt(10, 20)];
        expect(removeDuplicatePoints(points)).toEqual(points);
    });

    it("removes a consecutive duplicate", () => {
        const result = removeDuplicatePoints([pt(0, 0), pt(10, 0), pt(10, 0), pt(20, 0)]);
        expect(result).toEqual([pt(0, 0), pt(10, 0), pt(20, 0)]);
    });

    it("keeps non-consecutive duplicates", () => {
        const points = [pt(0, 0), pt(10, 0), pt(0, 0)];
        expect(removeDuplicatePoints(points)).toEqual(points);
    });

    it("handles a single point", () => {
        expect(removeDuplicatePoints([pt(5, 5)])).toEqual([pt(5, 5)]);
    });

    it("handles all identical points", () => {
        const result = removeDuplicatePoints([pt(1, 1), pt(1, 1), pt(1, 1)]);
        expect(result).toEqual([pt(1, 1)]);
    });
});

// ─── removeCollinearPoints ────────────────────────────────────────────────────

describe("removeCollinearPoints", () => {
    it("keeps endpoints regardless", () => {
        const points = [pt(0, 0), pt(50, 0), pt(100, 0)];
        const result = removeCollinearPoints(points);
        expect(result).toContainEqual(pt(0, 0));
        expect(result).toContainEqual(pt(100, 0));
    });

    it("removes a collinear middle point on a horizontal line", () => {
        const result = removeCollinearPoints([pt(0, 0), pt(50, 0), pt(100, 0)]);
        expect(result).toEqual([pt(0, 0), pt(100, 0)]);
    });

    it("removes a collinear middle point on a vertical line", () => {
        const result = removeCollinearPoints([pt(0, 0), pt(0, 50), pt(0, 100)]);
        expect(result).toEqual([pt(0, 0), pt(0, 100)]);
    });

    it("preserves a turn point (L-shape)", () => {
        const points = [pt(0, 0), pt(50, 0), pt(50, 100)];
        expect(removeCollinearPoints(points)).toEqual(points);
    });

    it("handles fewer than 3 points unchanged", () => {
        expect(removeCollinearPoints([pt(0, 0), pt(10, 10)])).toEqual([pt(0, 0), pt(10, 10)]);
    });

    it("removes multiple consecutive collinear points", () => {
        const result = removeCollinearPoints([pt(0, 0), pt(25, 0), pt(50, 0), pt(75, 0), pt(100, 0)]);
        expect(result).toEqual([pt(0, 0), pt(100, 0)]);
    });
});

// ─── offsetInteriorPoints ────────────────────────────────────────────────────

describe("offsetInteriorPoints", () => {
    it("returns the original array when amount is 0", () => {
        const points = [pt(0, 0), pt(50, 50), pt(100, 100)];
        expect(offsetInteriorPoints(points, 0)).toBe(points);
    });

    it("returns the original array when fewer than 3 points", () => {
        const points = [pt(0, 0), pt(100, 0)];
        expect(offsetInteriorPoints(points, 10)).toBe(points);
    });

    it("offsets interior y-coordinates for a horizontal route", () => {
        // start.x=0, end.x=100 → horizontal dominates → interior y shifts
        const result = offsetInteriorPoints([pt(0, 0), pt(50, 0), pt(100, 0)], 10);
        expect(result[0]).toEqual(pt(0, 0));
        expect(result[1]).toEqual(pt(50, 10));
        expect(result[2]).toEqual(pt(100, 0));
    });

    it("offsets interior x-coordinates for a vertical route", () => {
        // start.y=0, end.y=100 → vertical dominates → interior x shifts
        const result = offsetInteriorPoints([pt(0, 0), pt(0, 50), pt(0, 100)], 5);
        expect(result[0]).toEqual(pt(0, 0));
        expect(result[1]).toEqual(pt(5, 50));
        expect(result[2]).toEqual(pt(0, 100));
    });

    it("never mutates the input array", () => {
        const points = [pt(0, 0), pt(50, 0), pt(100, 0)];
        const copy = points.map((p) => ({ ...p }));
        offsetInteriorPoints(points, 10);
        expect(points).toEqual(copy);
    });
});

// ─── avoidObstacles ──────────────────────────────────────────────────────────

describe("avoidObstacles", () => {
    it("returns the original path when there are no obstacles", () => {
        const points = [pt(0, 50), pt(200, 50)];
        expect(avoidObstacles(points, [])).toEqual(points);
    });

    it("returns the original path when the obstacle list is empty", () => {
        const points = [pt(0, 0), pt(100, 0)];
        expect(avoidObstacles(points)).toEqual(points);
    });

    it("returns the original path when fewer than 2 points", () => {
        expect(avoidObstacles([pt(0, 0)])).toEqual([pt(0, 0)]);
    });

    it("routes around a blocking obstacle on a horizontal segment", () => {
        // Obstacle sits squarely on the direct horizontal path
        const obstacle = { x: 80, y: 30, width: 60, height: 40 };
        const result = avoidObstacles([pt(0, 50), pt(200, 50)], [obstacle]);
        // Result should not pass through the obstacle's interior
        for (let i = 1; i < result.length; i++) {
            const from = result[i - 1];
            const to = result[i];
            const blocked =
                from.y === to.y &&
                from.y > obstacle.y &&
                from.y < obstacle.y + obstacle.height &&
                Math.min(from.x, to.x) < obstacle.x + obstacle.width &&
                Math.max(from.x, to.x) > obstacle.x;
            expect(blocked).toBe(false);
        }
    });

    it("keeps start and end points unchanged", () => {
        const obstacle = { x: 80, y: 30, width: 60, height: 40 };
        const result = avoidObstacles([pt(0, 50), pt(200, 50)], [obstacle]);
        expect(result[0]).toEqual(pt(0, 50));
        expect(result[result.length - 1]).toEqual(pt(200, 50));
    });
});
