import { Editor } from '../..';
import { TextSelection } from '../..';
import { joinMarkedTexts } from '../..';
import { TransactionBuilder } from '../..';

export const onDelete = ({ editor }: { editor: Editor }): boolean => {
    const selection = editor.state.selection as TextSelection;
    const textLength = selection.getTextLength(editor.state);

    const range = selection?.range;
    if (range?.[0] !== textLength || range?.[1] !== textLength) return false;

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
        const { parentId } = editor.runQuery(({ nodes }) => nodes[nextId]);
        if (!parentId) return false;
        unwrapChildren({ nodeId: nextId, editor, transaction });

        const text = joinMarkedTexts(node.text, next.text);
        transaction
            .patch({ nodeId: node.id, patch: { text } })
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
    const { parentId } = editor.runQuery(({ nodes }) => nodes[nodeId]);
    if (!parentId) return;
    const node = editor.state.nodes[nodeId];
    (node.childrenIds ?? [])
        .slice()
        .reverse()
        .forEach((childId) => {
            const child = editor.state.nodes[childId];
            transaction
                .removeFrom({ parentId: nodeId, nodeId: childId })
                .insertAfter({ node: child, parentId, after: nodeId });
        });
};
