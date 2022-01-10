import { v4 as uuidv4 } from 'uuid';
import {
    CompiledMarkSchema,
    CompiledNodeSchema,
    MarkSchema,
    NodeSchema,
    Schema,
} from './types';

export type CompiledSchema = Record<
    string,
    CompiledNodeSchema | CompiledMarkSchema
>;

export const compileSchema = ({
    schema,
}: {
    schema: Schema;
}): CompiledSchema => {
    let compiledSchema: CompiledSchema = {};
    Object.keys(schema).forEach((type) => {
        const schemaItem = schema[type];
        if (!schemaItem.inline) {
            compiledSchema = {
                ...compiledSchema,
                [type]: compileNodeSchema(schemaItem as NodeSchema, type),
            };
        } else {
            compiledSchema = {
                ...compiledSchema,
                [type]: compileMarkSchema(schemaItem as MarkSchema, type),
            };
        }
    });
    return compiledSchema;
};

const compileMarkSchema = (
    markSchema: MarkSchema,
    type: string
): CompiledMarkSchema => {
    return {
        type,
        ...markSchema,
    };
};

const compileNodeSchema = (
    nodeSchema: NodeSchema,
    type: string
): CompiledNodeSchema => {
    return {
        type,
        create: (node) => {
            // const nodeSchema = schema[type];
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
        patch: (node) => {
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
                childrenIds: node?.childrenIds ?? [],
                attrs,
            };
        },
        ...nodeSchema,
    };
};
