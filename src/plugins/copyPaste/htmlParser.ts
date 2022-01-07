import { CompiledSchema } from '../../editor/model/schema';
import { MarkedText, Node as ModelNode } from '../../editor/model/types';
import { joinMarkedTexts } from '../../editor/transaction/MarkedText/joinMarkedTexts';

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
};

const isBlock = (node: Node) => {
    return (
        node.nodeType === 1 &&
        blockTags[(node as HTMLElement).tagName.toLocaleLowerCase()]
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
    console.log(wrapper);

    let nbBlocks = 0;
    const has2Blocks = Array.from(wrapper.children).some((node) => {
        if (node.textContent && isBlock(node)) {
            nbBlocks++;
        }
        return nbBlocks >= 1;
    });
    if (has2Blocks) {
        const parsed = parseWithContext(wrapper, schema);
        return {
            type: 'block',
            blocks: parsed.parsed
                ? group(parsed.parsed.blocks, schema)
                : parsed,
            nodes: parsed.nodes,
        };
    } else {
        return {
            type: 'inline',
            text: parseText(wrapper, schema),
        };
    }
};

const group = (parsed: ModelNode[], schema: CompiledSchema) => parsed;

type Parsed = {
    blocks: ModelNode[];
    inline?: MarkedText;
};

const parseText = (
    domNode: Node,
    schema: CompiledSchema,
    marks: { t: string }[] = []
): { s: string; m: any[] }[] => {
    console.log('parrse text', domNode);
    if (domNode.nodeType === 3) {
        return [
            { s: domNode.textContent?.replace(/\n/g, ' ') ?? '', m: marks },
        ];
    }

    let mark: { t: string } | undefined;
    Object.values(schema).some((schemaItem) => {
        if (schemaItem.inline) {
            const returnedMark = schemaItem.parse?.(domNode as HTMLElement);
            if (returnedMark) {
                mark = { ...returnedMark, t: schemaItem.type };
                return true;
            }
        }
    });

    return Array.from(domNode.childNodes)
        .filter((child) => child.textContent)
        .flatMap((child) =>
            parseText(child, schema, mark ? [...marks, mark] : marks)
        )
        .filter((item) => item.s);
};

const isInlineAllowed = (schema: CompiledSchema, parentType?: string) => {
    if (!parentType) return false;
    const parentSchema = schema[parentType];
    return parentSchema.allowText;
};

const getDafaultType = (schema: CompiledSchema, parentType?: string) => {
    return getAllowedChildTypes(schema, parentType)[0];
};

const isValidChild = (
    schema: CompiledSchema,
    parentType: string,
    childType: string
) => {
    const parentSchema = schema[parentType];
    const childSchema = schema[childType];
    return (
        parentSchema.allowText === true ||
        (Array.isArray(parentSchema.allowChildren) &&
            parentSchema.allowChildren.includes(childType))
    );
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

const getBestPath = (
    schema: CompiledSchema,
    parentType: string,
    childType: string
): string[] | null => {
    const path = [] as string[];
    const parentSchema = schema[parentType];
    const childSchema = schema[childType];

    const allowChildren = getAllowedChildTypes(schema, parentType);
    if (!allowChildren.length) return null;

    if (isValidChild(schema, parentType, childType)) {
        return path;
    }

    const currentParent = parentType;
    for (let i = 0; i < 1; i++) {
        const currentAllowedChildren = getAllowedChildTypes(
            schema,
            currentParent
        );
        for (const type of currentAllowedChildren) {
            if (isValidChild(schema, type, childType)) {
                path[i] = type;
                return path;
            }
        }
    }

    return null;
};

const parseWithContext = (domNode: Node, schema: CompiledSchema) => {
    const nodes = {} as Record<string, ModelNode>;

    const parse = (
        domNode: Node,
        { parentType = undefined }: { parentType?: string } = {}
    ): Parsed | null => {
        if (!isBlock(domNode)) return null;

        let matchedNode:
            | {
                  schema: CompiledSchema[keyof CompiledSchema];
                  node: Partial<ModelNode>;
              }
            | undefined;

        Object.values(schema).some((schemaItem) => {
            const nodePatch = schemaItem.parse?.(domNode as HTMLElement);
            if (nodePatch) {
                matchedNode = {
                    node: schema[schemaItem.type].create(nodePatch),
                    schema: schemaItem,
                };
                return true;
            }
        });

        if (
            matchedNode &&
            !getAllowedChildTypes(schema, matchedNode?.schema.type).length
        ) {
            const node = matchedNode.schema.create({
                ...matchedNode.node,
                text: matchedNode?.schema.allowText
                    ? parseText(domNode, schema)
                    : [],
            });
            nodes[node.id] = node;
            return { blocks: [node] };
        }

        let blocks = [] as ModelNode[];
        let inlineText = [] as MarkedText;
        let openedBlock: ModelNode | undefined = undefined;

        parentType = matchedNode?.schema.type ?? parentType;
        Array.from(domNode.childNodes).forEach((childNode) => {
            if (isBlock(childNode)) {
                const parsed = parse(childNode, {
                    parentType: matchedNode?.schema.type ?? parentType,
                });
                console.log(childNode, parsed);
                if (parsed) {
                    inlineText = joinMarkedTexts(
                        inlineText,
                        parsed.inline ?? []
                    );
                    blocks = [...blocks, ...parsed.blocks];
                } else {
                    if (!childNode.textContent?.trim()) return;
                    const def = getDafaultType(schema, parentType);
                    if (def) {
                        if (!openedBlock) {
                            openedBlock = schema[def].create();
                            blocks.push(openedBlock);
                        }
                    }
                }
            } else {
                if (!childNode.textContent?.trim()) return;
                if (isInlineAllowed(schema, parentType) && !openedBlock) {
                    inlineText = joinMarkedTexts(
                        inlineText,
                        parseText(childNode, schema)
                    );
                } else {
                    if (!openedBlock) {
                        openedBlock =
                            schema[getDafaultType(schema, parentType)].create();
                        blocks.push(openedBlock);
                    }
                    openedBlock.text = joinMarkedTexts(
                        openedBlock.text,
                        parseText(childNode, schema)
                    );
                }
            }
        });

        blocks = blocks.filter((item) => item);

        if (!matchedNode?.schema?.type)
            return {
                inline: inlineText,
                blocks,
            };

        let node = matchedNode.schema.create(matchedNode.node);
        node = matchedNode.schema.patch({
            ...node,
            text: matchedNode.schema.allowText ? inlineText : undefined,
            childrenIds: blocks
                .map((item) => item.id)
                .filter((item) => item) as string[],
        });

        nodes[node.id] = node;
        blocks.forEach((child) => (nodes[child.id] = child));
        return {
            inline: !matchedNode.schema.allowText ? inlineText : undefined,
            blocks: [node],
        };
    };

    return { parsed: parse(domNode, schema), nodes };
};
