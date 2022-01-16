import {
    isMarkSchema,
    isNodeSchema,
    Mark,
    MarkedNode,
    MarkedText,
    Schema,
} from '../types';
import { Node } from '../Node/Node';

import { Range } from '../Selection';

export const serializeNode = (
    schema: Schema,
    node: Node,
    nodes: Record<string, Node>,
    deep: boolean,
    range?: Range,
    { prevNode, nextNode }: { prevNode?: Node; nextNode?: Node } = {}
): string => {
    const schemaItem = schema[node.type];
    const nodeSchema = isNodeSchema(schemaItem) && schemaItem;
    if (!nodeSchema) return '';

    const textHtml = serializeText(
        schema,
        range ? Node.copyText(node.text, range) : node.text ?? []
    );

    let contentHTML = '';
    if (deep) {
        node.childrenIds?.forEach((childId, i) => {
            const prevNode = node.childrenIds?.[i - 1]
                ? nodes[node.childrenIds?.[i - 1]]
                : undefined;
            const nextNode = node.childrenIds?.[i + 1]
                ? nodes[node.childrenIds?.[i + 1]]
                : undefined;
            contentHTML += serializeNode(
                schema,
                nodes[childId],
                nodes,
                true,
                undefined,
                {
                    prevNode,
                    nextNode,
                }
            );
        });
    }
    return (
        nodeSchema?.serialize?.({
            serializedText: textHtml,
            serializedChildren: contentHTML,
            node,
            prevNode,
            nextNode,
        }) ?? contentHTML
    );
};

const serializeText = (schema: Schema, text: MarkedText) => {
    return text.reduce(
        (acc, section) => acc + serializeTextSection(schema, section),
        ''
    );
};

const serializeTextSection = (schema: Schema, section: MarkedNode): string => {
    return serializeMarks(schema, section.marks ?? [], section.text);
};

const serializeMarks = (
    schema: Schema,
    marks: Mark[],
    content: string
): string => {
    const currentMark = marks[0];
    if (!currentMark) return content;
    const innerMarks = marks.slice(1);
    const innerContent = serializeMarks(schema, innerMarks, content);
    return serializeMark(schema, currentMark, innerContent);
};

const serializeMark = (
    schema: Schema,
    mark: Mark,
    serializedContent: string
) => {
    const markSchema = schema[mark.type];
    if (!isMarkSchema(markSchema)) return serializedContent;

    return (
        markSchema.serialize?.({
            serializedContent,
            mark: mark,
        }) ?? serializedContent
    );
};
