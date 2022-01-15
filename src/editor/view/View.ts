import {
    BlockComponentAttrs,
    Coords,
    Decoration,
    EventManager,
    MarkComponentAttrs,
    NodeComponentAttrs,
} from './types';
import { Editor, TextSelection } from '../model';
import React from 'react';
import { getRange } from './TextInput/utils/restoreSelection';
import { Node } from '../model';
import { View as ViewInterface } from './types';

export class View implements ViewInterface {
    editor: Editor;
    dom: HTMLElement;
    marks: Record<string, React.FC<MarkComponentAttrs | NodeComponentAttrs>>;
    blocks: Record<string, React.FC<BlockComponentAttrs>>;
    decorations: Record<string, Decoration[]>;
    eventManager: EventManager;

    constructor(editor: Editor, dom: HTMLElement, eventManager: EventManager) {
        this.editor = editor;
        this.dom = dom;
        this.marks = {};
        this.blocks = {};
        this.decorations = {};
        this.eventManager = eventManager;
    }

    addDecoration(decoration: Decoration) {
        const nodeDecorations = this.decorations[decoration.nodeId] ?? [];
        this.decorations = {
            ...this.decorations,
            [decoration.nodeId]: [...nodeDecorations, decoration],
        };
    }

    clearDecorations(key?: string) {
        const newDecorationsRecord = {} as any;
        Object.keys(this.decorations).forEach((nodeId) => {
            if (!this.decorations[nodeId]) return;
            const nodeDecorations = this.decorations[nodeId].filter(
                (decoration) => decoration.key !== key
            );
            newDecorationsRecord[nodeId] = nodeDecorations.length
                ? nodeDecorations
                : undefined;
        });
        this.decorations = newDecorationsRecord;
    }

    isDecorated(selection: TextSelection) {
        const { nodeId, range } = selection;
        return !!this.decorations[nodeId]?.some(
            (decoration) =>
                decoration.range[0] < range[1] || decoration.range[1] > range[0]
        );
    }

    getCoordsAtPos(
        nodeId: string,
        pos: number,
        {
            side = 1,
            relativeToView = true,
        }: { side?: 1 | -1; relativeToView?: boolean } = {}
    ): Coords | undefined {
        const charDomRect = getDomRectAtPos(this.dom, nodeId, pos, side);
        if (!charDomRect) return undefined;
        return relativeToView
            ? changeCoordsReference(charDomRect, this.dom)
            : charDomRect;
    }

    hasDisplayedChildren(nodeId: string) {
        return !!getNodeChildrenMarker(nodeId);
    }

    hasDisplayedTextField(nodeId: string) {
        return !!getEditable(this.dom, nodeId);
    }

    isNodeDisplayed(nodeId: string) {
        return !!getNodeInDom(this.dom, nodeId);
    }

    getNextDisplayedTextField(
        nodeId: string,
        direction: 1 | -1 = 1
    ): Node | undefined {
        return this.editor.runQuery((resolvedState) => {
            const index = resolvedState.flatTree.indexOf(nodeId);
            let cursorIndex = index + direction;
            while (cursorIndex < resolvedState.flatTree.length) {
                const cursorId = resolvedState.flatTree[cursorIndex];
                if (this.hasDisplayedTextField(cursorId)) {
                    return this.editor.state.nodes[cursorId];
                }
                cursorIndex = cursorIndex + direction;
            }
        });
    }

    getNextDisplayedNode(nodeId: string, direction: 1 | -1 = 1) {
        return this.editor.runQuery((resolvedState) => {
            const index = resolvedState.flatTree.indexOf(nodeId);
            let cursorIndex = index + direction;
            while (cursorIndex < resolvedState.flatTree.length) {
                const cursorId = resolvedState.flatTree[cursorIndex];
                if (this.isNodeDisplayed(cursorId)) {
                    return this.editor.state.nodes[cursorId];
                }
                cursorIndex = cursorIndex + direction;
            }
        });
    }
}

const changeCoordsReference = (
    coords: Coords,
    reference: HTMLElement
): Coords => {
    const referenceDomRect = reference.getBoundingClientRect();
    return {
        left: coords.left - referenceDomRect.left,
        top: coords.top - referenceDomRect.top,
        height: coords.height,
        width: coords.width,
        bottom: coords.bottom - referenceDomRect.top,
        right: coords.right - referenceDomRect.left,
    };
};

const getDomRectAtPos = (
    viewDom: HTMLElement,
    nodeId: string,
    pos: number,
    side: 1 | -1 = 1
): Coords | undefined => {
    const editable = getEditable(viewDom, nodeId);
    if (!editable) return undefined;
    const range = getRange(editable, [pos, pos + (side > 0 ? 1 : 0)]);
    const rangeRects = range.getClientRects();
    if (editable.textContent?.length && rangeRects.length) {
        return rangeRects[side > 0 && rangeRects.length > 1 ? 1 : 0];
    } else {
        const tempNode = document.createTextNode(' ');
        range.collapse(true);
        range.insertNode(tempNode);
        const rect = range.getBoundingClientRect();
        tempNode.parentElement?.removeChild(tempNode);
        return rect;
    }
};

const getNodeChildrenMarker = (nodeId: string) => {
    return document.querySelector(
        `[data-uid="${nodeId}"] [data-children-uid="${nodeId}"]`
    ) as HTMLElement;
};

const getEditable = (viewDom: HTMLElement, nodeId: string) =>
    document.querySelector(
        `[data-uid="${nodeId}"] .editable_content[data-editable-uid="${nodeId}"]`
    ) as HTMLElement;

const getNodeInDom = (viewDom: HTMLElement, nodeId: string) =>
    document.querySelector(`[data-uid="${nodeId}"]`) as HTMLElement;
