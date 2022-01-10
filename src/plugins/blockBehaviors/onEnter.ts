import { Editor } from '../../editor/model/Editor';
import { cutMarkedText } from '../../editor/transaction/MarkedText/cutMarkedText';
import { TextSelection } from '../../editor/model/Selection';
import { nodesBehaviors } from './behaviors.config';
import { CompiledNodeSchema } from '../../editor/model/types';

export const onEnter = ({ editor }: { editor: Editor }): boolean => {
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
        const parentId = editor.runQuery(
            (resolvedState) => resolvedState.nodes[node.id].parentId
        );
        if (!parentId) return false;
        const previousId = editor.runQuery(
            (resolvedState) => resolvedState.nodes[node.id].previousId
        );

        const textSchema = editor.schema.text as CompiledNodeSchema;
        tr.insertAfter({
            parent: parentId,
            after: previousId,
            node: textSchema.create(),
        })
            .focus(selection.clone())
            .dispatch();
        return true;
    } else if (!node.childrenIds?.length) {
        const parentId = editor.runQuery(
            (resolvedState) => resolvedState.nodes[node.id].parentId
        );
        if (!parentId) return false;

        tr.insertAfter({
            node: newNode,
            parent: parentId,
            after: node.id,
        });
    } else {
        tr.insertAfter({
            node: newNode,
            parent: node.id,
        });
    }

    tr.patch({
        nodeId: node.id,
        patch: {
            text: cutMarkedText(node.text, [undefined, selection?.range?.[0]]),
        },
    })
        .focus(new TextSelection(newNode.id, [0, 0]))
        .dispatch();

    return true;
};
