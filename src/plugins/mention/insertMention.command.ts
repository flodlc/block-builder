import { Editor } from '../../editor/model/Editor';
import { insertMark } from '../../editor/transaction/MarkedText/markText';
import { TextSelection } from '../../editor/model/Selection';
import { spliceText } from '../../editor/transaction/MarkedText/spliceText';

export const insertMention =
    ({ selection, data }: { selection?: TextSelection; data: any }) =>
    (editor: Editor) => {
        selection = selection ?? (editor.state.selection as TextSelection);
        if (!selection) return;
        const node = editor.state.nodes[selection.nodeId];
        if (!node.text) return;

        const textWithMention = insertMark(node.text, {
            mark: { t: 'mention', d: data },
            range: selection.range,
        });

        const { value, range } = spliceText(textWithMention, {
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
