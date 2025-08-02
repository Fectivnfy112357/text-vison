import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";



// 在桌面端启用触摸模拟
if (typeof window !== 'undefined' && !('ontouchstart' in window)) {
  // Touch emulator removed
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
