import { Mark, MarkedNode, MarkedText } from '../../types';
import { splitMarkedText } from './splitMarkedText';
import { minifyMarkedText } from './minifyMarkedText';
import { Range } from '../../Selection';

export const hasMark = (text: MarkedText, mark: Mark) =>
    !!text.length &&
    !text.some(
        (textNode) => !textNode?.marks?.some((item) => item.type === mark.type)
    );

export const insertNodeMark = (
    text: MarkedText,
    { type, range, attrs }: { type: string; attrs: any; range: Range }
) => {
    const splitNodes = splitMarkedText(text);
    const markedNode: MarkedNode = { text: '•', type, attrs };
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
            const updatedMarks = (charNode.marks ?? []).slice();
            const index = updatedMarks.findIndex(
                (item) => item.type === mark.type
            );
            if (index > -1) {
                updatedMarks.splice(index, 1, mark);
            } else {
                updatedMarks.unshift(mark);
            }
            return {
                ...charNode,
                marks: updatedMarks,
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
            const marks = (charNode.marks ?? []).slice();
            const index = marks.findIndex((item) => item.type === mark.type);
            if (index > -1) {
                marks.splice(index, 1);
            }
            return { ...charNode, marks: marks };
        }
        return charNode;
    });
    return minifyMarkedText(markedNodes);
};
