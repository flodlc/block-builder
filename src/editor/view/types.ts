import { Mark, Node } from '../model/types';
import { AbstractSelection, Range } from '../model/Selection';

export type ViewConfig = {
    marks: Record<string, any>;
    blocks: Record<string, any>;
    decorations: {
        nodeId: string;
        range: Range;
        mark: Mark;
    }[];
};

export type Decoration = {
    key: string;
    nodeId: string;
    range: Range;
    mark: Mark;
};

export type BlockComponentAttrs = {
    parentId: string;
    node: Node;
    selection: AbstractSelection;
    blockSelected: boolean;
};

export type Coords = {
    left: number;
    top: number;
    height: number;
    width: number;
    bottom: number;
    right: number;
};
