import { NodeSchema } from '../../editor/model';

export const calloutSchema: NodeSchema = {
    attrs: {
        emoji: {
            required: true,
            default: '😺',
        },
    },
    serialize: ({ serializedChildren }) => {
        return `<aside>${serializedChildren}</aside>`;
    },
    parse: (node: HTMLElement) => {
        if (!node.matches('aside')) return false;
        return {};
    },
    allowText: false,
    allowChildren: true,
};
