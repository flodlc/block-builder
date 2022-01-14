import { Coords } from '../..';

export type SuggestionPluginState = {
    close: () => void;
    searchText: string;
    nodeTextLength?: number;
    triggeringExpression: string;
    startBoundingRect: Coords;
    slashPosition: number;
};
