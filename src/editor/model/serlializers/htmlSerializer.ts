import { CompiledSchema } from '../schema';
import {
    isMarkSchema,
    isNodeSchema,
    Mark,
    MarkedNode,
    MarkedText,
    Node,
} from '../types';
import { cutMarkedText } from '../../transaction/MarkedText/cutMarkedText';
import { Range } from '../Selection';

export const serializeNode = (
    schema: CompiledSchema,
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
        range ? cutMarkedText(node.text, range) : node.text ?? []
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

const serializeText = (schema: CompiledSchema, text: MarkedText) => {
    return text.reduce(
        (acc, section) => acc + serializeTextSection(schema, section),
        ''
    );
};

const serializeTextSection = (
    schema: CompiledSchema,
    section: MarkedNode
): string => {
    return serializeMarks(schema, section.marks ?? [], section.text);
};

const serializeMarks = (
    schema: CompiledSchema,
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
    schema: CompiledSchema,
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
