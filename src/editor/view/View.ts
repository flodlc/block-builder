import { BlockComponentAttrs, Decoration } from './types';
import { TextSelection } from '../model/Selection';
import { Editor } from '../model/Editor';
import React from 'react';
import { getRange } from './TextInput/utils/restoreSelection';

export class View {
    editor: Editor;
    marks: Record<string, any>;
    blocks: Record<string, React.FC<BlockComponentAttrs>>;
    decorations: Record<string, Decoration[]>;

    constructor(editor: Editor) {
        this.editor = editor;
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
        `[data-uid="${nodeId}"] [contenteditable="true"]`
    ) as HTMLElement;

function getDomRectAtPos(nodeId: string, pos: number) {
    const editable = getEditable(nodeId);
    if (editable.textContent?.length) {
        const range = getRange(editable, [pos, pos]);
        return range.getBoundingClientRect();
    } else {
        editable.textContent = ' ';
        const range = new Range();
        range.setStart(editable.firstChild as ChildNode, 0);
        range.setEnd(editable.firstChild as ChildNode, 0);
        const rect = range.getBoundingClientRect();
        editable.textContent = '';
        return rect;
    }
}
