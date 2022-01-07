import { CompiledSchema } from '../../editor/model/schema';
import { MarkedText, Node } from '../../editor/model/types';

export const serializeNode = (
    schema: CompiledSchema,
    node: Node,
    nodes: Record<string, Node>,
    { prevNode, nextNode }: { prevNode?: Node; nextNode?: Node } = {}
): string => {
    const nodeSchema = schema[node.type];
    const textHtml = serializeText(node.text ?? []);

    let contentHTML = '';
    node.childrenIds?.forEach((childId, i) => {
        const prevNode = node.childrenIds?.[i - 1]
            ? nodes[node.childrenIds?.[i - 1]]
            : undefined;
        const nextNode = node.childrenIds?.[i + 1]
            ? nodes[node.childrenIds?.[i + 1]]
            : undefined;
        contentHTML += serializeNode(schema, nodes[childId], nodes, {
            prevNode,
            nextNode,
        });
    });
    return (
        nodeSchema?.serialize?.({
            serializedText: textHtml,
            serializedChildren: contentHTML,
            node,
            prevNode,
            nextNode,
        }) ?? ''
    );
};

const serializeText = (text: MarkedText) => {
    return text.reduce((acc, section) => section.s, '');
};
