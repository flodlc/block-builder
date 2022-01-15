import { v4 as uuidv4 } from 'uuid';
import { isNodeSchema, Node, Schema } from '../types';

export const createNode = ({
    schema,
    type,
    node,
}: {
    schema: Schema;
    type: string;
    node?: Partial<Node>;
}): Node => {
    const attrs = {} as any;
    const nodeSchema = schema[type];
    if (!nodeSchema || !isNodeSchema(nodeSchema)) throw 'invalid node type';
    Object.keys(nodeSchema.attrs).forEach((attr) => {
        const attrSchema = nodeSchema.attrs[attr];
        attrs[attr] = attrSchema.default;
        if (node?.attrs?.[attr] !== undefined) {
            attrs[attr] = node.attrs?.[attr];
        }
    });

    return {
        id: node?.id ?? uuidv4(),
        type,
        text: node?.text ?? [],
        childrenIds: [],
        attrs,
    };
};
