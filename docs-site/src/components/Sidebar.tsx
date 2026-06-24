import type { PageId } from "../pages";

interface NavItem {
    id: PageId;
    label: string;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

const NAV: NavSection[] = [
    {
        title: "Overview",
        items: [
            { id: "introduction", label: "Introduction" },
            { id: "getting-started", label: "Getting Started" },
        ],
    },
    {
        title: "Core",
        items: [
            { id: "canvas", label: "Canvas" },
            { id: "nodes", label: "Nodes" },
            { id: "edges", label: "Edges" },
            { id: "containers", label: "Containers" },
            { id: "endpoints", label: "Endpoints" },
        ],
    },
    {
        title: "Components",
        items: [
            { id: "controls", label: "Controls" },
            { id: "minimap", label: "MiniMap" },
            { id: "grid", label: "Grid" },
            { id: "legend", label: "Legend" },
            { id: "keyboard", label: "Keyboard Commands" },
        ],
    },
    {
        title: "Events & Hooks",
        items: [
            { id: "events", label: "Events" },
            { id: "hooks", label: "Selection Hooks" },
        ],
    },
    {
        title: "Layout",
        items: [
            { id: "layout-hierarchical", label: "Hierarchical Layout" },
            { id: "layout-force", label: "Force Layout" },
            { id: "layout-utils", label: "Layout Utilities" },
        ],
    },
    {
        title: "Presets",
        items: [
            { id: "preset-network", label: "Network Diagram" },
            { id: "preset-workflow", label: "Workflow" },
            { id: "preset-shapes", label: "Shapes" },
        ],
    },
];

interface SidebarProps {
    activePage: PageId;
    onNavigate: (id: PageId) => void;
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
    return (
        <aside className="sidebar">
            {NAV.map((section) => (
                <div key={section.title} className="sidebar-section">
                    <div className="sidebar-section-label">{section.title}</div>
                    {section.items.map((item) => (
                        <div
                            key={item.id}
                            className={`sidebar-link${activePage === item.id ? " active" : ""}`}
                            onClick={() => onNavigate(item.id)}
                        >
                            {item.label}
                        </div>
                    ))}
                </div>
            ))}
        </aside>
    );
}
