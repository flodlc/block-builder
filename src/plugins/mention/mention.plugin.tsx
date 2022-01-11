import React from 'react';
import { PluginFactory } from '../../editor/view/plugin/types';
import { MentionDecoration } from './MentionDecoration';
import {
    isTextSelection,
    Range,
    TextSelection,
} from '../../editor/model/Selection';
import { Editor } from '../../editor/model/Editor';
import { View } from '../../editor/view/View';
import escapeStringRegexp from 'escape-string-regexp';
import { MentionComponentWrapper } from './MentionDropdown';
import { Mention } from './Mention';
import { MentionPluginState } from './mention.types';
import { EXPRESSIONS, MENTION_EVENTS } from './mention.const';

export const MentionPlugin: PluginFactory =
    () =>
    ({ editor, dom, view }) => {
        let state: MentionPluginState | undefined;

        const keyDownHandler = (e: Event) => {
            const char = (e as InputEvent).data ?? '';
            if (state && ['Escape'].includes(char)) {
                e.stopPropagation();
                e.preventDefault();
                state = editor.trigger(MENTION_EVENTS.changed, undefined);
                return;
            }

            const selection = editor.state.selection;
            if (!isTextSelection(selection)) return;

            const previousText = selection.getTextBefore(editor.state);
            EXPRESSIONS.some((expression) => {
                const regex = new RegExp(
                    `${escapeStringRegexp(expression.slice())}$`
                );

                if (
                    char !== expression.slice(expression.length - 1) ||
                    !regex.test(previousText)
                )
                    return false;

                const startBoundingCoords = view.getCoordsAtPos(
                    selection.nodeId,
                    selection.range[0]
                );
                if (!startBoundingCoords) return;
                state = editor.trigger(MENTION_EVENTS.changed, {
                    searchText: '',
                    close: () => {
                        state = editor.trigger(
                            MENTION_EVENTS.changed,
                            undefined
                        );
                    },
                    nodeTextLength: selection.getCurrentText(editor.state)
                        .length,
                    triggeringExpression: expression,
                    slashPosition: selection.range[0] - expression.length,
                    startBoundingRect: startBoundingCoords,
                });
                editor.trigger('decorationsChanged');
                return true;
            });
        };

        const mousedownHandler = () => {
            if (!state) return;
            state = editor.trigger(MENTION_EVENTS.changed, undefined);
            editor.trigger('decorationsChanged');
        };

        const updateDecorationHandler = (suggestionState: MentionPluginState) =>
            updateDecoration({ suggestionState, editor, view });

        const changeHandler = () => {
            // updateDecor({ editor, view });
            const newState = onTr({ editor, state });
            if (!state && !newState) return;
            state = editor.trigger(MENTION_EVENTS.changed, newState);
        };

        dom.addEventListener('input', keyDownHandler);
        window.addEventListener('mousedown', mousedownHandler);
        editor.on(MENTION_EVENTS.changed, updateDecorationHandler);
        editor.on('tr', changeHandler);
        return {
            key: 'mention',
            addMarks: () => ({
                mention: Mention,
                mentionDecoration: MentionDecoration,
            }),
            Component: () => <MentionComponentWrapper editor={editor} />,
            destroy: () => {
                dom.removeEventListener('input', keyDownHandler);
                dom.removeEventListener('mousedown', mousedownHandler);
                editor.off(MENTION_EVENTS.changed, updateDecorationHandler);
                editor.off('tr', changeHandler);
            },
        };
    };

const updateDecoration = ({
    suggestionState,
    editor,
    view,
}: {
    suggestionState: MentionPluginState;
    editor: Editor;
    view: View;
}) => {
    const selection = editor.state.selection as TextSelection;
    if (suggestionState) {
        view.clearDecorations('mention');
        const slashPosition = suggestionState.slashPosition as number;
        const searchText = suggestionState.searchText as string;
        const triggeringExpression =
            suggestionState.triggeringExpression as string;

        view.addDecoration({
            key: 'mention',
            nodeId: selection.nodeId,
            range: [
                slashPosition,
                slashPosition + searchText.length + triggeringExpression.length,
            ] as Range,
            mark: { type: 'mentionDecoration', attrs: suggestionState },
        });
    } else {
        view.clearDecorations('mention');
    }
};

export const onTr = ({
    editor,
    state,
}: {
    editor: Editor;
    state?: MentionPluginState;
}) => {
    if (!state) return undefined;
    if (!editor.state.selection?.isText()) return state;

    const searchText = getSearchText({
        editor,
        pluginState: state,
    });

    if (searchText === undefined) return undefined;

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
    pluginState: MentionPluginState;
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
    ) {
        return undefined;
    }

    return nodeText?.slice(searchStartPosition, searchEndPosition);
};
