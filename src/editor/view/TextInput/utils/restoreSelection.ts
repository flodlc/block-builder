import { getTextNodes } from './getTextNodes';
import { TextSelection } from '../../types';

export const restoreSelection = (
    container: HTMLDivElement,
    selection: TextSelection
) => {
    const { from = selection.to, to } = selection;
    const docSelection = window.getSelection() as Selection;
    const nodes = getTextNodes({ node: container });

    if (!nodes.length) {
        container.focus();
        return;
    }

    const range = document.createRange();
    let pos = 0,
        index = 0,
        fromReady = false,
        toReady = false;

    for (const node of nodes) {
        const isTextNode = node.nodeType === 3;
        const isLastNode = index === nodes.length - 1;
        const nodeLength = isTextNode ? node?.textContent?.length ?? 1 : 1;

        if (!fromReady && pos + nodeLength >= from) {
            fromReady = setStart({
                range,
                node,
                isTextNode,
                offset: from - pos,
                isLastNode,
            });
        }

        if (!toReady && pos + nodeLength >= to) {
            toReady = setEnd({
                range,
                node,
                isTextNode,
                offset: to - pos,
                isLastNode,
            });
        }

        if (fromReady && toReady) break;
        index++;
        pos += nodeLength;
    }

    docSelection.removeAllRanges();
    docSelection.addRange(range);
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
