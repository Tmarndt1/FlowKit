import type { CSSProperties } from "react";

/** CSS variables scoped to one canvas or inherited from an application wrapper. */
export type FlowKitTheme = CSSProperties & {
    [variable: `--flow-kit-${string}`]: string | number | undefined;
};

function palette(background: string, surface: string, color: string, muted: string, border: string, accent: string, scheme: "dark" | "light"): FlowKitTheme {
    return {
        colorScheme: scheme,
        "--flow-kit-background": background,
        "--flow-kit-surface": surface,
        "--flow-kit-color": color,
        "--flow-kit-muted-color": muted,
        "--flow-kit-success-color": scheme === "light" ? "#137343" : "#76d89a",
        "--flow-kit-danger-color": scheme === "light" ? "#ba283e" : "#ff7777",
        "--flow-kit-border-color": border,
        "--flow-kit-accent": accent,
        "--flow-kit-grid-color": `color-mix(in srgb, ${muted} 18%, transparent)`,
        "--flow-kit-node-background": surface,
        "--flow-kit-node-color": color,
        "--flow-kit-node-border-color": border,
        "--flow-kit-node-border-color-hover": accent,
        "--flow-kit-node-selected-color": accent,
        "--flow-kit-node-shadow": scheme === "light" ? "0 4px 14px rgba(15, 23, 42, 0.08)" : "0 4px 18px rgba(0, 0, 0, 0.24)",
        "--flow-kit-edge-color": accent,
        "--flow-kit-edge-color-hover": color,
        "--flow-kit-edge-selected-color": color,
        "--flow-kit-edge-arrow-color": accent,
        "--flow-kit-edge-marker-hollow-fill": surface,
        "--flow-kit-edge-label-background": surface,
        "--flow-kit-edge-label-border": border,
        "--flow-kit-edge-label-color": color,
        "--flow-kit-edge-control-background": surface,
        "--flow-kit-edge-control-background-hover": background,
        "--flow-kit-edge-control-border": accent,
        "--flow-kit-edge-control-border-hover": color,
        "--flow-kit-edge-control-color": color,
        "--flow-kit-edge-menu-background": surface,
        "--flow-kit-edge-menu-border": border,
        "--flow-kit-edge-menu-color": color,
        "--flow-kit-edge-menu-color-hover": color,
        "--flow-kit-edge-menu-item-hover": `color-mix(in srgb, ${accent} 15%, transparent)`,
        "--flow-kit-edge-fold-preview-color": accent,
        "--flow-kit-container-background": `color-mix(in srgb, ${accent} 6%, transparent)`,
        "--flow-kit-container-border": `color-mix(in srgb, ${accent} 55%, ${border})`,
        "--flow-kit-container-header-background": surface,
        "--flow-kit-container-color": color,
        "--flow-kit-container-selected-color": accent,
        "--flow-kit-controls-background": surface,
        "--flow-kit-controls-color": color,
        "--flow-kit-controls-hover-background": background,
        "--flow-kit-controls-border": border,
        "--flow-kit-mini-map-background": surface,
        "--flow-kit-mini-map-border": border,
        "--flow-kit-mini-map-node-background": accent,
        "--flow-kit-mini-map-viewport-border": color,
        "--flow-kit-legend-background": surface,
        "--flow-kit-legend-border": border,
        "--flow-kit-legend-color": color,
        "--flow-kit-legend-title-color": color,
        "--flow-kit-legend-label-color": muted,
        "--flow-kit-legend-value-color": color,
        "--flow-kit-legend-marker-color": accent,
        "--flow-kit-shape-bg": surface,
        "--flow-kit-shape-border": border,
        "--flow-kit-shape-selection-border": accent,
        "--flow-kit-shape-shadow": "var(--flow-kit-node-shadow)",
        "--flow-kit-selection-box-background": `color-mix(in srgb, ${accent} 12%, transparent)`,
        "--flow-kit-selection-box-border": accent,
    };
}

/** Built-in palettes. Spread a preset to customize individual CSS variables. */
export const flowKitThemes = {
    dark: palette("#10151f", "#1b2332", "#edf2fa", "#9aaac1", "#35445b", "#8bafff", "dark"),
    light: palette("#f3f6fb", "#ffffff", "#19273e", "#526780", "#cbd5e1", "#375bd2", "light"),
    ocean: palette("#071e2b", "#0e3040", "#def7ff", "#83b6c7", "#28576a", "#39d3df", "dark"),
    forest: palette("#101f19", "#1b3026", "#e7f5e9", "#9dbba7", "#3a5c48", "#8dd7a1", "dark"),
    sunset: palette("#261923", "#3c2734", "#fff0e7", "#d0a6b5", "#704856", "#ffb078", "dark"),
} satisfies Record<string, FlowKitTheme>;

export type FlowKitThemeName = keyof typeof flowKitThemes;
