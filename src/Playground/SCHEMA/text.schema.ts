import { NodeSchema } from '../../editor/model/types';

export const textSchema: NodeSchema = {
    parse: (node: HTMLElement) => {
        if (!node.matches('p')) return false;
        return {};
    },
    serialize: ({ serializedText, serializedChildren }) => {
        if (!serializedText) return serializedChildren;
        return `<p>${serializedText}</p>${serializedChildren}`;
    },
    attrs: {},
    allowText: true,
    allowChildren: true,
};
