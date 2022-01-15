import { Editor, Mark, MarkedNode, Node, TextSelection } from '../model';
import { AbstractSelection, Range } from '../model';
import React from 'react';

export interface View {
    editor: Editor;
    dom: HTMLElement;
    eventManager: EventManager;
    addDecoration: (decoration: Decoration) => void;
    clearDecorations: (key?: string) => void;
    isDecorated: (selection: TextSelection) => boolean;
    getCoordsAtPos: (
        nodeId: string,
        pos: number,
        { side, relativeToView }?: { side?: 1 | -1; relativeToView?: boolean }
    ) => Coords | undefined;
    hasDisplayedChildren: (nodeId: string) => boolean;
    hasDisplayedTextField: (nodeId: string) => boolean;
    isNodeDisplayed: (nodeId: string) => boolean;
    getNextDisplayedTextField: (
        nodeId: string,
        direction?: 1 | -1
    ) => Node | undefined;
    getNextDisplayedNode: (
        nodeId: string,
        direction: 1 | -1
    ) => Node | undefined;
}

type NativeEventType =
    | 'selectionchange'
    | 'keydown'
    | 'beforeinput'
    | 'input'
    | 'compositionstart'
    | 'compositionend';

export type EventManager = {
    record: (
        {
            type,
            nodeId,
        }: {
            type: NativeEventType;
            nodeId?: string;
        },
        event: Event
    ) => void;
    observers: Record<
        string,
        {
            nodeId?: string;
            callback: ({ nodeId }: { nodeId?: string }) => boolean;
        }[]
    >;
    on: (
        { type, nodeId }: { type: string; nodeId?: string },
        callback: ({ nodeId }: { nodeId?: string }) => boolean
    ) => void;
    off: (
        { type, nodeId }: { type: string; nodeId?: string },
        callback: ({ nodeId }: { nodeId?: string }) => boolean
    ) => void;
};

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
    selection?: AbstractSelection;
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
