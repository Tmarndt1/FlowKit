import type { PageId } from ".";

interface Props {
    onNavigate: (id: PageId) => void;
}

const FEATURES = [
    { icon: "⬡", title: "Nodes & Edges", desc: "Fully customizable nodes and typed edges with multiple path styles and arrow configurations.", page: "nodes" as PageId },
    { icon: "▤", title: "Containers", desc: "Group nodes into labeled containers with collapsible regions and drag-to-group support.", page: "containers" as PageId },
    { icon: "◈", title: "Endpoints", desc: "Anchor connection points on nodes with type-safe validation callbacks.", page: "endpoints" as PageId },
    { icon: "⊞", title: "Grid & Snap", desc: "Dot-grid, line-grid, and smart grid-snap for pixel-perfect layouts.", page: "grid" as PageId },
    { icon: "◉", title: "MiniMap", desc: "Scrollable viewport thumbnail with click-to-navigate for large diagrams.", page: "minimap" as PageId },
    { icon: "⌨", title: "Keyboard", desc: "Built-in keyboard shortcut handling for select-all, delete, copy/paste, undo/redo.", page: "keyboard" as PageId },
    { icon: "⇋", title: "Layout Algorithms", desc: "Hierarchical, force-directed, and smart placement utilities built in.", page: "layout-hierarchical" as PageId },
    { icon: "⬡", title: "Network Preset", desc: "Ready-to-use networking diagram nodes: routers, switches, firewalls, servers, and more.", page: "preset-network" as PageId },
    { icon: "◧", title: "Workflow Preset", desc: "Decision trees, triggers, thresholds, logic nodes — wired for flow automation diagrams.", page: "preset-workflow" as PageId },
];

export function Introduction({ onNavigate }: Props) {
    return (
        <div>
            <div className="hero">
                <div className="page-tag">FlowKit</div>
                <h1 className="hero-title">
                    Build <span>node graphs</span><br />
                    for React apps.
                </h1>
                <p className="hero-subtitle">
                    FlowKit is a headless-styled React library for building interactive node-graph canvases —
                    network diagrams, workflow editors, data pipelines, and more.
                </p>
                <div className="hero-actions">
                    <button className="btn btn-primary" onClick={() => onNavigate("getting-started")}>
                        Get Started →
                    </button>
                    <button className="btn btn-ghost" onClick={() => onNavigate("canvas")}>
                        View API
                    </button>
                </div>
            </div>

            <div className="divider" />

            <div style={{ marginBottom: 16, fontSize: 14, color: "var(--text-muted)", fontWeight: 600 }}>
                Explore the API
            </div>

            <div className="feature-grid">
                {FEATURES.map((f) => (
                    <div key={f.title} className="feature-card" onClick={() => onNavigate(f.page)}>
                        <div className="feature-card-icon">{f.icon}</div>
                        <div className="feature-card-title">{f.title}</div>
                        <div className="feature-card-desc">{f.desc}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
