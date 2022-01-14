import { MarkedNode, MarkedText } from '../../types';

export const splitMarkedText = (text: MarkedText) => {
    return text.reduce((prev, curr) => {
        prev.push(...splitMarkedNode(curr));
        return prev;
    }, [] as MarkedText);
};

const splitMarkedNode = (markedNode: MarkedNode): MarkedText => {
    const splitChars = markedNode.text.split('') ?? [];
    return splitChars?.map((char) => ({
        ...markedNode,
        text: char,
    }));
};
