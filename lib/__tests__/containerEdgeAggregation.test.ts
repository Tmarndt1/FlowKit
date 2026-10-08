import { describe, expect, it, vi } from "vitest";
import { getFoldGraphState } from "../functions/getFoldGraphState";
import { resolveEdgeAnchors } from "../functions/edgeAnchors";
import { getStraight } from "../functions/getStraight";
import { Position } from "../enums/Position";
import type { INode } from "../interfaces/INode";
import type { IEdge } from "../interfaces/IEdge";
import type { ContainerEdgeAggregateArgs } from "../types/ContainerEdgeAggregation";

type Status = "green" | "yellow" | "red";
const nodes: INode<unknown, unknown>[] = ["a1", "a2", "a3", "b1", "b2", "b3"].map((key) => ({
    key, type: "node", offset: { x: 0, y: 0 },
    endpoints: [{ id: `${key}-port`, position: Position.Right, offset: { x: 0, y: 0 } }],
}));
const edges: IEdge<{ status: Status }>[] = (["green", "yellow", "red"] as const).map((status, index) => ({
    key: `e${index}`, sourceId: `a${index + 1}-port`, targetId: `b${index + 1}-port`,
    data: { status }, style: { stroke: status },
}));
const containers = (a = true, b = true) => [
    { key: "A", nodeKeys: ["a1", "a2", "a3"], collapsed: a },
    { key: "B", nodeKeys: ["b1", "b2", "b3"], collapsed: b },
];
const aggregate = { collapsedContainerEdges: "aggregate" as const };

