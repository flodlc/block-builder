import {
    hasMark,
    markText,
    unmarkText,
} from '../../editor/transaction/MarkedText/markText';
import { cutMarkedText } from '../../editor/transaction/MarkedText/cutMarkedText';
import { TextSelection } from '../../editor/model/Selection';
import { Editor } from '../../editor/model/Editor';

export const boldApi = (editor: Editor) => ({
    isBold: () => {
        if (!editor.state.selection) return false;
        const selection = editor.state.selection as TextSelection;
        if (!selection.isText()) return false;
        const node = editor.state.nodes[selection.nodeId];
        if (!node.text) return false;
        const textFragment = cutMarkedText(node.text, selection.range);
        return hasMark(textFragment, { t: 'b' });
    },
    toggleBold: () => {
        const selection = editor.state.selection as TextSelection;
        if (!selection.isText()) return false;
        const boldStatus = boldApi(editor).isBold();

        const node = editor.state.nodes[selection.nodeId];
        if (!node.text) return;

        const newMarkedText = boldStatus
            ? unmarkText(node.text, {
                  mark: { t: 'b' },
                  range: selection.range,
              })
            : markText(node.text, {
                  mark: { t: 'b' },
                  range: selection.range,
              });

        editor
            .createTransaction()
            .patch({
                nodeId: node.id,
                patch: {
                    text: newMarkedText,
                },
            })
            .focus(selection.clone())
            .dispatch();
    },
});
