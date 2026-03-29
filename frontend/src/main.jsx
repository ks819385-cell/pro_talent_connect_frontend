import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { AboutProvider } from "./context/AboutContext";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <AboutProvider>
          <App />
        </AboutProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
);
