import { MarkedText } from '../../../model/types';
import { splitMarkedText } from '../../../transaction/MarkedText/splitMarkedText';
import { CompiledSchema } from '../../../model/schema';
import { isCharNodeView } from '../../../transaction/MarkedText/isCharNodeView';

export const isPreviousNodeView = (
    schema: CompiledSchema,
    text: MarkedText,
    pos: number
) => {
    const splitText = splitMarkedText(text);
    const char = splitText?.[pos - 1];
    return !!char && isCharNodeView({ schema, char: char });
};
