import { Editor, Node } from '../../indexed';
import { TextSelection } from '../../indexed';
import { TransactionBuilder } from '../../indexed';

export const onDelete = ({ editor }: { editor: Editor }): boolean => {
    const selection = editor.selection as TextSelection;
    const node = editor.getNode(selection.nodeId);
    if (!node) return false;
    const textLength = node.getTextLength();

    const range = selection?.range;
    if (range?.[0] !== textLength || range?.[1] !== textLength) return false;

    const transaction = editor.createTransaction();
    if (node.childrenIds?.length && editor.rootId !== node.id) {
        unwrapChildren({ nodeId: node.id, editor, transaction });
    } else {
        const nextId = editor.runQuery((resolvedState) => {
            const index = resolvedState.flatTree.indexOf(node.id);
            return resolvedState.flatTree[index + 1];
        });
        const next = nextId && editor.getNode(nextId);
        if (!next) return false;
        const parentId = editor.getParentId(nextId);
        if (!parentId) return false;
        unwrapChildren({ nodeId: nextId, editor, transaction });

        const text = Node.joinMarkedTexts(node.text, next.text);
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
    const node = editor.getNode(nodeId);
    (node?.childrenIds ?? [])
        .slice()
        .reverse()
        .forEach((childId) => {
            const child = editor.getNode(childId) as Node;
            transaction
                .removeFrom({ parentId: nodeId, nodeId: childId })
                .insertAfter({ node: child, parentId, after: nodeId });
        });
};
