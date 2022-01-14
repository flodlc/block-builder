import { MarkedText } from '../../types';
import { splitMarkedText } from './splitMarkedText';
import { minifyMarkedText } from './minifyMarkedText';

export const joinMarkedTexts = (
    text1: MarkedText | undefined,
    text2: MarkedText | undefined,
    text3?: MarkedText | undefined
) => {
    const splitNodes = splitMarkedText(text1 ?? [])
        .concat(splitMarkedText(text2 ?? []))
        .concat(splitMarkedText(text3 ?? []));
    return minifyMarkedText(splitNodes);
};