describe("collapsed container edge aggregation", () => {
    it("keeps existing hide behavior by default and restores original edges on expansion", () => {
        expect(getFoldGraphState(nodes, edges, containers(), null).visibleEdges).toEqual([]);
        expect(getFoldGraphState(nodes, edges, containers(false, false), null, aggregate).visibleEdges).toEqual(edges);
    });

    it.each([[true, false], [false, true]])("projects only the collapsed side (%s, %s)", (a, b) => {
        const callback = vi.fn();
        const visible = getFoldGraphState(nodes, edges, containers(a, b), null, {
            ...aggregate, aggregateContainerEdges: callback,
        }).visibleEdges;
        expect(visible).toHaveLength(3);
        expect(callback).not.toHaveBeenCalled();
        expect(visible[0].renderInfo).toEqual({
            source: a ? { kind: "container", key: "A" } : { kind: "endpoint", id: "a1-port" },
            target: b ? { kind: "container", key: "B" } : { kind: "endpoint", id: "b1-port" },
            originalEdgeKeys: ["e0"],
        });
        expect(visible[2].style).toEqual({ stroke: "red" });
        expect(edges.every((edge) => edge.renderInfo == null)).toBe(true);
    });

    it("rolls up worst status, updates when data changes, and keeps stable summary identity", () => {
        const callback = vi.fn(({ edges }: ContainerEdgeAggregateArgs<{ status: Status }>) => {
            const severity = { green: 0, yellow: 1, red: 2 };
            const status = edges.reduce<Status>((worst, edge) =>
                severity[edge.data!.status] > severity[worst] ? edge.data!.status : worst, "green");
            return { data: { status }, style: { stroke: status }, type: "status" };
        });
        const options = { ...aggregate, aggregateContainerEdges: callback };
        const first = getFoldGraphState(nodes, edges, containers(), null, options).visibleEdges;
        expect(first).toHaveLength(1);
        expect(first[0]).toMatchObject({ data: { status: "red" }, style: { stroke: "red" }, collapsible: false, type: "status" });
        expect(first[0].renderInfo?.originalEdgeKeys).toEqual(["e0", "e1", "e2"]);
        expect(callback.mock.calls[0][0].edges[2]).toBe(edges[2]);
        const updated = edges.map((edge) => ({ ...edge, data: { status: "green" as const } }));
        const second = getFoldGraphState(nodes, updated, containers(), null, options).visibleEdges[0];
        expect(second.data.status).toBe("green");
        expect(second.key).toBe(first[0].key);
        expect(getFoldGraphState(nodes, [...edges].reverse(), containers(), null, options).visibleEdges[0].key).toBe(first[0].key);
        expect(edges[2].data?.status).toBe("red");
    });

    it("hides internal edges and keeps opposite directions separate, including singleton summaries", () => {
        const callback = vi.fn(() => ({}));
        const visible = getFoldGraphState(nodes, [
            ...edges,
            { key: "internal", sourceId: "a1-port", targetId: "a2-port" },
            { key: "reverse", sourceId: "b1-port", targetId: "a1-port" },
        ], containers(), null, { ...aggregate, aggregateContainerEdges: callback }).visibleEdges;
        expect(visible).toHaveLength(2);
        expect(visible.map((edge) => edge.renderInfo?.originalEdgeKeys)).toEqual([["e0", "e1", "e2"], ["reverse"]]);
        expect(callback).toHaveBeenCalledTimes(2);
    });

    it.each([[true, false], [false, true]])("preserves a mixture of fixed ports and floating nodes (%s, %s)", (a, b) => {
        const mixed: IEdge<{ status: Status }>[] = [edges[0], {
            ...edges[1], sourceId: "a2", targetId: "b2", anchorMode: "floating",
        }, edges[2]];
        const visible = getFoldGraphState(nodes, mixed, containers(a, b), null, aggregate).visibleEdges;
        expect(visible[0].renderInfo).toEqual({
            source: a ? { kind: "container", key: "A" } : { kind: "endpoint", id: "a1-port" },
            target: b ? { kind: "container", key: "B" } : { kind: "endpoint", id: "b1-port" },
            originalEdgeKeys: ["e0"],
        });
        expect(visible[1].renderInfo).toEqual({
            source: a ? { kind: "container", key: "A" } : { kind: "node", key: "a2" },
            target: b ? { kind: "container", key: "B" } : { kind: "node", key: "b2" },
            originalEdgeKeys: ["e1"],
        });
        expect(getFoldGraphState(nodes, mixed, containers(false, false), null, aggregate).visibleEdges).toEqual(mixed);
        expect(getFoldGraphState(nodes, mixed, containers(), null, aggregate).visibleEdges[0].renderInfo?.originalEdgeKeys).toEqual(["e0", "e1", "e2"]);
    });

    it("respects graph folding and propagates previews to summaries", () => {
        const folded = [...edges, { key: "fold", sourceId: "a2-port", targetId: "a3-port", collapsed: true, collapseMode: "downstream" as const }];
        const visible = getFoldGraphState(nodes, folded, containers(), null, aggregate).visibleEdges;
        expect(visible[0].renderInfo?.originalEdgeKeys).toEqual(["e0", "e1"]);
        const preview = getFoldGraphState(nodes, edges, containers(), { edge: edges[0], mode: "downstream" }, aggregate);
        expect(preview.edgeStateClassNames.get(preview.visibleEdges[0].key)).toBe("flow-kit-edge-fold-preview");
    });

    it("keeps independent endpoint and floating modes when projecting either container", () => {
        const mixed: IEdge<unknown> = {
            key: "mixed", sourceId: "a1-port", targetId: "b2",
            sourceAnchorMode: "endpoint", targetAnchorMode: "floating",
        };
        const a = getFoldGraphState(nodes, [mixed], containers(true, false), null, aggregate).visibleEdges[0];
        expect(a.renderInfo?.target).toEqual({ kind: "node", key: "b2" });
        const b = getFoldGraphState(nodes, [mixed], containers(false, true), null, aggregate).visibleEdges[0];
        expect(b.renderInfo?.source).toEqual({ kind: "endpoint", id: "a1-port" });
    });

    it("avoids summary key collisions with visible application edges", () => {
        const key = getFoldGraphState(nodes, edges, containers(), null, aggregate).visibleEdges[0].key;
        const extraNodes: INode<unknown, unknown>[] = ["x", "y"].map((key) => ({ key, type: "node", offset: { x: 0, y: 0 }, endpoints: [] }));
        const visible = getFoldGraphState([...nodes, ...extraNodes], [...edges, { key, sourceId: "x", targetId: "y", anchorMode: "floating" }], containers(), null, aggregate).visibleEdges;
        expect(new Set(visible.map((edge) => edge.key)).size).toBe(2);
    });
});

