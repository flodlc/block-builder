import { TextSelection } from '../../editor/model/Selection';
import { insertMention } from './insertMention.command';
import { Editor } from '../../editor/model/Editor';

export const onChange =
    ({ editor }: { editor: Editor }) =>
    () => {
        if (!editor.state.selection?.isText()) return;
        const selection = editor.state.selection as TextSelection;
        const previousText = selection.getTextBefore(editor.state);

        const result = getMentionMatch(previousText);
        if (!result) return false;

        const textSelection = editor.state.selection as TextSelection;
        editor.runCommand(
            insertMention(
                textSelection.setRange([
                    textSelection.range[0] - result[1].length,
                    textSelection.range[1],
                ])
            )
        );
    };

const getMentionMatch = (previousText: string): RegExpMatchArray | null => {
    let result: RegExpMatchArray | null = null;
    [/ (@)$/, /^(@)$/].some((regex) => {
        if ((result = previousText.match(regex))) {
            return true;
        }
    });
    return result;
};
