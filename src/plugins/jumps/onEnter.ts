import { Editor } from '../../editor/model/Editor';
import { cutMarkedText } from '../../editor/transaction/MarkedText/cutMarkedText';
import { TextSelection } from '../../editor/model/Selection';

export const onEnter = ({
    e,
    editor,
}: {
    e: KeyboardEvent;
    editor: Editor;
}) => {
    const selection = editor.state.selection as TextSelection;
    const node = editor.state.nodes[selection.nodeId];
    const newNode = editor.schema.text.create();
    newNode.text = cutMarkedText(node.text, [selection?.range[1]]);

    const tr = editor.createTransaction();

    if (node.type !== 'card') {
        const parentId = editor.runQuery(
            (resolvedState) => resolvedState.nodes[node.id].parentId
        );
        if (!parentId) return;

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

    e.preventDefault();
    e.stopPropagation();
};
