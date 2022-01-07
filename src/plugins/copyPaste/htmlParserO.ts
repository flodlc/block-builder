import { CompiledSchema } from '../../editor/model/schema';
import {
    MarkedNode,
    MarkedText,
    Node as ModelNode,
} from '../../editor/model/types';
import { joinMarkedTexts } from '../../editor/transaction/MarkedText/joinMarkedTexts';

const DEFAULT_BLOCK = 'text';
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
    // console.log(parseText(wrapper, schema));
    console.log(wrapper);

    let nbBlocks = 0;
    const has2Blocks = Array.from(wrapper.children).some((node) => {
        if (node.textContent && isBlock(node)) {
            nbBlocks++;
        }
        return nbBlocks >= 1;
    });
    if (has2Blocks) {
        const parsed = parse(wrapper, schema);
        return {
            type: 'block',
            blocks: parsed ? group(parsed, schema) : parsed,
        };
    } else {
        return {
            type: 'inline',
            text: parseText(wrapper, schema),
        };
    }
};

const group = (parsed: Su[], schema: CompiledSchema) => {
    return parsed.map((item) => {
        if (item.nodeType === 'string') {
            return {
                nodeType: DEFAULT_BLOCK,
                node: schema[DEFAULT_BLOCK].create({ text: item.text }),
            };
        }
        return item;
    });
};

type Su = {
    children?: Su[];
    nodeType: string;
    text?: MarkedNode[];
    node?: ModelNode;
    nodes?: ModelNode[];
};

