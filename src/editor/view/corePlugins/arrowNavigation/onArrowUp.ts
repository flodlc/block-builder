import { Editor } from '../../../model';
import { TextSelection } from '../../../model';
import { View } from '../../View';
import { Coords } from '../../types';

const isFirstLine = (editor: Editor, view: View) => {
    const selection = editor.state.selection as TextSelection;
    const currentCaretCoords = view.getCoordsAtPos(
        selection.nodeId,
        selection.range[0]
    );
    const startRectOfCurrentEditable = view.getCoordsAtPos(selection.nodeId, 0);
    return (
        startRectOfCurrentEditable &&
        currentCaretCoords &&
        currentCaretCoords?.top === startRectOfCurrentEditable?.top
    );
};

const getDistance = (selectionRect: Coords, charRect: Coords) => {
    return Math.sqrt(
        Math.pow(charRect.left - selectionRect.left, 2) +
            Math.pow(charRect.bottom - selectionRect.top, 2)
    );
};

const getPreviousTargetSelection = (editor: Editor, view: View) => {
    const selection = editor.state.selection as TextSelection;
    const previousNode = view.getNextDisplayedTextField(selection.nodeId, -1);
    if (!previousNode) return;
    const selectionRect = view.getCoordsAtPos(
        selection.nodeId,
        selection.range[0]
    );
    if (!selectionRect) return;
    const previousNodeTextLength = previousNode.getTextLength();
    let targetPos = previousNodeTextLength;
    let targetDistance = 100000;
    for (let pos = previousNodeTextLength; pos >= 0; pos--) {
        const rectAtPos = view.getCoordsAtPos(previousNode.id, pos);
        if (!rectAtPos) return;
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

export function onArrowUp(e: KeyboardEvent, editor: Editor, view: View) {
    if (!isFirstLine(editor, view)) return;
    e.preventDefault();
    e.stopPropagation();
    const targetSelection = getPreviousTargetSelection(editor, view);
    if (!targetSelection) return;
    editor.createTransaction().focus(targetSelection).dispatch(false);
}
