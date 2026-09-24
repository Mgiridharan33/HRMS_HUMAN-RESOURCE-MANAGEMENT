import { useContext } from "react";

import PromptContext from "./PromptContext";

export const useAppPrompt = () => {

    const context = useContext(PromptContext);

    if (!context) {
        throw new Error("useAppPrompt must be used inside PromptProvider");
    }

    return context.prompt;

};