const parseText = (
    domNode: Node,
    schema: CompiledSchema,
    marks: { t: string }[] = []
): { s: string; m: any[] }[] => {
    if (domNode.nodeType === 3) {
        return [{ s: domNode.textContent ?? '', m: marks }];
    }

    let mark: { t: string } | undefined;
    Object.values(schema).some((schemaItem) => {
        if (schemaItem.inline && typeof schemaItem.parse === 'function') {
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

const parse = (
    domNode: Node,
    schema: CompiledSchema,
    { parentType = undefined }: { parentType?: string } = {}
): Su[] | null => {
    const textContent = domNode.textContent?.trim();
    if (!textContent) return null;

    if (!isBlock(domNode)) return null;

    let matchedNode:
        | {
              schema: CompiledSchema[keyof CompiledSchema];
              node: Partial<ModelNode>;
          }
        | undefined;

    Object.values(schema).some((schemaItem) => {
        if (typeof schemaItem.parse === 'function') {
            const node = schemaItem.parse?.(domNode as HTMLElement);
            if (node) {
                matchedNode = {
                    node: schema[schemaItem.type].create(node),
                    schema: schemaItem,
                };
                return true;
            }
        }
    });

    if (
        matchedNode &&
        !getAllowedChildTypes(schema, matchedNode?.schema.type).length
    ) {
        const node = matchedNode.schema.create({
            ...matchedNode.node,
            text: parseText(domNode, schema),
        });
        return [
            {
                node,
                nodes: [node],
                nodeType: matchedNode?.schema?.type,
            },
        ];
    }

    let childJson = [] as Su[];
    let inlineText = [] as MarkedText;
    let opened: Su | undefined;

    parentType = matchedNode?.schema.type ?? parentType;
    Array.from(domNode.childNodes).forEach((childNode) => {
        if (!childNode.textContent?.trim()) return;
        const block = isBlock(childNode);
        const inlineAllowed = isInlineAllowed(schema, parentType);
        const defaultType = getDafaultType(schema, parentType);

        if (block) {
            console.log('block', childNode, {
                parentType,
                inlineAllowed,
                defaultType,
                matchedType: matchedNode?.schema.type,
            });
            const parsed = parse(childNode, schema, {
                parentType: matchedNode?.schema.type ?? parentType,
            });
            if (parsed) {
                console.log(childNode, parsed);
                childJson = [...childJson, ...parsed];
            } else {
                const def = getDafaultType(schema, parentType);
                console.log(childNode, def);
                if (def) {
                    opened = opened ?? {
                        node: schema[def].create(),
                        children: [],
                        nodeType: def,
                        nodes: [],
                    };
                }
            }

            // check if can fit in the parent node.
            // if yes => ok
            // if no => if inline is allowed => inline.
        } else {
            console.log('inline', childNode, {
                parentType,
                inlineAllowed,
                defaultType,
                matchedType: matchedNode?.schema.type,
            });

            if (inlineAllowed && !opened) {
                inlineText = joinMarkedTexts(
                    inlineText,
                    parseText(childNode, schema)
                );
            } else {
                console.log('laaa', childNode);
                opened = opened ?? {
                    node: schema[getDafaultType(schema, parentType)].create(),
                    children: [],
                    nodeType: getDafaultType(schema, parentType),
                    nodes: [],
                };
                const openedNode = opened.node as ModelNode;
                openedNode.text = joinMarkedTexts(
                    opened.text,
                    parseText(childNode, schema)
                );
            }
            // if a block is opened => append
            // else create a new default block that fit the parent
            // if nothing is allowed, ignore it.
        }

        console.log('inlineText', inlineText);

        if (1 === 1 / 2) {
            if (!block && !matchedNode?.schema?.type && !inlineAllowed) {
                // console.log('inline', childNode);
                opened = opened ?? {
                    node: schema[getDafaultType(schema, parentType)].create(),
                    children: [],
                    nodeType: getDafaultType(schema, parentType),
                    nodes: [],
                };
                const openedNode = opened.node as ModelNode;
                openedNode.text = joinMarkedTexts(
                    opened.node?.text ?? [],
                    parseText(childNode, schema)
                );
            } else if (!block && inlineAllowed) {
                console.log('childNode', childNode);
                inlineText = joinMarkedTexts(
                    inlineText,
                    parseText(childNode, schema)
                );
            } else if (block) {
                const parsed = parse(childNode, schema, {
                    parentType: matchedNode?.schema.type ?? parentType,
                });
                if (!parsed?.length) {
                    opened = opened ?? {
                        node: schema[
                            getDafaultType(schema, parentType)
                        ].create(),
                        children: [],
                        nodeType: getDafaultType(schema, parentType),
                        nodes: [],
                    };
                    const openedNode = opened.node as ModelNode;
                    openedNode.text = joinMarkedTexts(
                        opened.node?.text ?? [],
                        parseText(childNode, schema)
                    );
                } else {
                    if (opened) {
                        childJson = [...childJson, opened];
                        opened = undefined;
                    }
                    childJson = [...childJson, ...parsed];
                }
                // console.log('block', childNode, parsed);
            }
        }
    });
    if (opened) {
        childJson.push(opened);
        opened = undefined;
    }
    childJson = childJson.filter((item) => item);
    /*  childJson = Array.from(domNode.childNodes)
            .flatMap((child) => parse(child, schema, inlineMode))
            .filter((child) => child) as Su[];*/

    if (!matchedNode?.schema?.type) return childJson;

    let node = matchedNode.schema.create(matchedNode.node);
    // console.log('parentType', parentType);
    node = matchedNode.schema.patch({
        ...node,
        text: inlineText,
        childrenIds: childJson
            .map((item) => item.node?.id)
            .filter((item) => item) as string[],
    });

    return [
        {
            node,
            nodes: [
                node,
                ...(childJson
                    .flatMap((item) => item.nodes)
                    .filter((item) => item) as ModelNode[]),
            ],
            nodeType: matchedNode?.schema?.type,
            children: childJson,
        },
    ];
};

const getDirectInline = (
    domNode: Node,
    schema: CompiledSchema
): MarkedNode[] => {
    // return [];
    return Array.from(domNode.childNodes)
        .filter((node) => node.nodeType === 3 || !isBlock(node))
        .flatMap((node) => parseText(node, schema))
        .filter((item) => item.s);
};
