import { Editor } from '../../indexed';

export const wrapIn = ({
    editor,
    nodeId,
    type,
}: {
    editor: Editor;
    nodeId: string;
    type: string;
}) => {
    const { parentId } = editor.runQuery(({ nodes }) => nodes[nodeId]);
    if (!parentId) return false;

    const wrappingNode = editor.createNode(type);
    const node = editor.state.nodes[nodeId];

    editor
        .createTransaction()
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
        })
        .dispatch();
    return true;
};
