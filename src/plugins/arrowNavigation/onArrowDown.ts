import { Editor } from '../../editor/model/Editor';
import { TextSelection } from '../../editor/model/Selection';
import { getMarkedTextLength } from '../../editor/transaction/MarkedText/getMarkedTextLength';
import { View } from '../../editor/view/View';
import { nextEditable } from '../../editor/model/queries/nextEditable';

const isLastLine = (editor: Editor) => {
    const selection = editor.state.selection as TextSelection;
    const currentNode = editor.state.nodes[selection.nodeId];
    const currentCaretCoords = View.getDomRectAtPos(
        currentNode.id,
        selection.range[0]
    );
    const endRectOfCurrentEditable = View.getDomRectAtPos(
        currentNode.id,
        selection.getTextLength(editor.state)
    );
    return (
        endRectOfCurrentEditable &&
        currentCaretCoords &&
        currentCaretCoords?.top === endRectOfCurrentEditable?.top
    );
};

const getDistance = (selectionRect: DOMRect, charRect: DOMRect) => {
    return Math.sqrt(
        Math.pow(charRect.left - selectionRect.left, 2) +
            Math.pow(charRect.bottom - selectionRect.top, 2)
    );
};

const getNextTargetSelection = (editor: Editor) => {
    const selection = editor.state.selection as TextSelection;
    const nextNode = editor.runQuery(nextEditable(selection.nodeId));
    if (!nextNode) return;
    const selectionRect = View.getDomRectAtPos(
        selection.nodeId,
        selection.range[0]
    );
    const previousNodeTextLength = getMarkedTextLength(nextNode.text ?? []);
    let targetPos = previousNodeTextLength;
    let targetDistance = 100000;
    for (let pos = 0; pos < previousNodeTextLength; pos++) {
        const rectAtPos = View.getDomRectAtPos(nextNode.id, pos);
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

export function onArrowDown(e: KeyboardEvent, editor: Editor) {
    if (!isLastLine(editor)) return;
    e.preventDefault();
    e.stopPropagation();

    const targetSelection = getNextTargetSelection(editor);
    if (!targetSelection) return;
    editor.createTransaction().focus(targetSelection).dispatch(false);
}
