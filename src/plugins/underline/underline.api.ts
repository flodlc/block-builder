import { Node } from '../../indexed';
import { isTextSelection } from '../../indexed';
import { Editor } from '../../indexed';

export const underlineApi = (editor: Editor) => ({
    isUnderline: () => {
        const selection = editor.state.selection;
        if (!isTextSelection(selection)) return;
        const node = editor.getNode(selection.nodeId);
        if (!node?.text) return false;
        const textFragment = Node.copyText(node.text, selection.range);
        return Node.hasMark(textFragment, { type: 'u' });
    },
    toggleUnderline: () => {
        const selection = editor.state.selection;
        if (!isTextSelection(selection)) return;
        const underlineStatus = underlineApi(editor).isUnderline();

        const node = editor.getNode(selection.nodeId);
        if (!node?.text) return false;

        const newMarkedText = underlineStatus
            ? Node.unmarkText(node.text, {
                  mark: { type: 'u' },
                  range: selection.range,
              })
            : Node.markText(node.text, {
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
