import { Editor } from '../../../model/Editor';
import { TextSelection } from '../../../model/Selection';
import { previousEditable } from '../../../model/queries/previousEditable';
import { getMarkedTextLength } from '../../../transaction/MarkedText/getMarkedTextLength';
import { range } from 'lodash';

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
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (selection.range[0] > 0) {
        editor
            .createTransaction()
            .focus(selection.setCollapsedRange(selection.range[0] - 1))
            .dispatch(false);
        e.preventDefault();
        e.stopPropagation();
        return;
    }
    e.preventDefault();
    e.stopPropagation();
    const targetSelection = getTargetSelection(editor);
    if (!targetSelection) return;
    editor.createTransaction().focus(targetSelection).dispatch(false);
};
