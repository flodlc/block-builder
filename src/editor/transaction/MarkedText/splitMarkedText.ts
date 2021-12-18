import { MarkedNode, MarkedText } from '../../model/types';

export const splitMarkedText = (text: MarkedText) => {
    return text.reduce((prev, curr) => {
        prev.push(...splitMarkedNode(curr));
        return prev;
    }, [] as MarkedText);
};

const splitMarkedNode = (markedNode: MarkedNode): MarkedText => {
    const splitChars = markedNode.s.split('') ?? [];
    return splitChars?.map((char) => ({ s: char, m: markedNode.m }));
};
