import { defineConfig } from "tsup";

export default defineConfig({
    entry: {
        index: "lib/index.ts",
        style: "lib/css/style.css",
    },
    format: ["esm", "cjs"],
    dts: { entry: "lib/index.ts" },
    sourcemap: true,
    clean: true,
    treeshake: true,
    external: ["react", "react-dom", "zustand"],
});
