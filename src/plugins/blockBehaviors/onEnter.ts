import { Editor } from '../../editor/model/Editor';
import { cutMarkedText } from '../../editor/transaction/MarkedText/cutMarkedText';
import { TextSelection } from '../../editor/model/Selection';
import { nodesBehaviors } from './behaviors.config';
import { CompiledNodeSchema } from '../../editor/model/types';
import { View } from '../../editor/view/View';

export const onEnter = ({
    editor,
    view,
}: {
    editor: Editor;
    view: View;
}): boolean => {
    const selection = editor.state.selection as TextSelection;
    const node = editor.state.nodes[selection.nodeId];
    const shouldKeepFormat = nodesBehaviors[node.type].keepFormatOnEnter;

    const newNodeSchema = editor.schema[
        shouldKeepFormat ? node.type : 'text'
    ] as CompiledNodeSchema;
    const newNode = newNodeSchema.create();

    newNode.text = cutMarkedText(node.text, [selection?.range[1]]);
    const tr = editor.createTransaction();
    if (selection.range[0] === 0) {
        const { parentId } = editor.runQuery(({ nodes }) => nodes[node.id]);
        if (!parentId) return false;
        const { previousId } = editor.runQuery(({ nodes }) => nodes[node.id]);

        const textSchema = editor.schema.text as CompiledNodeSchema;
        const textNode = textSchema.create();
        tr.insertAfter({ parentId, after: previousId, node: textNode })
            .focus(selection.clone())
            .dispatch();

        return true;
    } else if (!view.hasDisplayedChildren(node.id)) {
        const { parentId } = editor.runQuery(({ nodes }) => nodes[node.id]);
        if (!parentId) return false;
        tr.insertAfter({ node: newNode, parentId, after: node.id });
    } else {
        tr.insertAfter({ node: newNode, parentId: node.id });
    }

    const text = cutMarkedText(node.text, [undefined, selection?.range?.[0]]);
    tr.patch({ nodeId: node.id, patch: { text } })
        .focus(new TextSelection(newNode.id, [0, 0]))
        .dispatch();
    return true;
};
