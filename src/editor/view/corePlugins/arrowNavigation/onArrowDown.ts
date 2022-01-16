import { Editor } from '../../../model';
import { TextSelection } from '../../../model';
import { View } from '../../View';
import { Coords } from '../../types';

const isLastLine = (editor: Editor, view: View) => {
    const selection = editor.state.selection as TextSelection;
    const currentNode = editor.state.nodes[selection.nodeId];
    const currentCaretCoords = view.getCoordsAtPos(
        currentNode.id,
        selection.range[0]
    );
    const endRectOfCurrentEditable = view.getCoordsAtPos(
        currentNode.id,
        currentNode.getTextLength()
    );

    return (
        endRectOfCurrentEditable &&
        currentCaretCoords &&
        currentCaretCoords?.top === endRectOfCurrentEditable?.top
    );
};

const getDistance = (selectionRect: Coords, charRect: Coords) => {
    return Math.sqrt(
        Math.pow(charRect.left - selectionRect.left, 2) +
            Math.pow(charRect.bottom - selectionRect.top, 2)
    );
};

const getNextTargetSelection = (editor: Editor, view: View) => {
    const selection = editor.state.selection as TextSelection;
    const nextNode = view.getNextDisplayedTextField(selection.nodeId);
    if (!nextNode) return;

    const selectionRect = view.getCoordsAtPos(
        selection.nodeId,
        selection.range[0]
    );
    if (!selectionRect) return;
    const previousNodeTextLength = nextNode.getTextLength();
    let targetPos = previousNodeTextLength;
    let targetDistance = 100000;
    for (let pos = 0; pos <= previousNodeTextLength; pos++) {
        const rectAtPos = view.getCoordsAtPos(nextNode.id, pos);
        if (!rectAtPos) return;
        const distanceWithPos = getDistance(selectionRect, rectAtPos);
        if (distanceWithPos < targetDistance) {
            targetDistance = distanceWithPos;
            targetPos = pos;
        } else {
            break;
        }
    }
    return new TextSelection(nextNode.id, [targetPos, targetPos]);
};

export function onArrowDown(e: KeyboardEvent, editor: Editor, view: View) {
    if (!isLastLine(editor, view)) return;
    e.preventDefault();
    e.stopPropagation();

    const targetSelection = getNextTargetSelection(editor, view);
    if (!targetSelection) return;
    editor.createTransaction().focus(targetSelection).dispatch(false);
}
