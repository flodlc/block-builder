import { NodeSchema } from '../../editor/model';

export const uliSchema: NodeSchema = {
    parse: (node: HTMLElement) => {
        if (!node.matches('ul > li')) return false;
        return {};
    },
    attrs: {},
    allowText: true,
    allowChildren: ['oli', 'uli', 'text', 'heading'],
};
