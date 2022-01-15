import { hasMark, markText, unmarkText } from '../../indexed';
import { cutMarkedText } from '../../indexed';
import { isTextSelection } from '../../indexed';
import { Editor } from '../../indexed';

export const underlineApi = (editor: Editor) => ({
    isUnderline: () => {
        const selection = editor.state.selection;
        if (!isTextSelection(selection)) return;
        const node = editor.state.nodes[selection.nodeId];
        if (!node.text) return false;
        const textFragment = cutMarkedText(node.text, selection.range);
        return hasMark(textFragment, { type: 'u' });
    },
    toggleUnderline: () => {
        const selection = editor.state.selection;
        if (!isTextSelection(selection)) return;
        const underlineStatus = underlineApi(editor).isUnderline();

        const node = editor.state.nodes[selection.nodeId];
        if (!node.text) return;

        const newMarkedText = underlineStatus
            ? unmarkText(node.text, {
                  mark: { type: 'u' },
                  range: selection.range,
              })
            : markText(node.text, {
                  mark: { type: 'u' },
                  range: selection.range,
              });

        editor
            .createTransaction()
            .patch({
                nodeId: node.id,
                patch: { text: newMarkedText },
            })
            .focus(selection.clone())
            .dispatch();
    },
});
