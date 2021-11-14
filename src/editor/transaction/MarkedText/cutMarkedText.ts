import { MarkedText } from '../../model/types';
import { minifyMarkedText } from './minifyMarkedText';
import { splitMarkedText } from './splitMarkedText';

export const cutMarkedText = (
    text: MarkedText | undefined,
    range: [number | undefined, number] | [number | undefined]
) => {
    const splittedNodes = splitMarkedText(text ?? []).slice(
        range[0] ?? 0,
        range[1] ?? undefined
    );
    return minifyMarkedText(splittedNodes);
};
