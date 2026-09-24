import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    AlertCircle,
    X,
} from "lucide-react";

import {
    AlertModalContext,
} from "./AlertModalContext";

import "./AlertModal.css";


export const AlertModalProvider = ({
    children,
}) => {
    const [message, setMessage] =
        useState("");

    const closeAlert =
        useCallback(() => {
            setMessage("");
        }, []);

    const showAlert =
        useCallback((value) => {
            setMessage(
                String(value ?? "")
            );
        }, []);

    useEffect(() => {
        const nativeAlert = window.alert;

        window.alert = showAlert;

        return () => {
            window.alert = nativeAlert;
        };
    }, [showAlert]);

    useEffect(() => {
        if (!message) {
            return undefined;
        }

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                closeAlert();
            }
        };

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [message, closeAlert]);

    return (
        <AlertModalContext.Provider
            value={{
                showAlert,
                closeAlert,
            }}
        >
            {children}

            {message && (
                <div
                    className="alert-modal-backdrop"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeAlert();
                        }
                    }}
                >
                    <section
                        className="alert-modal"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="alert-modal-title"
                    >
                        <button
                            className="alert-modal-close"
                            type="button"
                            aria-label="Close alert"
                            onClick={closeAlert}
                        >
                            <X size={18} />
                        </button>

                        <div className="alert-modal-icon">
                            <AlertCircle size={24} />
                        </div>

                        <div className="alert-modal-content">
                            <h2 id="alert-modal-title">
                                Notice
                            </h2>
                            <p>{message}</p>
                        </div>

                        <button
                            className="alert-modal-action"
                            type="button"
                            onClick={closeAlert}
                        >
                            OK
                        </button>
                    </section>
                </div>
            )}
        </AlertModalContext.Provider>
    );
};