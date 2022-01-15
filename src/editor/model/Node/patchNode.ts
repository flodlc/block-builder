import { isNodeSchema, Node, Schema } from '../types';

export const patchNode = ({
    schema,
    node,
    patch,
}: {
    node: Node;
    patch: Partial<Pick<Node, 'type' | 'text' | 'attrs'>>;
    schema: Schema;
}) => {
    const type = patch.type ?? node.type;
    const text = patch.text ?? node.text ?? [];
    const attrs = patch.attrs ?? node.attrs;
    const nodeSchema = schema[type];
    if (!isNodeSchema(nodeSchema)) throw 'invalid node type';

    Object.keys(nodeSchema.attrs).forEach((attr) => {
        const attrSchema = nodeSchema.attrs[attr];
        attrs[attr] = attrs?.[attr] ?? attrSchema.default;
    });

    return {
        id: node?.id,
        type,
        text,
        childrenIds: node?.childrenIds ?? [],
        attrs,
    };
};
