import { BlockSelection, Editor, TextSelection } from '../../indexed';

export const onBackspace = ({ editor }: { editor: Editor }) => {
    const selection = editor.selection as BlockSelection;
    const transaction = editor.createTransaction();
    selection.nodeIds.forEach((nodeId) => {
        const parentId = editor.getParentId(nodeId);
        if (!parentId) return;
        transaction.removeFrom({ nodeId, parentId });
    });

    // To discuss...
    const addNewLine = true;
    if (addNewLine) {
        const { previousId, parentId } = editor.runQuery(({ nodes }) => {
            const ids = Array.from(selection.nodeIds.keys());
            for (const id of ids) {
                if (!nodes[id].parentId) continue;
                return {
                    parentId: nodes[id].parentId,
                    previousId: nodes[id].previousId,
                };
            }
            return {};
        });
        if (!parentId) return;

        const node = editor.createNode('text');
        transaction.insertAfter({
            parentId,
            after: previousId,
            node,
        });

        transaction.focus(new TextSelection(node.id, [0, 0])).dispatch();
    } else {
        transaction.focus().dispatch();
    }
};
