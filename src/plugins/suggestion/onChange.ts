import { TextSelection } from '../../editor/model/Selection';
import { Editor } from '../../editor/model/Editor';
import { SUGGESTION_EVENTS, SuggestionPluginState } from './suggestion.plugin';

const MAX_SEARCH_LENGTH = 8;

export const onChange = ({
    editor,
    state,
}: {
    editor: Editor;
    state: SuggestionPluginState;
}) => {
    if (!state.visible) return state;
    if (!editor.state.selection?.isText()) return state;

    const selection = editor.state.selection as TextSelection;
    const previousText = selection.getTextBefore(editor.state);
    const matched = getSuggestionMatch(previousText);
    const searchText = matched?.[1].slice(1);

    if (searchText === undefined || searchText.length > MAX_SEARCH_LENGTH) {
        return editor.trigger(SUGGESTION_EVENTS.changed, {
            visible: false,
        });
    }

    return editor.trigger(SUGGESTION_EVENTS.changed, {
        ...state,
        searchText,
    });
};

const getSuggestionMatch = (previousText: string): RegExpMatchArray | null => {
    let result: RegExpMatchArray | null = null;
    [/.*(\/.*?)$/].some((regex) => {
        if ((result = previousText.match(regex))) {
            return true;
        }
    });
    return result;
};
