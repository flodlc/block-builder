import { MarkedText } from '../../../../model/types';
import { splitMarkedText } from '../../../../transaction/MarkedText/splitMarkedText';

export const isPreviousEditable = (text: MarkedText, pos: number) => {
    const splittedText = splitMarkedText(text);
    return splittedText?.[pos - 1]?.m?.some((mark) => mark.t === 'mention');
};