describe("projected container anchors", () => {
    const element = (id: string, left: number, top: number, width: number, height: number, dataset = {}) => ({
        id, dataset, getBoundingClientRect: () => ({ left, top, width, height }),
    }) as unknown as HTMLElement;
    it("resolves a fixed source port and a floating target node independently", () => {
        const source = element("source-port", 98, 18, 4, 4, { position: String(Position.Right) });
        const target = element("target-node", 200, 0, 100, 40);
        const root = { querySelectorAll: () => [source, target] } as unknown as HTMLElement;
        expect(resolveEdgeAnchors({
            key: "mixed", sourceId: source.id, targetId: target.id,
            sourceAnchorMode: "endpoint", targetAnchorMode: "floating",
        }, root)).toEqual({
            source: { offset: { x: 98, y: 18 }, position: Position.Right, buffer: 4 },
            target: { offset: { x: 200, y: 20 }, position: Position.Left },
        });
    });
    it("spreads straight floating anchors along borders, clamping to bounds and retaining fixed ports", () => {
        const a = element("", 0, 0, 100, 40, { containerKey: "A" });
        const target = element("b1-port", 200, 18, 4, 4, { position: String(Position.Left) });
        const root = { querySelectorAll: (selector: string) => selector === "[data-container-key]" ? [a] : [target] } as unknown as HTMLElement;
        const edge = getFoldGraphState(nodes, edges, containers(true, false), null, aggregate).visibleEdges[0];
        for (const offset of [-100, -14, 0, 14, 100]) {
            const anchors = resolveEdgeAnchors(edge, root, offset)!;
            expect(anchors.source.offset.x).toBe(100);
            expect(anchors.source.offset.y).toBe(Math.max(0, Math.min(40, 20 + offset)));
            expect(anchors.target).toEqual({ offset: { x: 200, y: 18 }, position: Position.Left, buffer: 4 });
        }
    });
    it("floats the container side while retaining the node endpoint position and buffer", () => {
        const container = element("", 0, 0, 100, 40, { containerKey: "A" });
        const endpoint = element("b1-port", 200, 18, 4, 4, { position: String(Position.Left) });
        const root = { querySelectorAll: (selector: string) => selector === "[data-container-key]" ? [container] : [endpoint] } as unknown as HTMLElement;
        const edge = getFoldGraphState(nodes, edges, containers(true, false), null, aggregate).visibleEdges[0];
        expect(resolveEdgeAnchors(edge, root)).toEqual({
            source: { offset: { x: 100, y: 20 }, position: Position.Right },
            target: { offset: { x: 200, y: 18 }, position: Position.Left, buffer: 4 },
        });
        expect(resolveEdgeAnchors(edge, null)).toBeNull();
    });
    it("resolves container-to-container boundaries separately from colliding node ids", () => {
        const a = element("", 0, 0, 100, 40, { containerKey: "A" });
        const b = element("", 200, 0, 100, 40, { containerKey: "B" });
        const root = { querySelectorAll: (selector: string) => selector === "[data-container-key]" ? [a, b] : [element("A", 999, 999, 1, 1)] } as unknown as HTMLElement;
        const edge = getFoldGraphState(nodes, edges, containers(), null, aggregate).visibleEdges[0];
        expect(resolveEdgeAnchors(edge, root)).toEqual({
            source: { offset: { x: 100, y: 20 }, position: Position.Right },
            target: { offset: { x: 200, y: 20 }, position: Position.Left },
        });
    });

    it.each([-14, 14])("pins parallel straight edges to container borders at zoom (%s)", (parallelOffset) => {
        const a = element("", 50, 100, 200, 80, { containerKey: "A" });
        const b = element("", 450, 300, 200, 80, { containerKey: "B" });
        const root = { querySelectorAll: () => [a, b] } as unknown as HTMLElement;
        const edge = getFoldGraphState(nodes, edges, containers(), null, aggregate).visibleEdges[0];
        const anchors = resolveEdgeAnchors(edge, root)!;
        const path = getStraight({ x: 50, y: 100 }, anchors.source, anchors.target, 2, { parallelOffset })!;
        const points = path.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
        expect(points).toEqual([
            (anchors.source.offset.x - 50) / 2, (anchors.source.offset.y - 100) / 2,
            (anchors.target.offset.x - 50) / 2, (anchors.target.offset.y - 100) / 2,
        ]);
        expect(anchors.source.offset.y).toBe(180);
        expect(anchors.target.offset.y).toBe(300);
    });
});
