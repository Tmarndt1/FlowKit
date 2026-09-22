import { describe, expect, it } from "vitest";
import { getFlowObjectIdentity, getFlowObjectType } from "../functions/flowObjectIdentity";
import type { IEdge } from "../interfaces/IEdge";
import type { INode } from "../interfaces/INode";
import type { INodeContainer } from "../interfaces/INodeContainer";

const node = (key: string): INode<never, never> => ({
    key,
    endpoints: [],
    offset: { x: 0, y: 0 },
});

const edge = (key: string): IEdge<never> => ({
    key,
    sourceId: "source",
    targetId: "target",
});

const container = (key: string): INodeContainer => ({
    key,
    nodeKeys: [],
});

describe("getFlowObjectIdentity", () => {
    it("is stable when controlled objects are replaced", () => {
        expect(getFlowObjectIdentity(node("selected"))).toBe(getFlowObjectIdentity(node("selected")));
        expect(getFlowObjectIdentity(edge("selected"))).toBe(getFlowObjectIdentity(edge("selected")));
        expect(getFlowObjectIdentity(container("selected"))).toBe(getFlowObjectIdentity(container("selected")));
    });

    it("distinguishes object kinds that share a key", () => {
        expect(getFlowObjectIdentity(node("shared"))).toBe("node:shared");
        expect(getFlowObjectIdentity(edge("shared"))).toBe("edge:shared");
        expect(getFlowObjectIdentity(container("shared"))).toBe("container:shared");
    });

    it("handles an empty selection", () => {
        expect(getFlowObjectIdentity(null)).toBeNull();
    });
});

describe("getFlowObjectType", () => {
    it("identifies nodes, edges, and containers", () => {
        expect(getFlowObjectType(node("node"))).toBe("node");
        expect(getFlowObjectType(edge("edge"))).toBe("edge");
        expect(getFlowObjectType(container("container"))).toBe("container");
    });
});
