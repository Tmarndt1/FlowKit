import { describe, expect, it } from "vitest";
import { applyContainerChanges } from "../utils/applyContainerChanges";
import type { INodeContainer } from "../interfaces/INodeContainer";

function makeContainer(key: string, nodeKeys: string[] = []): INodeContainer {
    return { key, nodeKeys, position: { x: 0, y: 0 } };
}

describe("applyContainerChanges", () => {
    it("returns the same array reference when changes is empty", () => {
        const containers = [makeContainer("c1")];
        expect(applyContainerChanges(containers, [])).toBe(containers);
    });

    // ── move ──

    it("updates position on a move change", () => {
        const result = applyContainerChanges(
            [makeContainer("c1")],
            [{ type: "move", key: "c1", position: { x: 50, y: 80 } }]
        );
        expect(result[0].position).toEqual({ x: 50, y: 80 });
    });

    it("ignores a move for an unknown key", () => {
        const containers = [makeContainer("c1")];
        const result = applyContainerChanges(containers, [
            { type: "move", key: "missing", position: { x: 10, y: 10 } },
        ]);
        expect(result[0].position).toEqual({ x: 0, y: 0 });
    });

    // ── resize ──

    it("updates position and dimensions on a resize change", () => {
        const result = applyContainerChanges(
            [makeContainer("c1")],
            [{ type: "resize", key: "c1", position: { x: 10, y: 20 }, width: 300, height: 200 }]
        );
        expect(result[0].position).toEqual({ x: 10, y: 20 });
        expect(result[0].style?.width).toBe(300);
        expect(result[0].style?.height).toBe(200);
    });

    it("merges resize style with existing style properties", () => {
        const container: INodeContainer = { ...makeContainer("c1"), style: { opacity: 0.5 } };
        const result = applyContainerChanges(
            [container],
            [{ type: "resize", key: "c1", position: { x: 0, y: 0 }, width: 100, height: 50 }]
        );
        expect(result[0].style?.opacity).toBe(0.5);
        expect(result[0].style?.width).toBe(100);
    });

    // ── membership ──

    it("replaces nodeKeys on a membership change", () => {
        const result = applyContainerChanges(
            [makeContainer("c1", ["n1", "n2"])],
            [{ type: "membership", key: "c1", nodeKeys: ["n3"] }]
        );
        expect(result[0].nodeKeys).toEqual(["n3"]);
    });

    it("preserves rendered bounds supplied with a membership change", () => {
        const result = applyContainerChanges(
            [makeContainer("c1", ["n1"])],
            [{
                type: "membership",
                key: "c1",
                nodeKeys: [],
                position: { x: 30, y: 40 },
                width: 220,
                height: 140,
            }]
        );

        expect(result[0].position).toEqual({ x: 30, y: 40 });
        expect(result[0].style).toMatchObject({ width: 220, height: 140 });
    });

    // ── add ──

    it("appends a new container on an add change", () => {
        const newContainer = makeContainer("c2", ["n1"]);
        const result = applyContainerChanges(
            [makeContainer("c1")],
            [{ type: "add", container: newContainer }]
        );
        expect(result).toHaveLength(2);
        expect(result[1].key).toBe("c2");
    });

    // ── remove ──

    it("removes a container by key", () => {
        const result = applyContainerChanges(
            [makeContainer("c1"), makeContainer("c2")],
            [{ type: "remove", key: "c1" }]
        );
        expect(result).toHaveLength(1);
        expect(result[0].key).toBe("c2");
    });

    it("ignores a remove for an unknown key", () => {
        const containers = [makeContainer("c1")];
        const result = applyContainerChanges(containers, [{ type: "remove", key: "missing" }]);
        expect(result).toHaveLength(1);
    });

    // ── does not mutate ──

    it("never mutates the original containers array", () => {
        const containers = [makeContainer("c1", ["n1"])];
        applyContainerChanges(containers, [{ type: "membership", key: "c1", nodeKeys: ["n2"] }]);
        expect(containers[0].nodeKeys).toEqual(["n1"]);
    });

    // ── multiple changes ──

    it("applies multiple changes in order", () => {
        const result = applyContainerChanges(
            [makeContainer("c1"), makeContainer("c2")],
            [
                { type: "move", key: "c1", position: { x: 10, y: 10 } },
                { type: "remove", key: "c2" },
                { type: "add", container: makeContainer("c3") },
            ]
        );
        expect(result).toHaveLength(2);
        expect(result[0].position).toEqual({ x: 10, y: 10 });
        expect(result[1].key).toBe("c3");
    });
});
