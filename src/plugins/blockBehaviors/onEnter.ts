import { Editor, Node } from '../../indexed';
import { TextSelection } from '../../indexed';
import { View } from '../../indexed';
import { nodesBehaviors } from './behaviors.config';
import { tryReset } from './actions/tryReset';

export const onEnter = ({
    editor,
    view,
}: {
    editor: Editor;
    view: View;
}): boolean => {
    if (tryResetOnEmpty({ editor })) {
        return true;
    } else if (insertLineAtTop({ editor })) {
        return true;
    } else if (insertNodeAfter({ editor, view })) {
        return true;
    }
    return false;
};

const tryResetOnEmpty = ({ editor }: { editor: Editor }) => {
    const selection = editor.state.selection as TextSelection;
    const node = editor.getNode(selection.nodeId);
    if (!node) return false;
    if (node.text?.length) return false;
    if (nodesBehaviors[node.type].resetOnEmptyEnter) {
        return tryReset({ editor });
    }
};

const insertLineAtTop = ({ editor }: { editor: Editor }) => {
    const selection = editor.state.selection as TextSelection;
    const nodeId = selection.nodeId;
    const parentId = editor.getParentId(nodeId);
    if (!parentId) return false;
    if (selection.range[0] === 0) {
        const { previousId } = editor.runQuery(({ nodes }) => nodes[nodeId]);

        const textNode = editor.createNode('text');
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
    const node = editor.getNode(selection.nodeId);
    if (!node) return false;
    const parentId = editor.getParentId(node.id);

    const tr = editor.createTransaction();

    if (view.hasDisplayedChildren(node.id)) {
        const newNode = editor.createNode('text', {
            text: Node.copyText(node.text, [selection?.range[1]]),
        });
        tr.insertAfter({ node: newNode, parentId: node.id });

        const text = Node.copyText(node.text, [
            undefined,
            selection?.range?.[0],
        ]);
        tr.patch({ nodeId: node.id, patch: { text } })
            .focus(new TextSelection(newNode.id, [0, 0]))
            .dispatch();
    } else {
        if (!parentId) return false;
        const shouldKeepFormat = nodesBehaviors[node.type].keepFormatOnEnter;
        const newNodeType = shouldKeepFormat ? node.type : 'text';
        const newNode = editor.createNode(newNodeType, {
            text: Node.copyText(node.text, [selection?.range[1]]),
        });
        tr.insertAfter({ node: newNode, parentId, after: node.id });
        const text = Node.copyText(node.text, [
            undefined,
            selection?.range?.[0],
        ]);
        tr.patch({ nodeId: node.id, patch: { text } })
            .focus(new TextSelection(newNode.id, [0, 0]))
            .dispatch();
    }

    return true;
};
