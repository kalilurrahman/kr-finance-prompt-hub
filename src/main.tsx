import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { cleanupStaleDeployArtifacts } from "./lib/cleanupStaleDeployArtifacts";
import { installBuildVersionWatcher } from "./lib/buildVersion";

cleanupStaleDeployArtifacts();
installBuildVersionWatcher();

createRoot(document.getElementById("root")!).render(<App />);
