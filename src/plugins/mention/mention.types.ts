import { Coords } from '../../editor/view/types';

export type MentionPluginState = {
    close: () => void;
    searchText: string;
    nodeTextLength?: number;
    triggeringExpression: string;
    startBoundingRect: Coords;
    slashPosition: number;
};
