import { MarkSchema } from '../../editor/model/types';

export const uSchema: MarkSchema = {
    inline: true,
    parse: (node: HTMLElement) => {
        if (!node.matches('u')) return false;
        return {};
    },
    serialize: ({ serializedContent }) => `<u>${serializedContent}</u>`,
    attrs: {},
    allowText: true,
    allowChildren: true,
};
