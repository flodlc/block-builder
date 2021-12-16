import { CompiledSchema } from '../../model/schema';
import { MarkedNode } from '../../model/types';

export const isCharNodeView = ({
    schema,
    char,
}: {
    schema: CompiledSchema;
    char: MarkedNode;
}) => {
    const lastMark = char.m?.[(char.m?.length ?? 0) - 1];
    return !!lastMark && !schema[lastMark?.t].allowText;
};
