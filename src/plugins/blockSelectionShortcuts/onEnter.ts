import { Editor } from '../../editor/model/Editor';
import { BlockSelection, TextSelection } from '../../editor/model/Selection';
import { getMarkedTextLength } from '../../editor/transaction/MarkedText/getMarkedTextLength';

export const onEnter = ({ editor }: { editor: Editor }) => {
    const selection = editor.state.selection as BlockSelection;
    const firstNodeId = Array.from(selection.nodeIds.keys())[0];
    const firstNode = editor.state.nodes[firstNodeId];
    const textLength = getMarkedTextLength(firstNode.text ?? []);
    editor
        .createTransaction()
        .focus(
            new TextSelection(Array.from(selection.nodeIds.keys())[0], [
                textLength,
                textLength,
            ])
        )
        .dispatch();
};
