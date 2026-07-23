import { describe, expect, it } from "vitest";
import { findElementById } from "../functions/domScope";

function makeScope(ids: string[]): ParentNode {
    const elements = ids.map((id) => ({ id }));

    return {
        querySelectorAll: () => elements,
    } as unknown as ParentNode;
}

describe("findElementById", () => {
    it("only searches the supplied FlowKit scope", () => {
        const firstCanvas = makeScope(["shared-node", "first-only"]);
        const secondCanvas = makeScope(["shared-node", "second-only"]);

        expect(findElementById(firstCanvas, "second-only")).toBeNull();
        expect(findElementById(secondCanvas, "second-only")?.id).toBe("second-only");
    });

    it("supports ids containing selector punctuation", () => {
        const scope = makeScope(['rack:"east"[0]']);

        expect(findElementById(scope, 'rack:"east"[0]')?.id).toBe('rack:"east"[0]');
    });

    it("returns null without a mounted scope", () => {
        expect(findElementById(null, "node")).toBeNull();
    });
});
