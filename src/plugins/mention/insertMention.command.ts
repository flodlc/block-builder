import { Editor } from '../../editor/model/Editor';
import { insertMark } from '../../editor/transaction/MarkedText/markText';
import { TextSelection } from '../../editor/model/Selection';

export const insertMention =
    ({ selection, data }: { selection?: TextSelection; data: any }) =>
    (editor: Editor) => {
        selection = selection ?? (editor.state.selection as TextSelection);
        if (!selection) return;
        const node = editor.state.nodes[selection.nodeId];
        if (!node.text) return;

        const text = insertMark(node.text, {
            mark: { t: 'mention', d: data },
            range: selection.range,
        });

        editor
            .createTransaction()
            .patch({
                nodeId: node.id,
                patch: {
                    text,
                },
            })
            .focus(selection.setCollapsedRange(selection.range[0] + 1))
            .dispatch(false);
    };
