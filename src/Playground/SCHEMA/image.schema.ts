import { NodeSchema } from '../../editor/model/types';

export const imageSchema: NodeSchema = {
    serialize: ({ node, serializedText }) => {
        return `<img src="${node.attrs?.src}" alt="${serializedText}"/>`;
    },
    parse: (node: HTMLElement) => {
        if (!node.matches('img')) return false;
        const alt = node?.getAttribute('alt');
        return {
            text: alt ? [{ text: alt }] : undefined,
            attrs: { src: node.getAttribute('src') },
        };
    },
    attrs: {
        src: { required: false },
        width: {},
    },
    allowText: true,
    allowChildren: false,
};
