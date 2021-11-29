import { v4 as uuidv4 } from 'uuid';
import { Node, NodeSchema, Schema } from './types';

export type CompiledSchema = Record<
    string,
    NodeSchema & {
        create: (node?: Partial<Node>) => Node;
    }
>;

export const compileSchema = ({
    schema,
}: {
    schema: Schema;
}): CompiledSchema => {
    let compiledSchema: CompiledSchema = {};
    Object.keys(schema).forEach((type) => {
        compiledSchema = {
            ...compiledSchema,
            [type]: {
                create: (node) => {
                    const nodeSchema = schema[type];
                    const attrs = {} as any;

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
                },
                ...schema[type],
            },
        };
    });
    return compiledSchema;
};
