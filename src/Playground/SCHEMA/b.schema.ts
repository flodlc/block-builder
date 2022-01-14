import { MarkSchema } from '../../editor/model';

export const bSchema: MarkSchema = {
    inline: true,
    parse: (node: HTMLElement) => {
        if (!node.matches('b, strong')) return false;
        return {};
    },
    serialize: ({ serializedContent }) =>
        `<strong>${serializedContent}</strong>`,
    attrs: {},
    allowText: true,
    allowChildren: true,
};
