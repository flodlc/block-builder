import { Coords } from '../../editor/view/types';

export type BalloonPluginState = {
    visible: boolean;
    close?: () => void;
    startBoundingRect?: Coords;
    endBoundingRect?: Coords;
};
