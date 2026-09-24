import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import { AlertProvider } from "./components/common/AlertProvider";
import { PromptProvider } from "./components/common/PromptProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <AuthProvider>
            <AlertProvider>
                <PromptProvider>
                    <App />
                </PromptProvider>
            </AlertProvider>
        </AuthProvider>
    </React.StrictMode>
);