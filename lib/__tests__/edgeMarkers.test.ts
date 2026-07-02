import { describe, expect, it } from "vitest";
import {
    hasSourceArrow,
    hasTargetArrow,
    resolveMarkerEnd,
    resolveMarkerStart,
} from "../functions/edgeMarkers";
import type { IEdge } from "../interfaces/IEdge";

function makeEdge(partial: Partial<IEdge<unknown>> = {}): IEdge<unknown> {
    return {
        key: "e",
        type: "edge",
        sourceId: "a",
        targetId: "b",
        ...partial,
    };
}

// ─── hasSourceArrow ───────────────────────────────────────────────────────────

describe("hasSourceArrow", () => {
    it('returns false when arrows is undefined', () => {
        expect(hasSourceArrow(makeEdge())).toBe(false);
    });

    it('returns false when arrows is "none"', () => {
        expect(hasSourceArrow(makeEdge({ arrows: "none" }))).toBe(false);
    });

    it('returns false when arrows is "target"', () => {
        expect(hasSourceArrow(makeEdge({ arrows: "target" }))).toBe(false);
    });

    it('returns true when arrows is "source"', () => {
        expect(hasSourceArrow(makeEdge({ arrows: "source" }))).toBe(true);
    });

    it('returns true when arrows is "both"', () => {
        expect(hasSourceArrow(makeEdge({ arrows: "both" }))).toBe(true);
    });

    it('returns true when arrows is { source: true }', () => {
        expect(hasSourceArrow(makeEdge({ arrows: { source: true } }))).toBe(true);
    });

    it('returns false when arrows is { source: false }', () => {
        expect(hasSourceArrow(makeEdge({ arrows: { source: false } }))).toBe(false);
    });

    it('returns false when arrows is { target: true }', () => {
        expect(hasSourceArrow(makeEdge({ arrows: { target: true } }))).toBe(false);
    });
});

// ─── hasTargetArrow ───────────────────────────────────────────────────────────

describe("hasTargetArrow", () => {
    it('returns false when arrows is undefined', () => {
        expect(hasTargetArrow(makeEdge())).toBe(false);
    });

    it('returns false when arrows is "none"', () => {
        expect(hasTargetArrow(makeEdge({ arrows: "none" }))).toBe(false);
    });

    it('returns false when arrows is "source"', () => {
        expect(hasTargetArrow(makeEdge({ arrows: "source" }))).toBe(false);
    });

    it('returns true when arrows is "target"', () => {
        expect(hasTargetArrow(makeEdge({ arrows: "target" }))).toBe(true);
    });

    it('returns true when arrows is "both"', () => {
        expect(hasTargetArrow(makeEdge({ arrows: "both" }))).toBe(true);
    });

    it('returns true when arrows is { target: true }', () => {
        expect(hasTargetArrow(makeEdge({ arrows: { target: true } }))).toBe(true);
    });

    it('returns false when arrows is { target: false }', () => {
        expect(hasTargetArrow(makeEdge({ arrows: { target: false } }))).toBe(false);
    });
});

// ─── resolveMarkerStart ───────────────────────────────────────────────────────

describe("resolveMarkerStart", () => {
    it("returns undefined when no marker or arrows set", () => {
        expect(resolveMarkerStart(makeEdge())).toBeUndefined();
    });

    it("returns the marker URL for an explicit markerStart", () => {
        expect(resolveMarkerStart(makeEdge({ markerStart: "arrow" }))).toBe("url(#flow-kit-marker-arrow)");
        expect(resolveMarkerStart(makeEdge({ markerStart: "filled-diamond" }))).toBe("url(#flow-kit-marker-filled-diamond)");
        expect(resolveMarkerStart(makeEdge({ markerStart: "hollow-diamond" }))).toBe("url(#flow-kit-marker-hollow-diamond)");
        expect(resolveMarkerStart(makeEdge({ markerStart: "hollow-triangle" }))).toBe("url(#flow-kit-marker-hollow-triangle)");
        expect(resolveMarkerStart(makeEdge({ markerStart: "open-arrow" }))).toBe("url(#flow-kit-marker-open-arrow)");
    });

    it('returns undefined when markerStart is "none"', () => {
        expect(resolveMarkerStart(makeEdge({ markerStart: "none" }))).toBeUndefined();
    });

    it('falls back to the legacy arrow marker when arrows is "source"', () => {
        expect(resolveMarkerStart(makeEdge({ arrows: "source" }))).toBe("url(#flow-kit-marker-arrow)");
    });

    it('falls back to the legacy arrow marker when arrows is "both"', () => {
        expect(resolveMarkerStart(makeEdge({ arrows: "both" }))).toBe("url(#flow-kit-marker-arrow)");
    });

    it("explicit markerStart takes precedence over legacy arrows", () => {
        expect(resolveMarkerStart(makeEdge({ arrows: "both", markerStart: "hollow-triangle" }))).toBe(
            "url(#flow-kit-marker-hollow-triangle)"
        );
    });
});

// ─── resolveMarkerEnd ────────────────────────────────────────────────────────

describe("resolveMarkerEnd", () => {
    it("returns undefined when no marker or arrows set", () => {
        expect(resolveMarkerEnd(makeEdge())).toBeUndefined();
    });

    it("returns the marker URL for an explicit markerEnd", () => {
        expect(resolveMarkerEnd(makeEdge({ markerEnd: "arrow" }))).toBe("url(#flow-kit-marker-arrow)");
        expect(resolveMarkerEnd(makeEdge({ markerEnd: "hollow-triangle" }))).toBe("url(#flow-kit-marker-hollow-triangle)");
    });

    it('returns undefined when markerEnd is "none"', () => {
        expect(resolveMarkerEnd(makeEdge({ markerEnd: "none" }))).toBeUndefined();
    });

    it('falls back to the legacy arrow marker when arrows is "target"', () => {
        expect(resolveMarkerEnd(makeEdge({ arrows: "target" }))).toBe("url(#flow-kit-marker-arrow)");
    });

    it("explicit markerEnd takes precedence over legacy arrows", () => {
        expect(resolveMarkerEnd(makeEdge({ arrows: "target", markerEnd: "filled-diamond" }))).toBe(
            "url(#flow-kit-marker-filled-diamond)"
        );
    });
});
