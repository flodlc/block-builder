import { Coords } from '../../indexed';

export type SuggestionPluginState = {
    close: () => void;
    searchText: string;
    nodeTextLength?: number;
    triggeringExpression: string;
    startBoundingRect: Coords;
    slashPosition: number;
};
