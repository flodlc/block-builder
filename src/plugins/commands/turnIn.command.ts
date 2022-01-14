import { Editor } from '../..';
import { isNodeSchema } from '../..';

export const turnInCommand =
    ({
        nodeId,
        type,
        attrs,
        allowRoot = false,
    }: {
        nodeId: string;
        type: string;
        attrs?: any;
        allowRoot?: boolean;
    }) =>
    (editor: Editor) => {
        const isRoot = editor.state.rootId === nodeId;
        if (isRoot && !allowRoot) return false;

        if (editor.schema[type].allowText) {
            return patchIn({ editor, nodeId, type, attrs });
        } else {
            return wrapIn({ editor, nodeId, type });
        }
    };

const patchIn = ({
    editor,
    nodeId,
    type,
    attrs,
}: {
    editor: Editor;
    nodeId: string;
    type: string;
    attrs?: any;
}) => {
    const newTypeSchema = editor.schema[type];
    if (!isNodeSchema(newTypeSchema)) return;
    editor
        .createTransaction()
        .patch({
            nodeId,
            patch: newTypeSchema.patch({
                ...editor.state.nodes[nodeId],
                attrs,
            }),
        })
        .dispatch();
};

const wrapIn = ({
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

    const typeSchema = editor.schema[type];
    if (!isNodeSchema(typeSchema)) return;
    const wrappingNode = typeSchema.create();
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
