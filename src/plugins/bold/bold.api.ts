import {
    hasMark,
    markText,
    unmarkText,
} from '../../editor/transaction/MarkedText/markText';
import { cutMarkedText } from '../../editor/transaction/MarkedText/cutMarkedText';
import { isTextSelection } from '../../editor/model/Selection';
import { Editor } from '../../editor/model/Editor';

export const boldApi = (editor: Editor) => ({
    isBold: () => {
        const selection = editor.state.selection;
        if (!isTextSelection(selection)) return;
        const node = editor.state.nodes[selection.nodeId];
        if (!node.text) return false;
        const textFragment = cutMarkedText(node.text, selection.range);
        return hasMark(textFragment, { type: 'b' });
    },
    toggleBold: () => {
        const selection = editor.state.selection;
        if (!isTextSelection(selection)) return;

        const boldStatus = boldApi(editor).isBold();

        const node = editor.state.nodes[selection.nodeId];
        if (!node.text) return;

        const newMarkedText = boldStatus
            ? unmarkText(node.text, {
                  mark: { type: 'b' },
                  range: selection.range,
              })
            : markText(node.text, {
                  mark: { type: 'b' },
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
