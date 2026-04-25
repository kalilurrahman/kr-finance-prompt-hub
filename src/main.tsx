import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { cleanupStaleDeployArtifacts } from "./lib/cleanupStaleDeployArtifacts";

cleanupStaleDeployArtifacts();

createRoot(document.getElementById("root")!).render(<App />);
