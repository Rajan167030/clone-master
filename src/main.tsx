import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initDarkMode } from "./lib/darkMode";

// Initialize dark mode on app startup
initDarkMode();

createRoot(document.getElementById("root")!).render(<App />);
