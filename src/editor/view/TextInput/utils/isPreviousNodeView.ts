import { MarkedText, Node } from '../../../model';

export const isPreviousNodeView = (text: MarkedText, pos: number) => {
    const splitText = Node.splitMarkedText(text);
    const char = splitText?.[pos - 1];
    return !!char && Node.isCharNodeView({ char: char });
};
