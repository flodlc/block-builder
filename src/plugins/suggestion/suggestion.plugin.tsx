import React from 'react';
import { PluginFactory } from '../../editor/view/plugin/types';
import { onChange } from './onChange';
import { SuggestionComponentWrapper } from './Suggestion';
import { TextSelection } from '../../editor/model/Selection';

export type SuggestionPluginState = {
    visible: boolean;
    searchText?: string;
    startBoundingRect?: DOMRect;
    slashPosition?: number;
};

export enum SUGGESTION_EVENTS {
    changed = 'changed',
}

export const SuggestionPlugin: PluginFactory =
    () =>
    ({ editor, dom }) => {
        let state: SuggestionPluginState = { visible: false };

        const transactionHandler = () => {
            state = onChange({ editor, state });
        };

        const clickHandler = () => {
            if (state.visible) {
                state = editor.trigger(SUGGESTION_EVENTS.changed, {
                    visible: false,
                });
            }
        };

        const keyDownHandler = (e: KeyboardEvent) => {
            if (state.visible && ['Escape', 'Enter'].includes(e.key)) {
                e.stopPropagation();
                e.preventDefault();
                state = editor.trigger(SUGGESTION_EVENTS.changed, {
                    visible: false,
                });
            }
        };

        const keyUpHandler = (e: KeyboardEvent) => {
            if (e.key === '/') {
                const selection = editor.state.selection as TextSelection;
                state = editor.trigger(SUGGESTION_EVENTS.changed, {
                    visible: true,
                    searchText: '',
                    slashPosition: selection.range[0] - 1,
                    startBoundingRect: getSelectionRect(),
                });
            }
        };

        editor.on('change', transactionHandler);
        dom.addEventListener('click', clickHandler);
        dom.addEventListener('keydown', keyDownHandler);
        dom.addEventListener('keyup', keyUpHandler);

        return {
            key: 'Component',
            Component: () => <SuggestionComponentWrapper editor={editor} />,
            destroy: () => {
                editor.off('change', transactionHandler);
                dom.removeEventListener('click', clickHandler);
                dom.removeEventListener('keydown', keyDownHandler);
                dom.removeEventListener('keyup', keyUpHandler);
            },
        };
    };

const getSelectionRect = () => {
    const selection = document.getSelection();
    if (!selection?.focusNode) return;
    const range = document.createRange();
    range.setStart(selection.focusNode, selection.focusOffset);
    range.setEnd(selection.focusNode, selection.focusOffset);
    return range.getBoundingClientRect();
};
