import { NodeSchema } from '../../editor/model/types';

export const uliSchema: NodeSchema = {
    parse: (node: HTMLElement) => {
        if (!node.matches('ul > li')) return false;
        return {};
    },
    attrs: {},
    allowText: true,
    allowChildren: ['oli', 'uli', 'text', 'heading'],
};
