import { NodeSchema } from '../../editor/model';

export const textSchema: NodeSchema = {
    parse: (node: HTMLElement) => {
        if (!node.matches('p')) return false;
        if (
            node.firstElementChild?.tagName === 'IMG' &&
            node.children.length === 1
        ) {
            return false;
        }
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
