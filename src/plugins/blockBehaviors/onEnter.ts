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
    if (tryUnwrap({ editor })) {
        return true;
    } else if (insertLineAtTop({ editor })) {
        return true;
    } else if (insertNodeAfter({ editor, view })) {
        return true;
    }
    return false;
};

const tryUnwrap = ({ editor }: { editor: Editor }) => {
    const selection = editor.state.selection as TextSelection;
    const node = editor.state.nodes[selection.nodeId];
    if (node.text?.length) return false;

    if (nodesBehaviors[node.type].resetOnEmptyEnter) {
        return tryReset({ editor });
    }
};

const insertLineAtTop = ({ editor }: { editor: Editor }) => {
    const selection = editor.state.selection as TextSelection;
    const nodeId = selection.nodeId;
    const { parentId } = editor.runQuery(({ nodes }) => nodes[nodeId]);
    if (selection.range[0] === 0) {
        if (!parentId) return false;
        const { previousId } = editor.runQuery(({ nodes }) => nodes[nodeId]);

        const textSchema = editor.schema.text as CompiledNodeSchema;
        const textNode = textSchema.create();
        editor
            .createTransaction()
            .insertAfter({ parentId, after: previousId, node: textNode })
            .focus(selection.clone())
            .dispatch();

        return true;
    }
};

const insertNodeAfter = ({ editor, view }: { editor: Editor; view: View }) => {
    const selection = editor.state.selection as TextSelection;
    const node = editor.state.nodes[selection.nodeId];
    const { parentId } = editor.runQuery(({ nodes }) => nodes[node.id]);

    const tr = editor.createTransaction();

    if (view.hasDisplayedChildren(node.id)) {
        const newNode = (editor.schema.text as CompiledNodeSchema).create({
            text: cutMarkedText(node.text, [selection?.range[1]]),
        });
        tr.insertAfter({ node: newNode, parentId: node.id });
        const text = cutMarkedText(node.text, [
            undefined,
            selection?.range?.[0],
        ]);
        tr.patch({ nodeId: node.id, patch: { text } })
            .focus(new TextSelection(newNode.id, [0, 0]))
            .dispatch();
    } else {
        if (!parentId) return false;
        const shouldKeepFormat = nodesBehaviors[node.type].keepFormatOnEnter;
        const newNodeSchema = editor.schema[
            shouldKeepFormat ? node.type : 'text'
        ] as CompiledNodeSchema;
        const newNode = newNodeSchema.create({
            text: cutMarkedText(node.text, [selection?.range[1]]),
        });
        tr.insertAfter({ node: newNode, parentId, after: node.id });
        const text = cutMarkedText(node.text, [
            undefined,
            selection?.range?.[0],
        ]);
        tr.patch({ nodeId: node.id, patch: { text } })
            .focus(new TextSelection(newNode.id, [0, 0]))
            .dispatch();
    }

    return true;
};

const tryReset = ({ editor }: { editor: Editor }) => {
    const selection = editor.state.selection as TextSelection;
    const node = editor.state.nodes[selection.nodeId];
    if (node.type === 'text') return false;
    const textSchema = editor.schema.text as CompiledNodeSchema;
    editor
        .createTransaction()
        .patch({ nodeId: node.id, patch: textSchema.patch(node) })
        .dispatch();
    return true;
};
