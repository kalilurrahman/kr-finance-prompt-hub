import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Inject a unique build id so the client can detect new deployments.
// Uses BUILD_ID env var when set (CI), otherwise falls back to a timestamp.
const BUILD_VERSION =
  process.env.BUILD_ID ||
  process.env.COMMIT_REF ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  `dev-${Date.now()}`;

function buildVersionPlugin() {
  return {
    name: "inject-build-version",
    transformIndexHtml(html: string) {
      return html.replace(/__BUILD_VERSION__/g, BUILD_VERSION);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  plugins: [
    react(),
    buildVersionPlugin(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
