import React from 'react';
import { PluginFactory } from '../../editor/view/plugin/types';
import { BBlockSelection } from '../../editor/model/Selection';
import { BlockSelectionWrapper } from './BlockSelection';
import { Editor } from '../../editor/model/Editor';

export type DraggingState = {
    start: {
        x: number;
        y: number;
    };
    current?: {
        x: number;
        y: number;
    };
};

export enum BLOCK_SELECTION_EVENTS {
    changed = 'dragging.changed',
}

export const BlockSelectionPlugin: PluginFactory =
    () =>
    ({ dom, editor }) => {
        let startNodeId: string | undefined;
        let hasSelectedBlocks = false;
        let draggingState: DraggingState | void;

        const onMouseDown = (e: MouseEvent) => {
            draggingState = editor.trigger(BLOCK_SELECTION_EVENTS.changed, {
                start: {
                    x: e.pageX,
                    y: e.pageY,
                },
            });
            startNodeId = getNodeIdFromPoint(e.pageX, e.pageY);
            if (editor.state.selection?.isBlock()) {
                editor.createTransaction().focus().dispatch(false);
            }
        };

        const onClick = (e: MouseEvent) => {
            if (hasSelectedBlocks) {
                e.stopPropagation();
                e.preventDefault();
            }
        };

        const onMouseUp = (e: MouseEvent) => {
            if (hasSelectedBlocks) {
                e.stopPropagation();
                e.preventDefault();
            }
            draggingState = editor.trigger(
                BLOCK_SELECTION_EVENTS.changed,
                undefined
            );
            hasSelectedBlocks = false;
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!draggingState) return;

            const nodeId = getNodeIdFromPoint(e.pageX, e.pageY);
            if (
                !editor.state.selection?.isBlock() &&
                startNodeId &&
                startNodeId === nodeId
            )
                return;

            draggingState = editor.trigger(BLOCK_SELECTION_EVENTS.changed, {
                ...draggingState,
                current: {
                    x: e.pageX,
                    y: e.pageY,
                },
            });

            getSelection()?.removeAllRanges();
            if (!nodeId) return;

            const currentSelection = createCurrentSelection({
                startNodeId,
                editor,
            });

            if (!currentSelection.getNodeSelection(nodeId)) {
                hasSelectedBlocks = true;
                editor
                    .createTransaction()
                    .focus(currentSelection.addBlockToSelection(nodeId))
                    .dispatch(false);
            }
        };

        dom.addEventListener('mousedown', onMouseDown);
        dom.addEventListener('click', onClick);
        dom.addEventListener('mouseup', onMouseUp);
        dom.addEventListener('mousemove', onMouseMove);
        return {
            key: 'block_selection',
            Component: () => <BlockSelectionWrapper editor={editor} />,
            destroy: () => {
                dom.removeEventListener('mousedown', onMouseDown);
                dom.removeEventListener('click', onClick);
                dom.removeEventListener('mouseup', onMouseUp);
                dom.removeEventListener('mousemove', onMouseMove);
            },
        };
    };

const createCurrentSelection = ({
    startNodeId,
    editor,
}: {
    startNodeId?: string;
    editor: Editor;
}) => {
    return (
        editor.state.selection?.isBlock()
            ? editor.state.selection
            : new BBlockSelection(startNodeId ? { [startNodeId]: true } : {})
    ) as BBlockSelection;
};

const getNodeIdFromPoint = (x: number, y: number) => {
    const element = document.elementFromPoint(x, y);
    return (
        element?.closest('[data-uid]')?.getAttribute('data-uid') ?? undefined
    );
};
