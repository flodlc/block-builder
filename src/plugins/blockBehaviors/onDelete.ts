import { Editor } from '../../editor/model/Editor';
import { TextSelection } from '../../editor/model/Selection';
import { joinMarkedTexts } from '../../editor/transaction/MarkedText/joinMarkedTexts';
import { TransactionBuilder } from '../../editor/transaction/TransactionBuilder';

export const onDelete = ({ editor }: { editor: Editor }): boolean => {
    const selection = editor.state.selection as TextSelection;
    const textLength = selection.getTextLength(editor.state);

    if (
        selection?.range?.[0] !== textLength ||
        selection?.range?.[1] !== textLength
    )
        return false;

    const node = editor.state.nodes[selection.nodeId];

    const nextId = editor.runQuery((resolvedState) => {
        const index = resolvedState.flatTree.indexOf(node.id);
        return resolvedState.flatTree[index + 1];
    });
    if (!nextId) return false;
    const next = editor.state.nodes[nextId];

    const transaction = editor.createTransaction();
    if (node.childrenIds?.length && editor.state.rootId !== node.id) {
        unwrapChildren({ nodeId: node.id, editor, transaction });
    } else {
        const parentId = editor.runQuery(
            (resolvedState) => resolvedState.nodes[nextId].parentId
        );
        if (!parentId) return false;
        unwrapChildren({ nodeId: nextId, editor, transaction });
        transaction
            .patch({
                nodeId: node.id,
                patch: {
                    text: joinMarkedTexts(node.text, next.text),
                },
            })
            .removeFrom({ nodeId: nextId, parentId });
    }
    transaction.focus(selection.clone()).dispatch();
    return true;
};

const unwrapChildren = ({
    editor,
    nodeId,
    transaction,
}: {
    editor: Editor;
    nodeId: string;
    transaction: TransactionBuilder;
}) => {
    const parentId = editor.runQuery(
        (resolvedState) => resolvedState.nodes[nodeId].parentId
    );
    if (!parentId) return;
    const node = editor.state.nodes[nodeId];
    (node.childrenIds ?? [])
        .slice()
        .reverse()
        .forEach((childId) => {
            const child = editor.state.nodes[childId];
            transaction
                .removeFrom({
                    parentId: nodeId,
                    nodeId: childId,
                })
                .insertAfter({
                    node: child,
                    parent: parentId,
                    after: nodeId,
                });
        });
};
