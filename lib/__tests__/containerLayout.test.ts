import { describe, expect, it } from "vitest";
import { getContainerLayout, getContainerStyle } from "../functions/containerLayout";
import { applyContainerChanges } from "../utils/applyContainerChanges";
import type { INodeContainer } from "../interfaces/INodeContainer";
import type { INode } from "../interfaces/INode";

const nodes: INode<any, any>[] = [{ key: "n", offset: { x: 200, y: 150 }, endpoints: [], data: {} }];
const container: INodeContainer = {
    key: "c", nodeKeys: ["n"], position: { x: 0, y: 0 }, style: { width: 400, height: 300 },
};

describe("container sizing modes", () => {
    it("fits nodes in both directions despite saved manual dimensions", () => {
        const small = getContainerLayout(container, nodes, null);
        expect(small.bounds).toMatchObject({ x: 176, y: 98, width: 188, height: 156 });
        const large = getContainerLayout({ ...container, nodeKeys: ["n", "n2"] },
            [...nodes, { ...nodes[0], key: "n2", offset: { x: 800, y: 150 } }], null);
        expect(getContainerStyle(container, large.bounds!).width).toBe(788);
        expect(getContainerStyle(container, small.bounds!).width).toBe(188);
    });

    it("preserves the displayed bounds when disabling fit and resumes fit when enabled", () => {
        const auto = getContainerLayout(container, nodes, null);
        const fixedContainer = { ...container, resizeToFit: false };
        const fixed = getContainerLayout(fixedContainer, nodes, null, auto);
        expect(fixed.bounds).toEqual(auto.bounds);
        const movedNodes = [{ ...nodes[0], offset: { x: 500, y: 400 } }];
        const moved = getContainerLayout(fixedContainer, movedNodes, null, fixed);
        expect(moved.bounds).toMatchObject({ x: 176, y: 98, width: 188, height: 156 });
        const enabled = getContainerLayout(container, movedNodes, null, moved);
        expect(enabled.bounds).toMatchObject({ x: 476, y: 348, width: 188, height: 156 });
    });

    it("freezes inferred fixed bounds even when explicit geometry is missing", () => {
        const partial: INodeContainer = { key: "c", nodeKeys: ["n"], resizeToFit: false, style: { width: 400 } };
        const first = getContainerLayout(partial, nodes, null);
        const next = getContainerLayout(partial, [{ ...nodes[0], offset: { x: 600, y: 500 } }], null, first);
        expect(next.bounds).toMatchObject({ x: 176, y: 98, width: 400, height: 156 });
    });

    it("measures resize limits from the fixed origin", () => {
        const fixed = getContainerLayout({ ...container, resizeToFit: false }, nodes, null);
        expect(fixed.bounds).toMatchObject({ contentWidth: 364, contentHeight: 254 });
    });

    it("switches manual resizing to fixed mode and honors the new dimensions", () => {
        const auto = getContainerLayout(container, nodes, null);
        const [resized] = applyContainerChanges([container], [{
            type: "resize", key: "c", position: { x: 176, y: 98 }, width: 500, height: 350,
        }]);
        expect(resized.resizeToFit).toBe(false);
        expect(getContainerLayout(resized, nodes, null, auto).bounds).toMatchObject({ width: 500, height: 350 });
        expect(container.resizeToFit).toBeUndefined();
    });

    it("honors explicit fixed geometry updates and auto-fit minimum dimensions", () => {
        const fixed = getContainerLayout({ ...container, resizeToFit: false }, nodes, null);
        const changed = { ...fixed.container, position: { x: 20, y: 30 }, style: { width: 600, height: 400 } };
        expect(getContainerLayout(changed, nodes, null, fixed).bounds).toMatchObject({ x: 20, y: 30, width: 600, height: 400 });
        expect(getContainerLayout({ ...container, style: { minWidth: 500, minHeight: 400 } }, nodes, null).bounds)
            .toMatchObject({ width: 500, height: 400 });
    });

    it("supports pixel strings and stable empty containers", () => {
        const empty = { ...container, nodeKeys: [], resizeToFit: false, style: { width: "320px", height: "200px" } };
        expect(getContainerLayout(empty, [], null).bounds).toMatchObject({ x: 0, y: 0, width: 320, height: 200 });
        expect(getContainerLayout({ key: "empty", nodeKeys: [] }, [], null).bounds).toBeNull();
    });

    it("keeps fixed geometry through membership changes and measures actual nodes", () => {
        const root = { querySelectorAll: () => [{ id: "n", offsetWidth: 220, offsetHeight: 100 }] } as unknown as HTMLElement;
        const auto = getContainerLayout(container, nodes, root);
        expect(auto.bounds).toMatchObject({ width: 268, height: 176 });
        const fixed = getContainerLayout({ ...container, resizeToFit: false }, nodes, root, auto);
        const empty = getContainerLayout({ ...fixed.container, nodeKeys: [] }, [], root, fixed);
        expect(empty.bounds).toMatchObject({ x: 176, y: 98, width: 268, height: 176 });
        const restored = getContainerLayout(fixed.container, nodes, root, empty);
        expect(restored.bounds).toEqual(fixed.bounds);
    });

    it("retains a manual preview that matches old saved dimensions", () => {
        const auto = getContainerLayout(container, nodes, null);
        const preview = {
            container: { ...container, resizeToFit: false },
            bounds: { ...auto.bounds!, width: 400, height: 300 },
        };
        const [resized] = applyContainerChanges([container], [{
            type: "resize", key: "c", position: { x: 176, y: 98 }, width: 400, height: 300,
        }]);
        expect(getContainerLayout(resized, nodes, null, preview).bounds).toMatchObject({ width: 400, height: 300 });
    });
});
