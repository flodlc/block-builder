import { Mark, MarkedNode, MarkedText } from '../../model/types';
import { splitMarkedText } from './splitMarkedText';
import { minifyMarkedText } from './minifyMarkedText';

export const hasMark = (text: MarkedText, mark: Mark) =>
    !text.some((textNode) => !textNode?.m?.some((item) => item.t === mark.t));

export const insertMark = (
    text: MarkedText,
    { mark, from, to }: { mark: Mark; from: number; to: number }
) => {
    const splittedNodes = splitMarkedText(text);
    const markedNode: MarkedNode = { s: 'm', m: [mark] };
    const markedNodes: MarkedText = splittedNodes.slice();
    markedNodes.splice(from, to - from, markedNode);
    return minifyMarkedText(markedNodes);
};

export const markText = (
    text: MarkedText,
    { mark, from, to }: { mark: Mark; from: number; to: number }
) => {
    const splittedNodes = splitMarkedText(text);
    const markedNodesUpdated: MarkedText = splittedNodes
        .slice(from, to)
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
    const markedNodes: MarkedText = splittedNodes.slice();
    markedNodes.splice(from, to - from, ...markedNodesUpdated);
    return minifyMarkedText(markedNodes);
};

export const unmarkText = (
    text: MarkedText,
    { mark, from, to }: { mark: Mark; from: number; to: number }
) => {
    const splittedNodes = splitMarkedText(text);
    const markedNodes: MarkedText = splittedNodes.map((charNode, i) => {
        if (from <= i && i < to) {
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
