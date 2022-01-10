import { MarkedText } from '../../../model/types';
import { splitMarkedText } from '../../../transaction/MarkedText/splitMarkedText';
import { isCharNodeView } from '../../../transaction/MarkedText/isCharNodeView';

export const isPreviousNodeView = (text: MarkedText, pos: number) => {
    const splitText = splitMarkedText(text);
    const char = splitText?.[pos - 1];
    return !!char && isCharNodeView({ char: char });
};
