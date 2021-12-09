import { BlockComponentAttrs, Decoration } from './types';
import { TextSelection } from '../model/Selection';
import { Editor } from '../model/Editor';
import React from 'react';
import { getRange } from './TextInput/utils/restoreSelection';

export class View {
    editor: Editor;
    dom: HTMLElement;
    marks: Record<string, any>;
    blocks: Record<string, React.FC<BlockComponentAttrs>>;
    decorations: Record<string, Decoration[]>;

    constructor(editor: Editor, dom: HTMLElement) {
        this.editor = editor;
        this.dom = dom;
        this.marks = {};
        this.blocks = {};
        this.decorations = {};
    }

    addDecoration(decoration: Decoration) {
        const nodeDecorations = this.decorations[decoration.nodeId] ?? [];
        this.decorations = {
            ...this.decorations,
            [decoration.nodeId]: [...nodeDecorations, decoration],
        };
        this.editor.trigger('decorationsChanged');
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
        this.editor.trigger('decorationsChanged');
    }

    isDecorated(selection: TextSelection) {
        const { nodeId, range } = selection;
        return !!this.decorations[nodeId]?.some(
            (decoration) =>
                decoration.range[0] < range[1] || decoration.range[1] > range[0]
        );
    }

    static getDomRectAtPos = getDomRectAtPos;
}

const getEditable = (nodeId: string) =>
    document.querySelector(
        `[data-uid="${nodeId}"] .editable_content`
    ) as HTMLElement;

function getDomRectAtPos(nodeId: string, pos: number, side: 1 | -1 = 1) {
    const editable = getEditable(nodeId);
    const range = getRange(editable, [pos, pos + (side > 0 ? 1 : 0)]);
    const rangeRects = range.getClientRects();
    if (editable.textContent?.length && rangeRects.length) {
        return rangeRects[side > 0 && rangeRects.length > 1 ? 1 : 0];
    } else {
        const tempNode = document.createTextNode('a');
        range.collapse(true);
        range.insertNode(tempNode);
        const rect = range.getBoundingClientRect();
        tempNode.parentElement?.removeChild(tempNode);
        return rect;
    }
}
