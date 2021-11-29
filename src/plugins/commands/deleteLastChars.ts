import { TextSelection } from '../../editor/model/Selection';
import { spliceText } from '../../editor/transaction/MarkedText/spliceText';
import { MarkedText } from '../../editor/model/types';
import { Editor } from '../../editor/model/Editor';

export const deleteLastChars =
    ({ numberChars = 1 }: { numberChars: number }) =>
    (editor: Editor) => {
        const selection = editor.state.selection as TextSelection;
        const nodeId = selection.nodeId;
        const node = editor.state.nodes[nodeId];
        const splicedText = spliceText(node.text as MarkedText, {
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
