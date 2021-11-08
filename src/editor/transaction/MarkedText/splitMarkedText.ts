import { MarkedNode, MarkedText } from '../../model/types';

export const splitMarkedText = (text: MarkedText) => {
    return text.reduce((prev, curr) => {
        const newNodes = splitMarkedNode(curr);
        return [...prev, ...newNodes];
    }, [] as MarkedText);
};

const splitMarkedNode = (markedNode: MarkedNode): MarkedText => {
    const splittedChars = markedNode.s.split('') ?? [];
    const marks = markedNode.m;
    return splittedChars?.map((char) =>
        marks ? { s: char, m: marks } : { s: char }
    );
};
