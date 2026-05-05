import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

const elRoot = document.getElementById("root")!;

const rootContainer = createRoot(elRoot);

rootContainer.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
