import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

import "./AlertProvider.css";


const AlertContext = createContext(null);


export const AlertProvider = ({ children }) => {

    const [message, setMessage] = useState("");

    const showAlert = useCallback((value) => {
        setMessage(String(value ?? ""));
    }, []);

    const closeAlert = useCallback(() => {
        setMessage("");
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

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };

    }, [message, closeAlert]);

    return (
        <AlertContext.Provider value={{ showAlert, closeAlert }}>
            {children}

            {message && (
                <div
                    className="app-alert-backdrop"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeAlert();
                        }
                    }}
                >
                    <section
                        className="app-alert-modal"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="app-alert-title"
                    >
                        <div className="app-alert-icon">!</div>

                        <div className="app-alert-content">
                            <h2 id="app-alert-title">Notice</h2>
                            <p>{message}</p>
                        </div>

                        <button
                            type="button"
                            className="app-alert-close"
                            onClick={closeAlert}
                            autoFocus
                        >
                            OK
                        </button>
                    </section>
                </div>
            )}
        </AlertContext.Provider>
    );
};


export const useAppAlert = () => useContext(AlertContext);
