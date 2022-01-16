import { Editor, TextSelection } from '../../../editor/model';

export const insertLineAtTop = ({ editor }: { editor: Editor }) => {
    const selection = editor.selection as TextSelection;
    const nodeId = selection.nodeId;
    const parentId = editor.getParentId(nodeId);
    if (selection.range[0] === 0) {
        if (!parentId) return false;
        const { previousId } = editor.runQuery(({ nodes }) => nodes[nodeId]);

        const textNode = editor.createNode('text');
        editor
            .createTransaction()
            .insertAfter({ parentId, after: previousId, node: textNode })
            .focus(selection.clone())
            .dispatch();

        return true;
    }
};
