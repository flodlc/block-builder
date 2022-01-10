import { NodeSchema } from '../../editor/model/types';

export const cardSchema: NodeSchema = {
    serialize: ({ serializedChildren, serializedText }) => {
        return `<h2>${serializedText}</h2>${serializedChildren}`;
    },
    attrs: {},
    allowText: true,
    allowChildren: true,
};
