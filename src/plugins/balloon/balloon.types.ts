import { Coords } from '../../indexed';

export type BalloonPluginState = {
    visible: boolean;
    close?: () => void;
    startBoundingRect?: Coords;
    endBoundingRect?: Coords;
};
