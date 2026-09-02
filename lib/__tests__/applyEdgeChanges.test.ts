import { describe, expect, it } from "vitest";
import { IEdge } from "../interfaces/IEdge";
import { applyEdgeChanges } from "../utils/applyEdgeChanges";

type TestEdge = IEdge<{ status: string }>;

function makeEdge(key: string, sourceId = "source", targetId = "target"): TestEdge {
    return { key, sourceId, targetId };
}

describe("applyEdgeChanges", () => {
    it("creates a minimal edge for a connect descriptor", () => {
        const result = applyEdgeChanges<TestEdge>([], [
            { type: "connect", sourceId: "source-port", targetId: "target-port" },
        ]);

        expect(result).toEqual([{
            key: "edge-source-port-target-port",
            sourceId: "source-port",
            targetId: "target-port",
        }]);
    });

    it("uses a custom edge factory for application-specific edges", () => {
        const result = applyEdgeChanges<TestEdge>(
            [],
            [{ type: "connect", sourceId: "a", targetId: "b" }],
            {
                createEdge: ({ sourceId, targetId }) => ({
                    key: "custom-edge",
                    sourceId,
                    targetId,
                    data: { status: "up" },
                }),
            }
        );

        expect(result[0]).toMatchObject({ key: "custom-edge", data: { status: "up" } });
    });

    it("does not append an edge when its generated key already exists", () => {
        const edge = makeEdge("edge-a-b", "a", "b");
        const result = applyEdgeChanges(
            [edge],
            [{ type: "connect", sourceId: "a", targetId: "b" }]
        );

        expect(result).toEqual([edge]);
    });

    it("applies add and remove descriptors", () => {
        const result = applyEdgeChanges(
            [makeEdge("first")],
            [
                { type: "add", edge: makeEdge("second") },
                { type: "remove", key: "first" },
            ]
        );

        expect(result.map((edge) => edge.key)).toEqual(["second"]);
    });

    it("leaves edge data unchanged for selection descriptors", () => {
        const edges = [makeEdge("edge")];

        expect(applyEdgeChanges(edges, [{ type: "select", key: "edge", selected: true }])).toBe(edges);
    });
});
