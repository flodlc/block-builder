import { Editor } from '../../editor/model/Editor';
import { TextSelection } from '../../editor/model/Selection';
import { previousEditable } from '../../editor/model/queries/previousEditable';
import { getMarkedTextLength } from '../../editor/transaction/MarkedText/getMarkedTextLength';
import { View } from '../../editor/view/View';

const isFirstLine = (editor: Editor) => {
    const selection = editor.state.selection as TextSelection;
    const currentCaretCoords = View.getDomRectAtPos(
        selection.nodeId,
        selection.range[0]
    );
    const startRectOfCurrentEditable = View.getDomRectAtPos(
        selection.nodeId,
        0
    );
    return (
        startRectOfCurrentEditable &&
        currentCaretCoords &&
        currentCaretCoords?.top === startRectOfCurrentEditable?.top
    );
};

const getDistance = (selectionRect: DOMRect, charRect: DOMRect) => {
    return Math.sqrt(
        Math.pow(charRect.left - selectionRect.left, 2) +
            Math.pow(charRect.bottom - selectionRect.top, 2)
    );
};

const getPreviousTargetSelection = (editor: Editor) => {
    const selection = editor.state.selection as TextSelection;
    const previousNode = editor.runQuery(previousEditable(selection.nodeId));
    if (!previousNode) return;
    const selectionRect = View.getDomRectAtPos(
        selection.nodeId,
        selection.range[0]
    );
    const previousNodeTextLength = getMarkedTextLength(previousNode.text ?? []);
    let targetPos = previousNodeTextLength;
    let targetDistance = 100000;
    for (let pos = previousNodeTextLength; pos >= 0; pos--) {
        const rectAtPos = View.getDomRectAtPos(previousNode.id, pos);
        const distanceWithPos = getDistance(selectionRect, rectAtPos);
        if (distanceWithPos < targetDistance) {
            targetPos = pos;
            targetDistance = getDistance(selectionRect, rectAtPos);
        } else {
            break;
        }
    }
    return new TextSelection(previousNode.id, [targetPos, targetPos]);
};

export function onArrowUp(e: KeyboardEvent, editor: Editor) {
    if (!isFirstLine(editor)) return;
    e.preventDefault();
    e.stopPropagation();
    const targetSelection = getPreviousTargetSelection(editor);
    if (!targetSelection) return;
    editor.createTransaction().focus(targetSelection).dispatch(false);
}
