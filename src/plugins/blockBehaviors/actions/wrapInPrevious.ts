import { Editor } from '../../../indexed';

export const wrapInPrevious =
    ({ nodeId }: { nodeId: string }) =>
    (editor: Editor) => {
        const { previousId } = editor.runQuery(({ nodes }) => nodes[nodeId]);
        if (!previousId) return false;

        const node = editor.getNode(nodeId);
        if (!node) return false;

        const target = editor.getNode(previousId);
        if (!target?.allowChildren) return false;

        const wrappingLastChild =
            target.childrenIds?.[(target.childrenIds?.length ?? 0) - 1];

        const parentId = editor.getParentId(nodeId);
        if (!parentId) return false;

        editor
            .createTransaction()
            .removeFrom({ nodeId, parentId })
            .insertAfter({
                parentId: previousId,
                node,
                after: wrappingLastChild,
            })
            .dispatch();
    };
