import { hasMark, markText, unmarkText } from '../..';
import { cutMarkedText } from '../..';
import { isTextSelection } from '../..';
import { Editor } from '../..';

export const italicApi = (editor: Editor) => ({
    isItalic: () => {
        const selection = editor.state.selection;
        if (!isTextSelection(selection)) return;
        const node = editor.state.nodes[selection.nodeId];
        if (!node.text) return false;
        const textFragment = cutMarkedText(node.text, selection.range);
        return hasMark(textFragment, { type: 'i' });
    },
    toggleItalic: () => {
        const selection = editor.state.selection;
        if (!isTextSelection(selection)) return;

        const boldStatus = italicApi(editor).isItalic();

        const node = editor.state.nodes[selection.nodeId];
        if (!node.text) return;

        const newMarkedText = boldStatus
            ? unmarkText(node.text, {
                  mark: { type: 'i' },
                  range: selection.range,
              })
            : markText(node.text, {
                  mark: { type: 'i' },
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
