import { Editor } from '../..';

export const wrapInPrevious =
    ({ nodeId }: { nodeId: string }) =>
    (editor: Editor) => {
        const { parentId } = editor.runQuery(({ nodes }) => nodes[nodeId]);
        if (!parentId) return false;
        const index =
            editor.state.nodes[parentId]?.childrenIds?.indexOf(nodeId) ?? 0;
        const targetId = editor.state.nodes[parentId].childrenIds?.[index - 1];
        if (!targetId) return false;

        const node = editor.state.nodes[nodeId];
        const target = editor.state.nodes[targetId];

        const targetSchema = editor.schema[target.type];
        if (!targetSchema.allowChildren) return false;

        const wrappingLastChild =
            target.childrenIds?.[(target.childrenIds?.length ?? 0) - 1];

        editor
            .createTransaction()
            .removeFrom({ nodeId, parentId })
            .insertAfter({ parentId: targetId, node, after: wrappingLastChild })
            .dispatch();
    };
