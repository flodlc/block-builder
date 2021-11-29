import React from 'react';
import { PluginFactory } from '../../editor/view/plugin/types';
import { BlockSelection, TextSelection } from '../../editor/model/Selection';
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

        const onkeydown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && editor.state.selection?.isText()) {
                e.preventDefault();
                e.stopPropagation();
                const selection = editor.state.selection as TextSelection;
                editor
                    .createTransaction()
                    .focus(new BlockSelection([selection.nodeId]))
                    .dispatch(false);
            }
        };

        const onMouseDown = (e: MouseEvent) => {
            draggingState = editor.trigger(BLOCK_SELECTION_EVENTS.changed, {
                start: { x: e.pageX, y: e.pageY },
            });
            startNodeId = getNodeIdFromPoint(e.pageX, e.pageY);
            if (editor.state.selection?.isBlock()) {
                editor.createTransaction().focus().dispatch(false);
            }
        };

        const stopSelection = (e: MouseEvent) => {
            if (hasSelectedBlocks) {
                e.stopPropagation();
                e.preventDefault();
            }
            if (!draggingState) return;
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
                current: { x: e.pageX, y: e.pageY },
            });

            getSelection()?.removeAllRanges();
            if (!nodeId) return;
            if (nodeId === editor.state.rootId) return;

            let selectedIds = getSelectedIds({ editor });
            if (
                !selectedIds.length &&
                startNodeId &&
                startNodeId !== editor.state.rootId
            ) {
                selectedIds = [startNodeId];
            }

            if (selectedIds.indexOf(nodeId) < 0) {
                selectedIds = sortSelectedIds([...selectedIds, nodeId], editor);
                hasSelectedBlocks = true;
                editor
                    .createTransaction()
                    .focus(new BlockSelection(selectedIds))
                    .dispatch(false);
            }
        };

        dom.addEventListener('mousedown', onMouseDown);
        dom.addEventListener('keydown', onkeydown);
        dom.addEventListener('click', stopSelection);
        window.addEventListener('contextmenu', stopSelection);
        window.addEventListener('mouseup', stopSelection);
        window.addEventListener('mousemove', onMouseMove);
        return {
            key: 'block_selection',
            Component: () => <BlockSelectionWrapper editor={editor} />,
            destroy: () => {
                dom.removeEventListener('mousedown', onMouseDown);
                dom.removeEventListener('keydown', onkeydown);
                dom.removeEventListener('click', stopSelection);
                window.removeEventListener('contextmenu', stopSelection);
                window.removeEventListener('mouseup', stopSelection);
                window.removeEventListener('mousemove', onMouseMove);
            },
        };
    };

const getSelectedIds = ({ editor }: { editor: Editor }) => {
    if (!editor.state.selection?.isBlock()) return [];
    const selection = editor.state.selection as BlockSelection;
    return Array.from(selection.nodeIds.values());
};

const sortSelectedIds = (nodeIds: string[], editor: Editor) => {
    const flatTree = editor.runQuery((resolvedState) => resolvedState.flatTree);
    return nodeIds.slice().sort((a, b) => {
        return flatTree.indexOf(a) > flatTree.indexOf(b) ? 1 : -1;
    });
};

const getNodeIdFromPoint = (x: number, y: number) => {
    const element = document.elementFromPoint(x, y);
    return (
        element?.closest('[data-uid]')?.getAttribute('data-uid') ?? undefined
    );
};
