import { Editor } from '../../editor/model/Editor';
import { TextSelection } from '../../editor/model/Selection';
import { previousEditable } from '../../editor/model/queries/previousEditable';
import { getMarkedTextLength } from '../../editor/transaction/MarkedText/getMarkedTextLength';

const getTargetSelection = (editor: Editor) => {
    const selection = editor.state.selection as TextSelection;
    const previousNode = editor.runQuery(previousEditable(selection.nodeId));
    if (!previousNode) return;
    const previousNodeTextLength = getMarkedTextLength(previousNode.text ?? []);
    return new TextSelection(previousNode?.id, [
        previousNodeTextLength,
        previousNodeTextLength,
    ]);
};

export const onArrowLeft = (e: KeyboardEvent, editor: Editor) => {
    const selection = editor.state.selection as TextSelection;
    if (selection.range[0] > 0) return;
    e.preventDefault();
    e.stopPropagation();
    const targetSelection = getTargetSelection(editor);
    if (!targetSelection) return;
    editor.createTransaction().focus(targetSelection).dispatch(false);
};
