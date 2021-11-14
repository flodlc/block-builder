import { getCaretRect, getCaretRectAt, getLeafNodes, moveCaret } from './utils';
import { getSiblingEditable } from './getSibllingEditable';

const getEndRectOfCurrentEditable = () => {
    const currentNode = document.getSelection()?.focusNode;
    const currentEditable = currentNode?.parentElement?.closest(
        '[contenteditable="true"]'
    );
    const currenttEditableTextNodes = currentEditable
        ? getLeafNodes(currentEditable).reverse()
        : [];
    const currentEditableLastNode = currenttEditableTextNodes[0];
    if (currentEditableLastNode === undefined) return;
    return getCaretRectAt(
        currentEditableLastNode,
        currentEditableLastNode.textContent?.length ?? 0
    );
};

const isLastLine = () => {
    const currentCaretRect = getCaretRect();
    const startRectOfCurrentEditable = getEndRectOfCurrentEditable();
    return (
        startRectOfCurrentEditable &&
        currentCaretRect &&
        currentCaretRect?.top === startRectOfCurrentEditable?.top
    );
};

export function moveCarretDown(e: KeyboardEvent) {
    if (!isLastLine()) return;
    e.preventDefault();
    e.stopPropagation();

    const previousEditable = getSiblingEditable(1);
    if (!previousEditable) {
        return;
    }
    const previousEditableTextNodes = getLeafNodes(previousEditable);

    let targetCaretData: {
        node: Node;
        offset: number;
        left: number;
        bottom: number;
    };
    const currentCaretRect = getCaretRect();
    if (!currentCaretRect) {
        return;
    }
    previousEditableTextNodes.some((node) => {
        for (
            let offset = 0;
            offset <= (node?.textContent?.length ?? 0);
            offset++
        ) {
            const charRect = getCaretRectAt(node, offset);

            const currentInspected = {
                node,
                offset,
                bottom: charRect.top + charRect.height,
                left: charRect.left,
            };
            if (
                !targetCaretData ||
                (currentInspected.bottom <= targetCaretData.bottom &&
                    currentInspected.left <= currentCaretRect.left)
            ) {
                targetCaretData = currentInspected;
            } else {
                return false;
            }
        }
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (targetCaretData !== undefined) {
        moveCaret(targetCaretData.node, targetCaretData.offset);
    }
}
