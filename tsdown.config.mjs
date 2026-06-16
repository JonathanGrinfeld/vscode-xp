import { defineConfig } from "tsdown";

export default defineConfig({
    entry: ["./src/extension.ts"],
    outDir: "out",
    format: ["cjs"],
    platform: "node",
    target: "node16",
    external: ["vscode"],
    sourcemap: true,
    clean: true,
    unbundle: false,
});
