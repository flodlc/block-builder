import { NodeSchema } from '../../editor/model/types';

export const quoteSchema: NodeSchema = {
    serialize: ({ serializedChildren }) => {
        return `<blockquote>${serializedChildren}</blockquote>`;
    },
    parse: (node: HTMLElement) => {
        if (!node.matches('blockquote')) return false;
        return {};
    },
    attrs: {},
    allowText: false,
    allowChildren: true,
};
