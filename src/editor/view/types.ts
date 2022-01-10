import { Mark, MarkedNode, Node } from '../model/types';
import { AbstractSelection, Range } from '../model/Selection';
import React from 'react';

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

export type MarkComponentAttrs<T = any> = {
    children: React.ReactElement | React.ReactElement[];
    mark: Mark<T>;
    updateMark: (mark: Mark<T>) => void;
    node: MarkedNode;
};

export type NodeComponentAttrs<T = any> = {
    node: MarkedNode<T>;
};

export type Coords = {
    left: number;
    top: number;
    height: number;
    width: number;
    bottom: number;
    right: number;
};
