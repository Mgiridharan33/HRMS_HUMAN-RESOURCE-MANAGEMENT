import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    MessageSquare,
    X,
} from "lucide-react";

import "./PromptProvider.css";
import PromptContext from "./PromptContext";


export const PromptProvider = ({ children }) => {

    const [request, setRequest] = useState(null);


    const closePrompt = useCallback((value = null) => {

        setRequest(current => {

            if (current) {
                current.resolve(value);
            }

            return null;
        });

    }, []);


    const prompt = useCallback((options = {}) => {

        return new Promise(resolve => {

            setRequest({
                title: options.title || "Enter information",
                message: options.message || "",
                label: options.label || "Value",
                defaultValue: options.defaultValue || "",
                placeholder: options.placeholder || "",
                submitLabel: options.submitLabel || "Submit",
                cancelLabel: options.cancelLabel || "Cancel",
                multiline: Boolean(options.multiline),
                inputType: options.inputType || "text",
                resolve,
            });

        });

    }, []);


    useEffect(() => {

        if (!request) {
            return undefined;
        }

        const handleKeyDown = event => {

            if (event.key === "Escape") {
                closePrompt(null);
            }

        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };

    }, [request, closePrompt]);


    return (
        <PromptContext.Provider value={{ prompt }}>

            {children}

            {request && (

                <PromptDialog
                    request={request}
                    onClose={closePrompt}
                />

            )}

        </PromptContext.Provider>
    );

};


const PromptDialog = ({ request, onClose }) => {

    const [value, setValue] = useState(request.defaultValue);


    const handleSubmit = event => {

        event.preventDefault();
        onClose(value);

    };


    return (
        <div
            className="app-prompt-backdrop"
            onMouseDown={event => {

                if (event.target === event.currentTarget) {
                    onClose(null);
                }

            }}
        >

            <form
                className="app-prompt-modal"
                onSubmit={handleSubmit}
                role="dialog"
                aria-modal="true"
                aria-labelledby="app-prompt-title"
            >

                <div className="app-prompt-header">

                    <div className="app-prompt-heading">

                        <div className="app-prompt-icon">
                            <MessageSquare size={19} />
                        </div>

                        <div>
                            <h2 id="app-prompt-title">
                                {request.title}
                            </h2>

                            {request.message && (
                                <p>
                                    {request.message}
                                </p>
                            )}
                        </div>

                    </div>

                    <button
                        type="button"
                        className="app-prompt-close"
                        onClick={() => onClose(null)}
                        aria-label="Close dialog"
                    >
                        <X size={18} />
                    </button>

                </div>

                <div className="app-prompt-body">

                    <label htmlFor="app-prompt-input">
                        {request.label}
                    </label>

                    {request.multiline ? (

                        <textarea
                            id="app-prompt-input"
                            value={value}
                            onChange={event => setValue(event.target.value)}
                            placeholder={request.placeholder}
                            autoFocus
                            rows={4}
                        />

                    ) : (

                        <input
                            id="app-prompt-input"
                            type={request.inputType}
                            value={value}
                            onChange={event => setValue(event.target.value)}
                            placeholder={request.placeholder}
                            autoFocus
                        />

                    )}

                </div>

                <div className="app-prompt-footer">

                    <button
                        type="button"
                        className="app-prompt-cancel"
                        onClick={() => onClose(null)}
                    >
                        {request.cancelLabel}
                    </button>

                    <button
                        type="submit"
                        className="app-prompt-submit"
                    >
                        {request.submitLabel}
                    </button>

                </div>

            </form>

        </div>
    );

};


