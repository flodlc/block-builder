import { TextSelection } from '../../editor/model/Selection';
import { spliceText } from '../../editor/transaction/MarkedText/spliceText';
import { MarkedText } from '../../editor/model/types';
import { Editor } from '../../editor/model/Editor';

export const insertChars =
    ({ textInput }: { textInput: string }) =>
    (editor: Editor) => {
        const selection = editor.state.selection as TextSelection;
        const nodeId = selection.nodeId;
        const node = editor.state.nodes[nodeId];
        const splicedText = spliceText(node.text as MarkedText, {
            textInput,
            range: selection.range,
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
