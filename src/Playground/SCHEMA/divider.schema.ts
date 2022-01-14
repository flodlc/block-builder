import { NodeSchema } from '../../editor/model';

export const dividerSchema: NodeSchema = {
    serialize: () => {
        return `<hr/>`;
    },
    parse: (node: HTMLElement) => {
        if (!node.matches('hr')) return false;
        return {};
    },
    attrs: {},
    allowText: false,
    allowChildren: false,
};
