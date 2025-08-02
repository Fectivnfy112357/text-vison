import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// 导入 Vant 样式
import 'vant/lib/index.css';

// 在桌面端启用触摸模拟
if (typeof window !== 'undefined' && !('ontouchstart' in window)) {
  import('@vant/touch-emulator');
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
