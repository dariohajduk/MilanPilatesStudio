import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { LogoProvider } from "./contexts/LogoContext";
import { UserProvider } from "./contexts/UserContext";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <UserProvider>
      <LogoProvider> {/* Ensure LogoProvider wraps the entire app */}
        <App />
      </LogoProvider>
    </UserProvider>
  </React.StrictMode>
);