import { MarkSchema } from '../../editor/model/types';

export const linkSchema: MarkSchema = {
    inline: true,
    parse: (node: HTMLElement) => {
        if (!node.matches('a')) return false;
        return { data: { href: node.getAttribute('href') } };
    },
    serialize: ({ serializedContent, mark }) =>
        `<a href=${mark.data.href}>${serializedContent}</a>`,
    attrs: {
        href: {
            default: '',
            required: false,
        },
    },
    allowText: true,
    allowChildren: true,
};
