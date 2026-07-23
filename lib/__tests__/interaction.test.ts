import { describe, expect, it } from "vitest";
import { canStartEndpointConnection } from "../functions/interactionGuards";
import { getNodeDragOffset } from "../functions/nodeDrag";
import { getPanToNodeOffset } from "../functions/viewport";
import { getFlowKitKeyboardCommand } from "../functions/keyboardCommands";

describe("endpoint interaction guards", () => {
    it("prevents connections in read-only mode", () => {
        expect(canStartEndpointConnection(true)).toBe(false);
        expect(canStartEndpointConnection(true, () => true)).toBe(false);
    });

    it("honors an endpoint canDrag callback", () => {
        expect(canStartEndpointConnection(false, () => false)).toBe(false);
        expect(canStartEndpointConnection(false, () => true)).toBe(true);
    });
});

describe("node drag calculations", () => {
    it("returns a new offset without mutating the controlled start value", () => {
        const start = Object.freeze({ x: 10, y: 20 });

        expect(getNodeDragOffset(start, { x: 17, y: -6 })).toEqual({ x: 27, y: 14 });
        expect(start).toEqual({ x: 10, y: 20 });
    });

    it("snaps the preview without changing its input", () => {
        const start = Object.freeze({ x: 3, y: 7 });

        expect(
            getNodeDragOffset(start, { x: 14, y: 20 }, { enabled: true, size: 10 })
        ).toEqual({ x: 20, y: 30 });
        expect(start).toEqual({ x: 3, y: 7 });
    });
});

describe("pan-to-node calculations", () => {
    it("centers using unscaled node dimensions at a non-unit scale", () => {
        expect(
            getPanToNodeOffset(
                { width: 1000, height: 600 },
                { x: 200, y: 100 },
                { width: 120, height: 80 },
                0.5
            )
        ).toEqual({ x: 370, y: 230 });
    });
});

describe("keyboard commands", () => {
    const defaults = {
        copy: true,
        deleteSelection: true,
        paste: true,
        readOnly: false,
        ctrlKey: false,
        metaKey: false,
    };

    it("supports Command shortcuts on macOS", () => {
        expect(
            getFlowKitKeyboardCommand("c", { ...defaults, metaKey: true })
        ).toBe("copy");
        expect(
            getFlowKitKeyboardCommand("v", { ...defaults, metaKey: true })
        ).toBe("paste");
    });

    it("blocks mutating commands in read-only mode", () => {
        expect(
            getFlowKitKeyboardCommand("v", {
                ...defaults,
                ctrlKey: true,
                readOnly: true,
            })
        ).toBeNull();
        expect(
            getFlowKitKeyboardCommand("Backspace", { ...defaults, readOnly: true })
        ).toBeNull();
    });
});
