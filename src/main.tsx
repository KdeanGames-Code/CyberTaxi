// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RegisterForm } from "./components/onboarding/register-form";
import "./styles/global.css";

const App: React.FC = () => {
    const handleClose = () => {
        console.log("Registration window closed");
    };

    return (
        <div>
            <RegisterForm onClose={handleClose} />
        </div>
    );
};

ReactDOM.createRoot(document.getElementById("app")!).render(<App />);
