import {
    createContext,
    useContext,
} from "react";


export const AlertModalContext =
    createContext(null);


export const useAlertModal = () => {
    const context =
        useContext(AlertModalContext);

    if (!context) {
        throw new Error(
            "useAlertModal must be used inside AlertModalProvider"
        );
    }

    return context;
};