import { CompiledSchema } from '../schema';
import {
    CompiledNodeSchema,
    isNodeSchema,
    MarkedText,
    Node as ModelNode,
} from '../types';
import { joinMarkedTexts } from '../../transaction/MarkedText/joinMarkedTexts';
import { normalizeState } from './modelNormalizer';
import { applyTransaction } from '../../transaction/transactions';

const blockTags: Record<string, boolean> = {
    address: true,
    article: true,
    aside: true,
    blockquote: true,
    canvas: true,
    dd: true,
    div: true,
    dl: true,
    fieldset: true,
    figcaption: true,
    figure: true,
    footer: true,
    form: true,
    h1: true,
    h2: true,
    h3: true,
    h4: true,
    h5: true,
    h6: true,
    header: true,
    hgroup: true,
    hr: true,
    li: true,
    noscript: true,
    ol: true,
    output: true,
    p: true,
    pre: true,
    section: true,
    table: true,
    tfoot: true,
    ul: true,
    img: true,
};

const isBlock = (node: Node) => {
    return (
        node.nodeType === 1 &&
        blockTags[(node as HTMLElement).tagName.toLocaleLowerCase()]
    );
};

const ignoredTags: Record<string, boolean> = {
    script: true,
    meta: true,
};

const isIgnoredTag = (node: Node) => {
    return (
        node.nodeType === 1 &&
        ignoredTags[(node as HTMLElement).tagName.toLocaleLowerCase()]
    );
};

export const parseHtml = ({
    html,
    schema,
}: {
    html: string;
    schema: CompiledSchema;
}) => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;

    let state = { nodes: {} };
    const parsed = parse({
        domNode: wrapper,
        schema,
        nodes: state.nodes,
    }) as Parsed;
    parsed?.blocks.forEach((block) => {
        state = normalizeState(
            schema,
            {
                nodes: state.nodes,
                rootId: block.id,
            },
            ({ transaction, state }) => applyTransaction({ state, transaction })
        ).normalizedState;
    });

    return {
        blockIds: parsed?.blocks.map((item) => item.id),
        nodes: state.nodes,
    };
};

type Parsed = {
    blocks: ModelNode[];
    inline?: MarkedText;
};

const parseText = (
    domNode: Node,
    schema: CompiledSchema,
    marks: { type: string }[] = []
): { text: string; marks: any[] }[] => {
    if (![1, 3].includes(domNode.nodeType)) return [];
    if (domNode.nodeType === 3) {
        return [
            {
                text: domNode.textContent?.replace(/\n/g, ' ') ?? '',
                marks: marks,
            },
        ];
    } else if (
        domNode.nodeType === 1 &&
        (domNode as HTMLElement).tagName.toLocaleLowerCase() === 'br'
    ) {
        return [
            {
                text: '\n',
                marks: marks,
            },
        ];
    }

    let mark: { type: string } | undefined;
    Object.values(schema).some((schemaItem) => {
        if (schemaItem.inline) {
            const returnedMark = schemaItem.parse?.(domNode as HTMLElement);
            if (returnedMark) {
                mark = { ...returnedMark, type: schemaItem.type };
                return true;
            }
        }
    });

    return Array.from(domNode.childNodes)
        .filter((child) => child.textContent)
        .flatMap((child) =>
            parseText(child, schema, mark ? [...marks, mark] : marks)
        )
        .filter((item) => item.text);
};

const isInlineAllowed = (schema: CompiledSchema, parentType?: string) => {
    if (!parentType) return false;
    const parentSchema = schema[parentType];
    return parentSchema.allowText;
};

const getDefaultType = (schema: CompiledSchema, parentType?: string) => {
    return getAllowedChildTypes(schema, parentType)[0];
};

const doesAllowChildren = (schema: CompiledSchema, parentType?: string) => {
    return !!getAllowedChildTypes(schema, parentType).length;
};

const getAllowedChildTypes = (
    schema: CompiledSchema,
    parentType?: string
): string[] => {
    if (!parentType) return Object.keys(schema);
    const parentSchema = schema[parentType];
    if (!parentSchema.allowChildren) return [];
    if (parentSchema.allowChildren === true) return Object.keys(schema);
    return parentSchema.allowChildren;
};

