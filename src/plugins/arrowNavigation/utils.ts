export function getLeafNodes(element: Element, leafNodes: Node[] = []): Node[] {
    let newLeafNodes = [...leafNodes];
    element.childNodes.forEach((child) => {
        if (
            child.nodeType === 3 ||
            (child.nodeType === 1 && !child?.textContent?.length)
        ) {
            newLeafNodes = [...newLeafNodes, child];
        } else if (child.nodeType === 1) {
            newLeafNodes = [
                ...newLeafNodes,
                ...getLeafNodes(child as HTMLElement),
            ];
        }
    });
    return newLeafNodes;
}

export function moveCaret(node: Node, offset: number) {
    const targetRange = createCollapsedRange(node, offset);
    targetRange.setStart(node, offset);
    targetRange.setEnd(node, offset);
    const selection = window.getSelection();
    if (!selection) {
        return;
    }
    selection.removeAllRanges();
    selection.addRange(targetRange);
    focusSelection();
}

export function focusSelection() {
    const PADDING = 80;
    const selection = window.getSelection();
    if (!selection || !selection?.focusNode) return;

    const selectionRect = getCaretRectAt(
        selection.focusNode,
        selection.focusOffset
    );
    const scrollElement = getScrollParent(selection.focusNode.parentElement);
    if (!scrollElement) return;

    const selectionRectOffset =
        selectionRect.top - scrollElement.getBoundingClientRect().top;

    if (selectionRectOffset < PADDING) {
        scrollElement.scrollTo({
            top: selectionRectOffset + scrollElement.scrollTop - PADDING,
        });
    } else if (
        scrollElement.offsetHeight +
            scrollElement.scrollTop -
            selectionRect.bottom <
        PADDING
    ) {
        scrollElement.scrollTo({
            top:
                selectionRect.top -
                selectionRectOffset +
                scrollElement.scrollTop +
                PADDING,
        });
    }
}

export function createCollapsedRange(node: Node, offset: number) {
    const range = document.createRange();
    range.setStart(node, offset);
    range.setEnd(node, offset);
    return range;
}

export function getCaretRectAt(node: Node, offset: number) {
    if (node.nodeType === 3 && node.textContent === '') {
        node = node.parentElement as HTMLElement;
    }
    if (node.nodeType === 1) {
        return (node as Element).getBoundingClientRect();
    }
    const range = createCollapsedRange(node, offset);
    return range.getBoundingClientRect();
}

export function getCaretRect() {
    const selection = document.getSelection();
    if (!selection?.focusNode) {
        return;
    }
    return getCaretRectAt(selection.focusNode, selection.focusOffset);
}

export const getScrollParent = (
    element: HTMLElement | null
): HTMLElement | null => {
    if (element === null) return null;
    if (element.scrollHeight > element.clientHeight) {
        return element;
    } else {
        return getScrollParent(element.parentElement);
    }
};
