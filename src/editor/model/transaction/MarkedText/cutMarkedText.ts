import { MarkedText } from '../../types';
import { minifyMarkedText } from './minifyMarkedText';
import { splitMarkedText } from './splitMarkedText';

export const cutMarkedText = (
    text: MarkedText | undefined,
    range: [number | undefined, number] | [number | undefined]
) => {
    const splitNodes = splitMarkedText(text ?? []).slice(
        range[0] ?? 0,
        range[1] ?? undefined
    );
    return minifyMarkedText(splitNodes);
};
