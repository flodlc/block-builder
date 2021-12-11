import React from 'react';
import { PluginFactory } from '../../editor/view/plugin/types';
import { BlockSelection, TextSelection } from '../../editor/model/Selection';
import { BlockSelectionWrapper } from './BlockSelection';
import { Editor } from '../../editor/model/Editor';
import { View } from '../../editor/view/View';

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
    ({ dom, editor, view }) => {
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
                start: getMouseEventRectInView(e, view),
            });
            startNodeId = getNodeIdFromPoint(e.clientX, e.clientY);
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
            const nodeId = getNodeIdFromPoint(e.clientX, e.clientY);
            if (
                !editor.state.selection?.isBlock() &&
                startNodeId &&
                startNodeId === nodeId
            )
                return;

            e.preventDefault();
            getSelection()?.removeAllRanges();

            const currentMousePosition = getMouseEventRectInView(e, view);
            draggingState = editor.trigger(BLOCK_SELECTION_EVENTS.changed, {
                ...draggingState,
                current: currentMousePosition,
            });

            getSelection()?.removeAllRanges();
            const nodeIds = getNodeIdsUnderSelection(
                view.dom,
                draggingState.start,
                currentMousePosition
            ).filter((nodeId) => nodeId !== editor.state.rootId);

            requestAnimationFrame(() => {
                hasSelectedBlocks = true;
                editor
                    .createTransaction()
                    .focus(new BlockSelection(sortSelectedIds(nodeIds, editor)))
                    .dispatch(false);
            });
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

const sortSelectedIds = (nodeIds: string[], editor: Editor) => {
    const flatTree = editor.runQuery((resolvedState) => resolvedState.flatTree);
    return nodeIds.slice().sort((a, b) => {
        return flatTree.indexOf(a) > flatTree.indexOf(b) ? 1 : -1;
    });
};

const getMouseEventRectInView = (e: MouseEvent, view: View) => {
    const viewDomRect = view.dom.getBoundingClientRect();
    return { x: e.clientX - viewDomRect.left, y: e.clientY - viewDomRect.top };
};

const getNodeIdsUnderSelection = (
    viewDom: HTMLElement,
    { x: x1, y: y1 }: { x: number; y: number },
    { x: x2, y: y2 }: { x: number; y: number }
) => {
    const rootRect = {
        top: Math.min(y1, y2),
        left: Math.min(x1, x2),
        bottom: Math.max(y1, y2),
        right: Math.max(x1, x2),
    } as DOMRect;

    const viewDomRect = viewDom.getBoundingClientRect();
    const blocks = document.querySelectorAll('[data-uid]');
    return Array.from(blocks)
        .filter((block) => {
            const blockRect = block.getBoundingClientRect();
            const blockRectInView = {
                top: blockRect.top - viewDomRect.top,
                left: blockRect.left - viewDomRect.left,
                right: blockRect.right - viewDomRect.left,
                bottom: blockRect.bottom - viewDomRect.top,
            } as DOMRect;
            return isOverLapping(rootRect, blockRectInView);
        })
        .map((block) => block.getAttribute('data-uid')) as string[];
};

const isOverLapping = (rect1: DOMRect, rect2: DOMRect) => {
    return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
    );
};

const getNodeIdFromPoint = (x: number, y: number) => {
    const element = document.elementFromPoint(x, y);
    return (
        element?.closest('[data-uid]')?.getAttribute('data-uid') ?? undefined
    );
};
