import { Editor } from '../../editor/model/Editor';
import { TextSelection } from '../../editor/model/Selection';
import { nextEditable } from '../../editor/model/queries/nextEditable';

const getTargetSelection = (editor: Editor) => {
    const selection = editor.state.selection as TextSelection;
    const previousNode = editor.runQuery(nextEditable(selection.nodeId));
    if (!previousNode) return;
    return new TextSelection(previousNode?.id, [0, 0]);
};

export const onArrowRight = (e: KeyboardEvent, editor: Editor) => {
    const selection = editor.state.selection as TextSelection;
    const previousNodeTextLength = selection.getTextLength(editor.state);
    if (selection.range[0] < previousNodeTextLength) return;
    e.preventDefault();
    e.stopPropagation();
    const targetSelection = getTargetSelection(editor);
    if (!targetSelection) return;
    editor.createTransaction().focus(targetSelection).dispatch(false);
};
