import { MarkedText } from '../../model/types';
import { splitMarkedText } from './splitMarkedText';
import { minifyMarkedText } from './minifyMarkedText';

export const joinMarkedTexts = (
    text1: MarkedText | undefined,
    text2: MarkedText | undefined
) => {
    const splittedNodes = splitMarkedText(text1 ?? []).concat(
        splitMarkedText(text2 ?? [])
    );
    return minifyMarkedText(splittedNodes);
};
