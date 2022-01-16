import { Node, TextSelection } from '../../indexed';
import { MarkedText } from '../../indexed';
import { Editor } from '../../indexed';

export const deleteLastChars =
    ({ numberChars = 1 }: { numberChars: number }) =>
    (editor: Editor) => {
        const selection = editor.state.selection as TextSelection;
        const nodeId = selection.nodeId;
        const node = editor.getNode(nodeId);
        if (!node) return;
        const splicedText = Node.spliceText({
            text: node.text as MarkedText,
            textInput: '',
            range: [selection.range[0] - numberChars, selection.range[1]],
        });
        editor
            .createTransaction()
            .patch({
                nodeId,
                patch: { text: splicedText.value },
            })
            .focus(selection.setRange(splicedText.range))
            .dispatch();
    };
