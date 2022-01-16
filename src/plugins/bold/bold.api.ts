import { Editor, isTextSelection, Node } from '../../indexed';

export const boldApi = (editor: Editor) => ({
    isBold: () => {
        const selection = editor.state.selection;
        if (!isTextSelection(selection)) return;
        const node = editor.getNode(selection.nodeId);
        if (!node?.text) return false;
        const textFragment = Node.copyText(node.text, selection.range);
        return Node.hasMark(textFragment, { type: 'b' });
    },
    toggleBold: () => {
        const selection = editor.state.selection;
        if (!isTextSelection(selection)) return;

        const boldStatus = boldApi(editor).isBold();

        const node = editor.getNode(selection.nodeId);
        if (!node?.text) return false;

        const newMarkedText = boldStatus
            ? Node.unmarkText(node.text, {
                  mark: { type: 'b' },
                  range: selection.range,
              })
            : Node.markText(node.text, {
                  mark: { type: 'b' },
                  range: selection.range,
              });

        editor
            .createTransaction()
            .patch({ nodeId: node.id, patch: { text: newMarkedText } })
            .focus(selection.clone())
            .dispatch();
    },
});
