import { MarkedText } from '../../model/types';
import { minifyMarkedText } from './minifyMarkedText';
import { splitMarkedText } from './splitMarkedText';

export const cutMarkedText = (
    text: MarkedText | undefined,
    { from, to }: { from?: number; to?: number }
) => {
    const splittedNodes = splitMarkedText(text ?? []).slice(
        from ?? 0,
        to ?? undefined
    );
    return minifyMarkedText(splittedNodes);
};
