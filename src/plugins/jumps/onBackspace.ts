import { unwrap } from './unwrap';
import { Editor } from '../../editor/model/Editor';
import { TextSelection } from '../../editor/model/Selection';
import { joinMarkedTexts } from '../../editor/transaction/MarkedText/joinMarkedTexts';
import { getMarkedTextLength } from '../../editor/transaction/MarkedText/getMarkedTextLength';

export const onBackspace = ({
    editor,
    e,
}: {
    editor: Editor;
    e: KeyboardEvent;
}) => {
    const selection = editor.state.selection as TextSelection;
    if (selection?.range?.[0] !== 0 || selection?.range?.[1] !== 0) return;

    if (tryUnwrap({ e, editor })) {
        return;
    } else if (tryReset({ e, editor })) {
        return;
    } else if (tryRemove({ e, editor })) {
        return;
    }
};

const tryReset = ({ editor, e }: { editor: Editor; e: KeyboardEvent }) => {
    const selection = editor.state.selection as TextSelection;
    const node = editor.state.nodes[selection.nodeId];

    if (node.type !== 'text') {
        editor
            .createTransaction()
            .patch({
                nodeId: node.id,
                patch: editor.schema.text.create(node),
            })
            .dispatch();
        e.preventDefault();
        e.stopPropagation();
        return true;
    }
    return false;
};

const tryUnwrap = ({ editor, e }: { editor: Editor; e: KeyboardEvent }) => {
    const selection = editor.state.selection as TextSelection;

    const parentId = editor.runQuery(
        (resolvedState) => resolvedState.nodes[selection.nodeId].parentId
    );
    if (!parentId) return false;
    const parent = editor.state.nodes[parentId];

    const currentIndex = parent.childrenIds?.indexOf(selection.nodeId) ?? -1;
    if (
        currentIndex > 0 &&
        currentIndex < (parent.childrenIds?.length ?? 0) - 1
    )
        return false;
    const unwrapped = editor.runCommand(unwrap({ nodeId: selection.nodeId }));
    if (unwrapped === false) return false;
    e.preventDefault();
    e.stopPropagation();
    return true;
};

const tryRemove = ({ editor, e }: { editor: Editor; e: KeyboardEvent }) => {
    const selection = editor.state.selection as TextSelection;
    const node = editor.state.nodes[selection.nodeId];

    const prevId = editor.runQuery((resolvedState) => {
        const index = resolvedState.flatTree.indexOf(node.id);
        return resolvedState.flatTree[index - 1];
    });
    const prev = editor.state.nodes[prevId];
    if (!prev) return false;

    const parentId = editor.runQuery(
        (resolvedState) => resolvedState.nodes[node.id].parentId
    );
    if (!parentId) return false;

    const transaction = editor.createTransaction();

    if (
        editor.schema[prev.type].allowText &&
        getMarkedTextLength(prev.text ?? [])
    ) {
        (node.childrenIds ?? [])
            .slice()
            .reverse()
            .forEach((childId) => {
                transaction
                    .removeFrom({
                        parentId: node.id,
                        nodeId: childId,
                    })
                    .insertAfter({
                        node: editor.state.nodes[childId],
                        parent: parentId,
                        after: node.id,
                    });
            });

        transaction
            .removeFrom({
                parentId,
                nodeId: node.id,
            })
            .patch({
                nodeId: prev.id,
                patch: {
                    text: joinMarkedTexts(prev.text, node.text),
                },
            })
            .focus(
                new TextSelection(prev.id, [
                    prev.text ? getMarkedTextLength(prev.text) : 0,
                    prev.text ? getMarkedTextLength(prev.text) : 0,
                ])
            );
    } else {
        transaction
            .removeFrom({
                parentId,
                nodeId: prev.id,
            })
            .focus(selection.clone());
    }

    transaction.dispatch();

    e.preventDefault();
    e.stopPropagation();
    return true;
};
