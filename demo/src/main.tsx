import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "../../lib/css/style.css";
// import "../../lib/css/parts/core.css";
// import "../../lib/css/parts/nodes.css";
// import "../../lib/css/parts/node-containers.css";
// import "../../lib/css/parts/shapes.css";
// import "../../lib/css/parts/endpoints.css";
// import "../../lib/css/parts/controls.css";
// import "../../lib/css/parts/mini-map.css";
// import "../../lib/css/parts/edges.css";
import "./styles.css";

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
