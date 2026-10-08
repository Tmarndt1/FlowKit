import { describe, expect, it, vi } from "vitest";
import { flowKitThemes } from "../themes";
import type { FlowKitProps } from "../components/FlowKit";

// Inspect the root's theme without mounting browser interaction effects.
vi.mock("react", async (importOriginal) => ({
    ...await importOriginal<typeof import("react")>(),
    useRef: (current: unknown) => ({ current }),
    useState: (initial: unknown) => [initial, vi.fn()],
    useCallback: (callback: unknown) => callback,
    useMemo: (factory: () => unknown) => factory(),
    useEffect: () => {},
    useLayoutEffect: () => {},
    useImperativeHandle: () => {},
}));
import { FlowKit } from "../components/FlowKit";
import { WorkflowNode } from "../components/presets/workflow/WorkflowNode";
import { NetworkNode } from "../components/presets/networking/NetworkNode";

function renderRoot(props: Partial<FlowKitProps>) {
    const result = (FlowKit as any).render({ nodes: [], edges: [], ...props }, null);
    return result.props.children.props.children.props.children;
}

function luminance(hex: string): number {
    const channels = [1, 3, 5].map((offset) => {
        const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

describe("canvas themes", () => {
    it("lets preset renderers apply their own object styles", () => {
        const style = { width: 180, height: 110, background: "purple" };
        const node = { key: "preset", offset: { x: 0, y: 0 }, endpoints: [], style };
        expect(WorkflowNode(node).props.style).toBe(style);
        expect(NetworkNode(node).props.style).toBe(style);
    });

    it("keeps existing CSS defaults when a theme is omitted", () => {
        expect(renderRoot({}).props.style).toEqual({});
    });

    it("applies a named palette to the root while preserving layout styles", () => {
        expect(renderRoot({ theme: "ocean", style: { height: "100%" } }).props.style)
            .toEqual({ ...flowKitThemes.ocean, height: "100%" });
    });

    it("accepts custom variables and lets root style override theme values", () => {
        const theme = { ...flowKitThemes.light, "--flow-kit-edge-color": "purple" };
        const result = renderRoot({ theme, style: { colorScheme: "dark", "--flow-kit-edge-color": "orange" } as any });
        expect(result.props.style["--flow-kit-edge-color"]).toBe("orange");
        expect(result.props.style["--flow-kit-node-background"]).toBe("#ffffff");
        expect(result.props.style.colorScheme).toBe("dark");
        expect(theme["--flow-kit-edge-color"]).toBe("purple");
    });

    it.each(Object.entries(flowKitThemes))("keeps primary and secondary text readable in %s", (_name, theme) => {
        for (const surface of ["--flow-kit-background", "--flow-kit-surface"] as const) {
            for (const text of ["--flow-kit-color", "--flow-kit-muted-color"] as const) {
                const background = luminance(theme[surface] as string);
                const foreground = luminance(theme[text] as string);
                const contrast = (Math.max(background, foreground) + 0.05) / (Math.min(background, foreground) + 0.05);
                expect(contrast).toBeGreaterThanOrEqual(4.5);
            }
        }
    });
});
