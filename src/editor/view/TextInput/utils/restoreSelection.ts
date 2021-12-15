import { getTextNodes } from './getTextNodes';
import { Range as PositionRange } from '../../../model/Selection';

export const restoreSelection = (
    container: HTMLElement,
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
    const docSelection = window.getSelection() as Selection;
    let range: Range;
    if (!container.textContent) {
        range = new Range();
        range.setStart(container, 0);
        range.collapse();
    } else {
        range = getRange(container, textRange);
    }

    if (isCurrentRange(range)) return;
    if (!range) return;
    if (range.collapsed) {
        docSelection.collapse(range.startContainer, range.startOffset);
    } else {
        docSelection.setBaseAndExtent(
            range.startContainer,
            range.startOffset,
            range.endContainer,
            range.endOffset
        );
    }
};

const isCurrentRange = (range: Range) => {
    const docSelection = window.getSelection() as Selection;
    const currentRange = docSelection.rangeCount && docSelection.getRangeAt(0);
    return !!currentRange && areSameDomRanges(range, currentRange);
};

const areSameDomRanges = (rangeA: Range, rangeB: Range) =>
    rangeA.startContainer === rangeB.startContainer &&
    rangeA.startOffset === rangeB.startOffset &&
    rangeA.endContainer === rangeB.endContainer &&
    rangeA.endOffset === rangeB.endOffset;

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
        const nodeLength = isTextNode
            ? node?.textContent?.replace(/\uFEFF/g, '')?.length ?? 1
            : 1;

        if (!fromReady && pos + nodeLength >= textRange[0]) {
            fromReady = setStart({
                range,
                node,
                isTextNode,
                offset: getAdjustedOffset(
                    node.textContent ?? '',
                    textRange[0] - pos
                ),
                isLastNode,
                container,
            });
        }

        if (!toReady && pos + nodeLength >= textRange[1]) {
            toReady = setEnd({
                range,
                node,
                isTextNode,
                offset: getAdjustedOffset(
                    node.textContent ?? '',
                    textRange[1] - pos
                ),
                isLastNode,
                container,
            });
        }

        if (fromReady && toReady) break;
        index++;
        pos += nodeLength;
    }
    return range;
};

function getAdjustedOffset(text: string, pos: number) {
    let realPos = pos;
    const split = text.split('');
    for (let i = 0; i <= split.length; i++) {
        const char = split[i] ?? '';
        if (/\uFEFF/.test(char)) {
            realPos++;
        }
        if (i === realPos) {
            return i;
        }
    }
    return 0;
}

function setStart({
    range,
    node,
    offset,
    isLastNode,
    isTextNode,
    container,
}: //
{
    range: Range;
    node: Node;
    offset: number;
    isLastNode: boolean;
    isTextNode: boolean;
    container: HTMLElement;
}) {
    if (isTextNode) {
        range.setStart(node, offset);
        return true;
    } else {
        if (offset <= 0) {
            const index = getNodeIndexInContainer(container, node);
            range.setStart(container, index);
            return true;
        } else if (isLastNode) {
            const index = getNodeIndexInContainer(container, node);
            range.setStart(container, index + 1);
            return true;
        }
    }
    return false;
}

const getNodeIndexInContainer = (container: HTMLElement, node: Node) => {
    return Array.from(container.childNodes).findIndex(
        (childNode) => childNode === node || childNode.contains(node)
    );
};

function setEnd({
    range,
    node,
    offset,
    isLastNode,
    isTextNode,
    container,
}: {
    range: Range;
    node: Node;
    offset: number;
    isTextNode: boolean;
    isLastNode: boolean;
    container: HTMLElement;
}) {
    if (isTextNode) {
        range.setEnd(node, offset);
        return true;
    } else {
        if (offset <= 0) {
            const index = getNodeIndexInContainer(container, node);
            range.setEnd(container, index);
            return true;
        } else if (isLastNode) {
            const index = getNodeIndexInContainer(container, node);
            range.setEnd(container, index + 1);
            return true;
        }
    }
    return false;
}
