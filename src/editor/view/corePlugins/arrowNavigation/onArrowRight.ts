import { Editor } from '../../../model/Editor';
import { TextSelection } from '../../../model/Selection';
import { nextEditable } from '../../../model/queries/nextEditable';

const getTargetSelection = (editor: Editor) => {
    const selection = editor.state.selection as TextSelection;
    const previousNode = editor.runQuery(nextEditable(selection.nodeId));
    if (!previousNode) return;
    return new TextSelection(previousNode?.id, [0, 0]);
};

export const onArrowRight = (e: KeyboardEvent, editor: Editor) => {
    const selection = editor.state.selection as TextSelection;
    const previousNodeTextLength = selection.getTextLength(editor.state);
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const range = selection.range;
    if (range[0] < range[1]) return;
    if (range[0] < previousNodeTextLength) {
        editor
            .createTransaction()
            .focus(selection.setCollapsedRange(range[0] + 1))
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
