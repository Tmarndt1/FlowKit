import { describe, expect, it } from "vitest";
import { INode } from "../interfaces/INode";
import { applyNodeChanges } from "../utils/applyNodeChanges";

type TestNode = INode<{ label: string }, never>;

function makeNode(key: string): TestNode {
    return {
        key,
        data: { label: key },
        endpoints: [],
        offset: { x: 0, y: 0 },
    };
}

describe("applyNodeChanges", () => {
    it("updates node positions without changing unaffected node references", () => {
        const first = makeNode("first");
        const second = makeNode("second");
        const result = applyNodeChanges(
            [first, second],
            [{ type: "position", key: "first", offset: { x: 30, y: 50 } }]
        );

        expect(result[0].offset).toEqual({ x: 30, y: 50 });
        expect(result[1]).toBe(second);
    });

    it("persists measured dimensions without discarding existing styles", () => {
        const node = { ...makeNode("node"), style: { opacity: 0.5 } };
        const result = applyNodeChanges(
            [node],
            [{ type: "dimensions", key: "node", width: 240, height: 120 }]
        );

        expect(result[0].style).toMatchObject({ opacity: 0.5, width: 240, height: 120 });
    });

    it("applies add and remove descriptors", () => {
        const result = applyNodeChanges(
            [makeNode("first")],
            [
                { type: "add", node: makeNode("second") },
                { type: "remove", key: "first" },
            ]
        );

        expect(result.map((node) => node.key)).toEqual(["second"]);
    });

    it("leaves node data unchanged for selection descriptors", () => {
        const nodes = [makeNode("node")];

        expect(applyNodeChanges(nodes, [{ type: "select", key: "node", selected: true }])).toBe(nodes);
    });
});
