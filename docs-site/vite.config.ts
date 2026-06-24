import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(dirname, "..");

export default defineConfig(({ command }) => ({
    plugins: [react()],
    define: {
        __BUNDLED_DEV__: command === "serve" ? "true" : "false",
    },
    resolve: {
        alias: {
            react: path.resolve(dirname, "node_modules/react"),
            "react-dom": path.resolve(dirname, "node_modules/react-dom"),
            zustand: path.resolve(rootDir, "node_modules/zustand"),
        },
        dedupe: ["react", "react-dom", "zustand"],
    },
    server: {
        port: 5174,
        fs: {
            allow: [dirname, rootDir],
        },
    },
}));
