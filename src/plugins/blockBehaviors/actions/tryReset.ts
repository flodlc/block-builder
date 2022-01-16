import { Editor, TextSelection } from '../../../editor/model';

export const tryReset = ({ editor }: { editor: Editor }) => {
    const selection = editor.state.selection as TextSelection;
    const node = editor.state.nodes[selection.nodeId];
    if (node.type === 'text') return false;
    editor
        .createTransaction()
        .patch({ nodeId: node.id, patch: { type: 'text' } })
        .dispatch();
    return true;
};
