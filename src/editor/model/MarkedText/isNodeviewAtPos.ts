import { MarkedText } from '../types';
import { Node } from '../Node/Node';
import { isCharNodeView } from './isCharNodeView';

export const isNodeviewAtPos = (text: MarkedText, pos: number) => {
    const splitText = Node.splitMarkedText(text);
    const char = splitText?.[pos];
    return !!char && isCharNodeView({ char: char });
};
