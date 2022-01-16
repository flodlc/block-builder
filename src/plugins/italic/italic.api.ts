import { Node } from '../../indexed';
import { isTextSelection } from '../../indexed';
import { Editor } from '../../indexed';

export const italicApi = (editor: Editor) => ({
    isItalic: () => {
        const selection = editor.state.selection;
        if (!isTextSelection(selection)) return;
        const node = editor.getNode(selection.nodeId);
        if (!node?.text) return false;
        const textFragment = Node.copyText(node.text, selection.range);
        return Node.hasMark(textFragment, { type: 'i' });
    },
    toggleItalic: () => {
        const selection = editor.state.selection;
        if (!isTextSelection(selection)) return;

        const boldStatus = italicApi(editor).isItalic();

        const node = editor.getNode(selection.nodeId);
        if (!node?.text) return false;

        const newMarkedText = boldStatus
            ? Node.unmarkText(node.text, {
                  mark: { type: 'i' },
                  range: selection.range,
              })
            : Node.markText(node.text, {
                  mark: { type: 'i' },
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
