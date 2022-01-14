import { MarkedText } from '../../../model';
import { isCharNodeView } from '../../../model';
import { splitMarkedText } from '../../../model';

export const isPreviousNodeView = (text: MarkedText, pos: number) => {
    const splitText = splitMarkedText(text);
    const char = splitText?.[pos - 1];
    return !!char && isCharNodeView({ char: char });
};
