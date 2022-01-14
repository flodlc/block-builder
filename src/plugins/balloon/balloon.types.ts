import { Coords } from '../..';

export type BalloonPluginState = {
    visible: boolean;
    close?: () => void;
    startBoundingRect?: Coords;
    endBoundingRect?: Coords;
};
