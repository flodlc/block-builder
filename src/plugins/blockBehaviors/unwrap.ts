import { Editor } from '../../indexed';

export const unwrap =
    ({ nodeId }: { nodeId: string }) =>
    (editor: Editor) => {
        const node = editor.getNode(nodeId);
        if (!node) return false;

        const { parentId } = editor.runQuery(({ nodes }) => nodes[nodeId]);
        const parent = parentId && editor.getNode(parentId);
        if (!parent) return false;

        const granParenId = editor.getParentId(parentId);
        if (!granParenId) return false;

        const tr = editor
            .createTransaction()
            .removeFrom({ parentId, nodeId })
            .insertAfter({ parentId: granParenId, after: parentId, node });

        const indexInParent = parent.childrenIds?.indexOf(nodeId) ?? 0;

        parent.childrenIds
            ?.slice(indexInParent + 1)
            .reverse()
            .forEach((nextSiblingId) => {
                const nextSibling = editor.getNode(nextSiblingId);
                if (!nextSibling) return;
                tr.removeFrom({ nodeId: nextSiblingId, parentId });
                tr.insertAfter({
                    parentId: nodeId,
                    after: node.childrenIds?.[node.childrenIds?.length - 1],
                    node: nextSibling,
                });
            });

        if (!parent.allowText && indexInParent === 0) {
            tr.removeFrom({ nodeId: parentId, parentId: granParenId });
        }
        tr.dispatch();
    };
