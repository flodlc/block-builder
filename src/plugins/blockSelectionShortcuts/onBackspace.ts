import { BlockSelection, Editor, TextSelection } from '../../indexed';

export const onBackspace = ({ editor }: { editor: Editor }) => {
    const selection = editor.state.selection as BlockSelection;
    const transaction = editor.createTransaction();
    selection.nodeIds.forEach((nodeId) => {
        const parentId = editor.runQuery(
            (resolvedState) => resolvedState.nodes[nodeId].parentId
        );
        if (!parentId) return;
        transaction.removeFrom({ nodeId, parentId });
    });

    // To discuss...
    const addNewLine = true;
    if (addNewLine) {
        const { previousId, parentId } = editor.runQuery((resolvedState) => {
            const ids = Array.from(selection.nodeIds.keys());
            for (const id of ids) {
                if (!resolvedState.nodes[id].parentId) continue;
                return {
                    parentId: resolvedState.nodes[id].parentId,
                    previousId: resolvedState.nodes[id].previousId,
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
