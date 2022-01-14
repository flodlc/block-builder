import { MarkSchema } from '../../editor/model';

export const iSchema: MarkSchema = {
    inline: true,
    parse: (node: HTMLElement) => {
        if (!node.matches('i, em')) return false;
        return {};
    },
    serialize: ({ serializedContent }) => `<em>${serializedContent}</em>`,
    attrs: {},
    allowText: true,
    allowChildren: true,
};
