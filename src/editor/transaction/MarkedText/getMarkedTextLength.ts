import { MarkedText } from '../../model/types';

export const getMarkedTextLength = (text: MarkedText) => {
    return text.reduce((prev, acc) => prev + acc.s.length, 0);
    // return splitMarkedText(text).length;
};
