import { Editor } from '../../indexed';
import { BlockSelection, TextSelection } from '../../indexed';

export const onEnter = ({ editor }: { editor: Editor }) => {
    const selection = editor.state.selection as BlockSelection;
    const firstNodeId = Array.from(selection.nodeIds.keys())[0];
    const firstNode = editor.state.nodes[firstNodeId];
    const textLength = firstNode.getTextLength();
    if (firstNode.allowText) {
        editor
            .createTransaction()
            .focus(
                new TextSelection(Array.from(selection.nodeIds.keys())[0], [
                    textLength,
                    textLength,
                ])
            )
            .dispatch(false);
    } else {
        const { parentId } = editor.runQuery(({ nodes }) => nodes[firstNodeId]);
        if (!parentId) return;

        const newNode = editor.createNode('text');
        editor
            .createTransaction()
            .insertAfter({
                after: firstNodeId,
                parentId,
                node: newNode,
            })
            .focus(new TextSelection(newNode.id, [0, 0]))
            .dispatch();
    }
};