const findMatching = ({
    schema,
    domNode,
}: {
    schema: CompiledSchema;
    domNode: Node;
}) => {
    for (const schemaItem of Object.values(schema)) {
        const nodePatch =
            isNodeSchema(schemaItem) &&
            schemaItem.parse?.(domNode as HTMLElement);
        if (nodePatch) {
            return {
                nodePatch,
                schema: schemaItem as CompiledNodeSchema,
            };
        }
    }
};

const parse = ({
    schema,
    domNode,
    nodes = {},
    parentType,
}: {
    schema: CompiledSchema;
    domNode: Node;
    nodes: Record<string, ModelNode>;
    parentType?: string;
}): Parsed | null => {
    if (!isBlock(domNode)) return null;

    const matchedNode = findMatching({ schema, domNode });

    if (matchedNode && !doesAllowChildren(schema, matchedNode?.schema.type)) {
        const node = matchedNode.schema.create({
            ...matchedNode.nodePatch,
            text: matchedNode?.schema.allowText
                ? parseText(domNode, schema)
                : [],
        });
        nodes[node.id] = node;
        return { blocks: [node] };
    }

    const { inlineText, blocks } = parseChildren({
        nodes,
        schema,
        domNode,
        matchedNode,
        parentType: matchedNode?.schema.type ?? parentType,
    });
    blocks.forEach((child) => (nodes[child.id] = child));

    if (!matchedNode?.schema?.type) return { inline: inlineText, blocks };

    const node = matchedNode.schema.patch({
        ...matchedNode.schema.create(matchedNode.nodePatch),
        text: matchedNode.schema.allowText ? inlineText : undefined,
        childrenIds: blocks.map((item) => item.id),
    });
    nodes[node.id] = node;

    return {
        inline: !matchedNode.schema.allowText ? inlineText : undefined,
        blocks: [node],
    };
};

const parseChildren = ({
    nodes,
    schema,
    domNode,
    parentType,
    matchedNode,
}: {
    nodes: Record<string, ModelNode>;
    schema: CompiledSchema;
    domNode: Node;
    parentType?: string;
    matchedNode?: {
        schema: CompiledNodeSchema;
        nodePatch: Partial<ModelNode>;
    };
}) => {
    let inlineText = [] as MarkedText;
    let blocks = [] as ModelNode[];
    let openedBlock: ModelNode | undefined = undefined;
    Array.from(domNode.childNodes).forEach((childNode) => {
        if (isIgnoredTag(childNode)) return;
        if (isBlock(childNode)) {
            const parsed = parse({
                domNode: childNode,
                schema,
                nodes,
                parentType: matchedNode?.schema.type ?? parentType,
            });
            if (
                !inlineText.length &&
                parsed?.blocks[0]?.text?.length &&
                matchedNode &&
                isInlineAllowed(schema, parentType)
            ) {
                // if the parent node has no text, we use the first block text.
                const first = parsed?.blocks.shift();
                inlineText = first?.text ?? [];
            }

            if (parsed) {
                inlineText = joinMarkedTexts(inlineText, parsed.inline ?? []);
                blocks = [...blocks, ...parsed.blocks];
            } else {
                if (!childNode.textContent?.trim()) return;
                const def = getDefaultType(schema, parentType);
                if (def) {
                    if (!openedBlock) {
                        const nodeSchema = schema[def];
                        if (!isNodeSchema(nodeSchema)) return;
                        openedBlock = nodeSchema.create();
                        blocks.push(openedBlock);
                    }
                }
            }
        } else {
            if (!childNode.textContent) return;
            if (isInlineAllowed(schema, parentType) && !openedBlock) {
                inlineText = joinMarkedTexts(
                    inlineText,
                    parseText(childNode, schema)
                );
            } else {
                if (!openedBlock) {
                    const def = getDefaultType(schema, parentType);
                    const nodeSchema = schema[def];
                    if (!isNodeSchema(nodeSchema)) return;
                    openedBlock = nodeSchema.create();
                    blocks.push(openedBlock);
                }
                openedBlock.text = joinMarkedTexts(
                    openedBlock.text,
                    parseText(childNode, schema)
                );
            }
        }
    });
    return {
        inlineText,
        blocks: blocks.filter((item) => item),
    };
};
