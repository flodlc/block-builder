import { Editor, TextSelection } from '../../../editor/model';

export const tryReset = ({ editor }: { editor: Editor }) => {
    const selection = editor.selection as TextSelection;
    const node = editor.getNode(selection.nodeId);
    if (!node) return false;
    if (node.type === 'text') return false;
    editor
        .createTransaction()
        .patch({ nodeId: node.id, patch: { type: 'text' } })
        .dispatch();
    return true;
};
