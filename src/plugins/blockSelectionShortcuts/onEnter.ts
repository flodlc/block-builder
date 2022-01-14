import { Editor } from '../..';
import { BlockSelection, TextSelection } from '../..';
import { getMarkedTextLength } from '../..';
import { CompiledNodeSchema } from '../..';

export const onEnter = ({ editor }: { editor: Editor }) => {
    const selection = editor.state.selection as BlockSelection;
    const firstNodeId = Array.from(selection.nodeIds.keys())[0];
    const firstNode = editor.state.nodes[firstNodeId];
    const textLength = getMarkedTextLength(firstNode.text ?? []);
    if (editor.schema[firstNode.type].allowText) {
        editor
            .createTransaction()
            .focus(
                new TextSelection(Array.from(selection.nodeIds.keys())[0], [
                    textLength,
                    textLength,
                ])
            )
            .dispatch(false);
    } else {
        const { parentId } = editor.runQuery(({ nodes }) => nodes[firstNodeId]);
        if (!parentId) return;

        const textSchema = editor.schema.text as CompiledNodeSchema;
        const newNode = textSchema.create();
        editor
            .createTransaction()
            .insertAfter({
                after: firstNodeId,
                parentId,
                node: newNode,
            })
            .focus(new TextSelection(newNode.id, [0, 0]))
            .dispatch();
    }
};
