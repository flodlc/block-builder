import { Mark, MarkedNode, MarkedText } from '../../model/types';
import { splitMarkedText } from './splitMarkedText';
import { minifyMarkedText } from './minifyMarkedText';
import { Range } from '../../model/Selection';

export const hasMark = (text: MarkedText, mark: Mark) =>
    !text.some((textNode) => !textNode?.m?.some((item) => item.t === mark.t));

export const insertMark = (
    text: MarkedText,
    { mark, range }: { mark: Mark; range: Range }
) => {
    const splitNodes = splitMarkedText(text);
    const markedNode: MarkedNode = { s: '•', m: [mark] };
    const markedNodes: MarkedText = splitNodes.slice();
    markedNodes.splice(range[0], range[1] - range[0], markedNode);
    return minifyMarkedText(markedNodes);
};

export const markText = (
    text: MarkedText,
    { mark, range }: { mark: Mark; range: Range }
) => {
    const splitNodes = splitMarkedText(text);
    const markedNodesUpdated: MarkedText = splitNodes
        .slice(range[0], range[1])
        .map((charNode) => {
            const updatedMarks = (charNode.m ?? []).slice();
            const index = updatedMarks.findIndex((item) => item.t === mark.t);
            if (index > -1) {
                updatedMarks.splice(index, 1, mark);
            } else {
                updatedMarks.unshift(mark);
            }
            return {
                ...charNode,
                m: updatedMarks,
            };
        });
    const markedNodes: MarkedText = splitNodes.slice();
    markedNodes.splice(range[0], range[1] - range[0], ...markedNodesUpdated);
    return minifyMarkedText(markedNodes);
};

export const unmarkText = (
    text: MarkedText,
    { mark, range }: { mark: Mark; range: Range }
) => {
    const splitNodes = splitMarkedText(text);
    const markedNodes: MarkedText = splitNodes.map((charNode, i) => {
        if (range[0] <= i && i < range[1]) {
            const marks = (charNode.m ?? []).slice();
            const index = marks.findIndex((item) => item.t === mark.t);
            if (index > -1) {
                marks.splice(index, 1);
            }
            return { ...charNode, m: marks };
        }
        return charNode;
    });
    return minifyMarkedText(markedNodes);
};
