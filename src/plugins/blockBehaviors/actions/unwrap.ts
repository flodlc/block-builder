import { Editor } from '../../../indexed';

export const unwrap = ({
    editor,
    nodeId,
}: {
    nodeId: string;
    editor: Editor;
}) => {
    const node = editor.getNode(nodeId);
    if (!node) return false;

    const parentId = editor.getParentId(nodeId);
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
            tr.removeFrom({ nodeId: nextSiblingId, parentId });
            tr.insertAfter({
                parentId: nodeId,
                after: node.childrenIds?.[node.childrenIds?.length - 1],
                node: editor.state.nodes[nextSiblingId],
            });
        });

    if (!parent.allowText && indexInParent === 0) {
        tr.removeFrom({ nodeId: parentId, parentId: granParenId });
    }
    tr.dispatch();
};
