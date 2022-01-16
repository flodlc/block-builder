import { Editor } from '../../../indexed';

export const unwrap = ({
    editor,
    nodeId,
}: {
    nodeId: string;
    editor: Editor;
}) => {
    const { parentId } = editor.runQuery(({ nodes }) => nodes[nodeId]);
    if (!parentId) return false;
    const granParenId = editor.runQuery(
        ({ nodes }) => nodes[parentId].parentId
    );
    if (!granParenId) return false;

    const parent = editor.state.nodes[parentId];
    const node = editor.state.nodes[nodeId];

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

    if (!editor.schema[parent.type].allowText && indexInParent === 0) {
        tr.removeFrom({ nodeId: parentId, parentId: granParenId });
    }
    tr.dispatch();
};
