import { unwrap } from './unwrap';
import { nodesBehaviors } from './behaviors.config';
import { Editor, Node, TextSelection, View } from '../../indexed';
import { tryReset } from './actions/tryReset';

export const onBackspace = ({
    editor,
    view,
}: {
    editor: Editor;
    view: View;
}): boolean => {
    const selection = editor.selection as TextSelection;
    if (selection?.range?.[0] !== 0 || selection?.range?.[1] !== 0)
        return false;
    if (selection.nodeId === editor.rootId) return true;
    return [tryReset, tryUnwrap, tryRemove].some((callback) =>
        callback({ editor, view })
    );
};

const tryUnwrap = ({ editor }: { editor: Editor }) => {
    const selection = editor.selection as TextSelection;
    const nodeId = selection.nodeId;
    const node = editor.getNode(nodeId);
    if (!node) return false;
    const parentId = editor.getParentId(nodeId);
    if (!parentId) return false;
    const parent = editor.getNode(parentId);
    if (!parent) return false;
    if (!nodesBehaviors[parent.type].unwrapOnBackspaceParent) return false;

    if (
        (!editor.isFirstChild(nodeId) || parent.allowText) &&
        !editor.isLastChild(nodeId)
    ) {
        return false;
    }
    const unwrapped = editor.runCommand(unwrap({ nodeId: selection.nodeId }));
    return unwrapped !== false;
};

const tryRemove = ({ editor, view }: { editor: Editor; view: View }) => {
    const selection = editor.selection as TextSelection;
    const node = editor.getNode(selection.nodeId);
    if (!node) return false;

    const prev = view.getNextDisplayedNode(node.id, -1);
    if (!prev) return false;

    const parentId = editor.getParentId(node.id);
    if (!parentId) return false;

    const transaction = editor.createTransaction();

    if (prev.allowText) {
        (node.childrenIds ?? [])
            .slice()
            .reverse()
            .forEach((childId) => {
                transaction
                    .removeFrom({ parentId: node.id, nodeId: childId })
                    .insertAfter({
                        node: editor.getNode(childId) as Node,
                        parentId,
                        after: node.id,
                    });
            });

        const prevTextLength = prev.getTextLength();
        const prevText = Node.joinMarkedTexts(prev.text, node.text);
        transaction
            .removeFrom({ parentId, nodeId: node.id })
            .patch({ nodeId: prev.id, patch: { text: prevText } })
            .focus(
                new TextSelection(prev.id, [prevTextLength, prevTextLength])
            );
    } else {
        const { parentId } = editor.runQuery(({ nodes }) => nodes[prev.id]);
        if (!parentId) return false;
        transaction
            .removeFrom({ parentId, nodeId: prev.id })
            .focus(selection.clone());
    }

    transaction.dispatch();
    return true;
};
