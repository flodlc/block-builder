import { getCaretRect, getCaretRectAt, getLeafNodes, moveCaret } from './utils';
import { getSiblingEditable } from './getSibllingEditable';

const getStartRectOfCurrentEditable = () => {
    const currentNode = document.getSelection()?.focusNode;
    const currentEditable = currentNode?.parentElement?.closest(
        '[contenteditable="true"]'
    );
    const currenttEditableTextNodes = currentEditable
        ? getLeafNodes(currentEditable).reverse()
        : [];
    const currentEditableFirstNode = currenttEditableTextNodes[0];
    if (currentEditableFirstNode === undefined) return;
    return getCaretRectAt(currentEditableFirstNode, 0);
};

const isFirstLine = () => {
    const currentCaretRect = getCaretRect();
    const startRectOfCurrentEditable = getStartRectOfCurrentEditable();
    return (
        startRectOfCurrentEditable &&
        currentCaretRect &&
        currentCaretRect?.top === startRectOfCurrentEditable?.top
    );
};

export function moveCarretUp(e: KeyboardEvent) {
    if (!isFirstLine()) return;
    e.preventDefault();
    e.stopPropagation();

    const previousEditable = getSiblingEditable(-1);
    const selectedCaretRect = getCaretRect();
    if (!selectedCaretRect) return;

    const previousEditableTextNodes = previousEditable
        ? getLeafNodes(previousEditable).reverse()
        : [];

    let targetCaretData: {
        node: Node;
        offset: number;
        left: number;
        bottom: number;
    };

    previousEditableTextNodes.some((node) => {
        for (
            let offset = node.textContent?.length ?? 0;
            offset >= 0;
            offset--
        ) {
            const charRect = getCaretRectAt(node, offset);

            const currentInspectedChar = {
                node,
                offset,
                bottom: charRect.bottom,
                left: charRect.left,
            };

            if (
                !targetCaretData ||
                (currentInspectedChar.bottom >= targetCaretData.bottom &&
                    currentInspectedChar.left >= selectedCaretRect.left)
            ) {
                targetCaretData = currentInspectedChar;
            } else {
                return true;
            }
        }
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (targetCaretData !== undefined) {
        moveCaret(targetCaretData.node, targetCaretData.offset);
    }
}
