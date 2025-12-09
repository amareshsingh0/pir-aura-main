import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize theme on load
const initializeTheme = () => {
  const savedTheme = localStorage.getItem("theme") || "dark";
  const root = document.documentElement;
  
  if (savedTheme === "auto") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", prefersDark);
  } else {
    root.classList.toggle("dark", savedTheme === "dark");
  }
};

initializeTheme();

// Register Service Worker for offline support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("Service Worker registered:", registration);
      })
      .catch((error) => {
        console.log("Service Worker registration failed:", error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
