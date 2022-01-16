import { Editor, TransactionBuilder } from '../../indexed';

export const wrapIn =
    ({
        editor,
        nodeId,
        type,
    }: {
        editor: Editor;
        nodeId: string;
        type: string;
    }) =>
    (transaction: TransactionBuilder) => {
        const { parentId } = editor.runQuery(({ nodes }) => nodes[nodeId]);
        if (!parentId) return false;

        const wrappingNode = editor.createNode(type);
        const node = editor.getNode(nodeId);
        if (!node) return;

        transaction
            .insertAfter({
                after: nodeId,
                node: wrappingNode,
                parentId,
            })
            .removeFrom({
                nodeId,
                parentId,
            })
            .insertAfter({
                parentId: wrappingNode.id,
                node,
            });
        return true;
    };
