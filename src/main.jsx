import { createRoot } from "react-dom/client";
import App from "./App";
import { Toaster } from "react-hot-toast";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "var(--surface)",
          color: "var(--text)",
          border: "1px solid var(--border-strong)",
          borderRadius: "16px",
          fontFamily: "inherit",
        },
        success: { iconTheme: { primary: "var(--green-600)", secondary: "var(--surface)" } },
        error: { duration: 6000, iconTheme: { primary: "var(--absent-count)", secondary: "var(--surface)" } },
      }}
    />
  </>
);
