import { Coords } from '../../editor/view/types';

export type SuggestionPluginState = {
    close: () => void;
    searchText: string;
    nodeTextLength?: number;
    triggeringExpression: string;
    startBoundingRect: Coords;
    slashPosition: number;
};
