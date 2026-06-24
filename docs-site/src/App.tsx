import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import type { PageId } from "./pages";
import { Introduction } from "./pages/Introduction";
import { GettingStarted } from "./pages/GettingStarted";
import { Canvas } from "./pages/Canvas";
import { Nodes } from "./pages/Nodes";
import { Edges } from "./pages/Edges";
import { Containers } from "./pages/Containers";
import { Endpoints } from "./pages/Endpoints";
import { Controls } from "./pages/Controls";
import { MiniMap } from "./pages/MiniMap";
import { Grid } from "./pages/Grid";
import { Legend } from "./pages/Legend";
import { Keyboard } from "./pages/Keyboard";
import { Events } from "./pages/Events";
import { Hooks } from "./pages/Hooks";
import { LayoutHierarchical } from "./pages/LayoutHierarchical";
import { LayoutForce } from "./pages/LayoutForce";
import { LayoutUtils } from "./pages/LayoutUtils";
import { PresetNetwork } from "./pages/PresetNetwork";
import { PresetWorkflow } from "./pages/PresetWorkflow";
import { PresetShapes } from "./pages/PresetShapes";

function renderPage(page: PageId, onNavigate: (id: PageId) => void) {
    switch (page) {
        case "introduction": return <Introduction onNavigate={onNavigate} />;
        case "getting-started": return <GettingStarted />;
        case "canvas": return <Canvas />;
        case "nodes": return <Nodes />;
        case "edges": return <Edges />;
        case "containers": return <Containers />;
        case "endpoints": return <Endpoints />;
        case "controls": return <Controls />;
        case "minimap": return <MiniMap />;
        case "grid": return <Grid />;
        case "legend": return <Legend />;
        case "keyboard": return <Keyboard />;
        case "events": return <Events />;
        case "hooks": return <Hooks />;
        case "layout-hierarchical": return <LayoutHierarchical />;
        case "layout-force": return <LayoutForce />;
        case "layout-utils": return <LayoutUtils />;
        case "preset-network": return <PresetNetwork />;
        case "preset-workflow": return <PresetWorkflow />;
        case "preset-shapes": return <PresetShapes />;
    }
}

export default function App() {
    const [page, setPage] = useState<PageId>("introduction");

    const navigate = (id: PageId) => {
        setPage(id);
        window.scrollTo(0, 0);
    };

    return (
        <div className="layout">
            <header className="header">
                <a className="header-logo" onClick={() => navigate("introduction")} style={{ cursor: "pointer" }}>
                    <span className="header-logo-dot" />
                    FlowKit
                </a>
                <span className="header-badge">Developer Docs</span>
            </header>

            <Sidebar activePage={page} onNavigate={navigate} />

            <main className="main">
                {renderPage(page, navigate)}
            </main>
        </div>
    );
}
