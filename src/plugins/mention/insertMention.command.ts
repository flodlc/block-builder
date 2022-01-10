import { Editor } from '../../editor/model/Editor';
import { insertNodeMark } from '../../editor/transaction/MarkedText/markText';
import { TextSelection } from '../../editor/model/Selection';
import { spliceText } from '../../editor/transaction/MarkedText/spliceText';
import { MentionValue } from './mention.types';

export const insertMention =
    ({ selection, data }: { selection?: TextSelection; data: MentionValue }) =>
    (editor: Editor) => {
        selection = selection ?? (editor.state.selection as TextSelection);
        if (!selection) return;
        const node = editor.state.nodes[selection.nodeId];
        if (!node.text) return;

        const textWithMention = insertNodeMark(node.text, {
            type: 'mention',
            attrs: data,
            range: selection.range,
        });

        const { value, range } = spliceText({
            text: textWithMention,
            editor,
            textInput: ' ',
            range: [selection.range[0] + 1, selection.range[0] + 1],
        });

        editor
            .createTransaction()
            .patch({
                nodeId: node.id,
                patch: {
                    text: value,
                },
            })
            .focus(selection.setRange(range))
            .dispatch();
    };
