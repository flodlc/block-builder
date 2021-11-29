import React from 'react';
import { PluginFactory } from '../../editor/view/plugin/types';
import { SuggestionComponentWrapper } from './Suggestion';
import { TextSelection } from '../../editor/model/Selection';
import { Editor } from '../../editor/model/Editor';
import { SuggestionPluginState } from './suggestion.types';
import { MAX_SEARCH_LENGTH, SUGGESTION_EVENTS } from './suggestion.const';
import { View } from '../../editor/view/View';

export const SuggestionPlugin: PluginFactory =
    () =>
    ({ editor, dom, view }) => {
        let state: SuggestionPluginState | undefined;

        const transactionHandler = () => {
            state = editor.trigger(
                SUGGESTION_EVENTS.changed,
                onTr({ editor, state })
            );
        };

        const clickHandler = () => {
            if (state) {
                state = editor.trigger(SUGGESTION_EVENTS.changed, undefined);
            }
        };

        const keyDownHandler = (e: KeyboardEvent) => {
            if (state && ['Escape', 'Enter'].includes(e.key)) {
                e.stopPropagation();
                e.preventDefault();
                state = editor.trigger(SUGGESTION_EVENTS.changed, undefined);
            } else if (e.key === '/') {
                const selection = editor.state.selection as TextSelection;
                if (view.isDecorated(selection)) {
                    return;
                }
                state = editor.trigger(SUGGESTION_EVENTS.changed, {
                    searchText: '',
                    close: () => {
                        state = editor.trigger(
                            SUGGESTION_EVENTS.changed,
                            undefined
                        );
                    },
                    triggeringExpression: '/',
                    slashPosition: selection.range[0],
                    startBoundingRect: View.getDomRectAtPos(
                        selection.nodeId,
                        selection.range[0]
                    ),
                });
            }
        };

        editor.on('tr', transactionHandler);
        dom.addEventListener('click', clickHandler);
        dom.addEventListener('keydown', keyDownHandler);

        return {
            key: 'Component',
            Component: () => <SuggestionComponentWrapper editor={editor} />,
            destroy: () => {
                editor.off('tr', transactionHandler);
                dom.removeEventListener('click', clickHandler);
                dom.removeEventListener('keydown', keyDownHandler);
            },
        };
    };

const onTr = ({
    editor,
    state,
}: {
    editor: Editor;
    state?: SuggestionPluginState;
}) => {
    if (!state) return state;
    if (!editor.state.selection?.isText()) return undefined;

    const searchText = getSearchText({ editor, pluginState: state });

    if (searchText === undefined || searchText.length > MAX_SEARCH_LENGTH)
        return undefined;

    return {
        ...state,
        searchText,
    };
};

const getSearchText = ({
    editor,
    pluginState,
}: {
    editor: Editor;
    pluginState: SuggestionPluginState;
}): string | undefined => {
    const selection = editor.state.selection as TextSelection;
    const nodeText = selection.getCurrentText(editor.state);
    const nodeTextLength = nodeText?.length ?? 0;

    const previousSearchText = pluginState.searchText;
    const previousNodeTextLength = pluginState.nodeTextLength;
    pluginState.nodeTextLength = nodeTextLength;

    if (
        previousNodeTextLength === undefined ||
        previousSearchText === undefined
    )
        return '';

    const triggeringExpression = pluginState.triggeringExpression as string;
    const triggerLength = triggeringExpression.length ?? 0;
    const delta = nodeTextLength - previousNodeTextLength;
    const slashPosition = pluginState.slashPosition ?? 0;

    const searchStartPosition = slashPosition + triggerLength;
    const searchEndPosition =
        slashPosition + triggerLength + delta + previousSearchText.length;

    if (
        selection.range[0] < searchStartPosition ||
        selection.range[1] > searchEndPosition
    )
        return undefined;

    return nodeText?.slice(searchStartPosition, searchEndPosition);
};
