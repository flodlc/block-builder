import { Editor } from '../../../model';
import { TextSelection } from '../../../model';
import { View } from '../../View';

const getTargetSelection = (editor: Editor, view: View) => {
    const selection = editor.state.selection as TextSelection;
    const previousNode = view.getNextDisplayedTextField(selection.nodeId, -1);
    if (!previousNode) return;

    const previousNodeTextLength = previousNode.getTextLength();
    return new TextSelection(previousNode?.id, [
        previousNodeTextLength,
        previousNodeTextLength,
    ]);
};

export const onArrowLeft = (e: KeyboardEvent, editor: Editor, view: View) => {
    const selection = editor.state.selection as TextSelection;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const range = selection.range;
    if (range[0] < range[1]) return;
    if (range[0] > 0) {
        editor
            .createTransaction()
            .focus(selection.setCollapsedRange(range[0] - 1))
            .dispatch(false);
        e.preventDefault();
        e.stopPropagation();
        return;
    }
    e.preventDefault();
    e.stopPropagation();
    const targetSelection = getTargetSelection(editor, view);
    if (!targetSelection) return;
    editor.createTransaction().focus(targetSelection).dispatch(false);
};
