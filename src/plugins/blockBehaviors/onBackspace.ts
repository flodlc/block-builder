import { unwrap } from './unwrap';
import { nodesBehaviors } from './behaviors.config';
import {
    Editor,
    getMarkedTextLength,
    joinMarkedTexts,
    TextSelection,
    View,
} from '../../indexed';
import { tryReset } from './actions/tryReset';

export const onBackspace = ({
    editor,
    view,
}: {
    editor: Editor;
    view: View;
}): boolean => {
    const selection = editor.state.selection as TextSelection;
    if (selection?.range?.[0] !== 0 || selection?.range?.[1] !== 0)
        return false;
    if (selection.nodeId === editor.state.rootId) return true;
    return [tryReset, tryUnwrap, tryRemove].some((callback) =>
        callback({ editor, view })
    );
};

const tryUnwrap = ({ editor }: { editor: Editor }) => {
    const selection = editor.state.selection as TextSelection;
    const nodeId = selection.nodeId;
    if (editor.isLastChild(nodeId) || editor.isFirstChild(nodeId)) return false;

    const parentId = editor.getParentId(nodeId);
    if (!parentId) return false;
    const parent = editor.getNode(parentId);
    if (!parent) return false;

    if (!nodesBehaviors[parent.type].unwrapOnBackspaceParent) return false;
    const parentSchema = editor.schema[parent.type];
    if (parentSchema.allowText) return false;

    const unwrapped = editor.runCommand(unwrap({ nodeId: selection.nodeId }));
    return unwrapped !== false;
};

const tryRemove = ({ editor, view }: { editor: Editor; view: View }) => {
    const selection = editor.state.selection as TextSelection;
    const node = editor.state.nodes[selection.nodeId];

    const prev = view.getNextDisplayedNode(node.id, -1);
    if (!prev) return false;

    const { parentId } = editor.runQuery(({ nodes }) => nodes[node.id]);
    if (!parentId) return false;

    const transaction = editor.createTransaction();

    if (editor.schema[prev.type].allowText) {
        (node.childrenIds ?? [])
            .slice()
            .reverse()
            .forEach((childId) => {
                transaction
                    .removeFrom({ parentId: node.id, nodeId: childId })
                    .insertAfter({
                        node: editor.state.nodes[childId],
                        parentId,
                        after: node.id,
                    });
            });

        const prevTextLength = prev.text ? getMarkedTextLength(prev.text) : 0;
        const prevText = joinMarkedTexts(prev.text, node.text);
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
