import { Editor, Node } from '../../indexed';
import { TextSelection } from '../../indexed';
import { MentionValue } from './mention.types';

export const insertMention =
    ({ selection, data }: { selection?: TextSelection; data: MentionValue }) =>
    (editor: Editor) => {
        selection = selection ?? (editor.state.selection as TextSelection);
        if (!selection) return;
        const node = editor.getNode(selection.nodeId);
        if (!node?.text) return;

        const textWithMention = Node.insertNodeMark(node.text, {
            type: 'mention',
            attrs: data,
            range: selection.range,
        });

        const { value, range } = Node.spliceText({
            text: textWithMention,
            textInput: ' ',
            range: [selection.range[0] + 1, selection.range[0] + 1],
        });

        editor
            .createTransaction()
            .patch({
                nodeId: node.id,
                patch: { text: value },
            })
            .focus(selection.setRange(range))
            .dispatch();
    };
