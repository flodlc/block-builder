import { Coords } from '../..';

export type MentionPluginState = {
    close: () => void;
    searchText: string;
    nodeTextLength?: number;
    triggeringExpression: string;
    startBoundingRect: Coords;
    slashPosition: number;
};

export type MentionValue = {
    type: string;
    date?: string;
    name?: string;
};
