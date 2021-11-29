import { getTextNodes } from './getTextNodes';
import {
    Range as PositionRange,
    TextSelection,
} from '../../../model/Selection';
import { getElementSelection } from './getElementSelection';

export const restoreSelection = (
    container: HTMLDivElement,
    textRange?: PositionRange
) => {
    if (!textRange) {
        const docSelection = window.getSelection() as Selection;
        if (
            docSelection.focusNode &&
            container.contains(docSelection.focusNode)
        ) {
            docSelection.removeAllRanges();
            container.blur();
            return;
        }
        return;
    }
    const domRange = getElementSelection(container as HTMLDivElement);
    if (domRange && TextSelection.areSameRange(textRange, domRange)) {
        container.focus();
        return;
    }

    if (!container.textContent) {
        container.focus();
        return;
    }
    const range = getRange(container, textRange);

    const docSelection = window.getSelection() as Selection;
    docSelection.removeAllRanges();
    docSelection.addRange(range);
};

export const getRange = (container: HTMLElement, textRange: PositionRange) => {
    const nodes = getTextNodes({ node: container }, true);
    const range = document.createRange();
    let pos = 0,
        index = 0,
        fromReady = false,
        toReady = false;
    if (!nodes.length) {
        range.setStart(container, 0);
        range.collapse(true);
    }
    for (const node of nodes) {
        const isTextNode = node.nodeType === 3;
        const isLastNode = index === nodes.length - 1;
        const nodeLength = isTextNode ? node?.textContent?.length ?? 1 : 1;

        if (!fromReady && pos + nodeLength >= textRange[0]) {
            fromReady = setStart({
                range,
                node,
                isTextNode,
                offset: textRange[0] - pos,
                isLastNode,
            });
        }

        if (!toReady && pos + nodeLength >= textRange[1]) {
            toReady = setEnd({
                range,
                node,
                isTextNode,
                offset: textRange[1] - pos,
                isLastNode,
            });
        }

        if (fromReady && toReady) break;
        index++;
        pos += nodeLength;
    }
    return range;
};

function setStart({
    range,
    node,
    offset,
    isLastNode,
    isTextNode,
}: {
    range: Range;
    node: Node;
    offset: number;
    isLastNode: boolean;
    isTextNode: boolean;
}) {
    if (isTextNode) {
        range.setStart(node, offset);
        return true;
    } else {
        if (offset <= 0) {
            range.setStartBefore(node);
            return true;
        } else if (isLastNode) {
            range.setStartAfter(node);
            return true;
        }
    }
    return false;
}

function setEnd({
    range,
    node,
    offset,
    isLastNode,
    isTextNode,
}: {
    range: Range;
    node: Node;
    offset: number;
    isTextNode: boolean;
    isLastNode: boolean;
}) {
    if (isTextNode) {
        range.setEnd(node, offset);
        return true;
    } else {
        if (offset <= 0) {
            range.setEndBefore(node);
            return true;
        } else if (isLastNode) {
            range.setEndAfter(node);
            return true;
        }
    }
    return false;
}
