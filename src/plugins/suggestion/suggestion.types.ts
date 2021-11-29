export type SuggestionPluginState = {
    close: () => void;
    searchText: string;
    nodeTextLength?: number;
    triggeringExpression: string;
    startBoundingRect: DOMRect;
    slashPosition: number;
};
