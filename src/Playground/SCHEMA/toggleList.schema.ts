import { NodeSchema } from '../../editor/model/types';

export const toggleListSchema: NodeSchema = {
    attrs: {},
    serialize: ({ serializedChildren }) => {
        return serializedChildren;
    },
    allowText: true,
    allowChildren: true,
};
