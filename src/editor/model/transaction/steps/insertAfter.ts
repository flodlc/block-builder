import { Schema, State } from '../../types';
import { Node, JsonNode } from '../../Node/Node';

export const insertAfter = ({
    state,
    node,
    after,
    parentId,
    schema,
}: {
    state: State;
    node: JsonNode | Node;
    after?: string;
    parentId: string;
    schema: Schema;
}) => {
    const childrenIds = [...(state.nodes[parentId].childrenIds ?? [])];
    if (!schema[state.nodes[parentId].type].allowChildren) {
        throw new Error('Parent type cannot have children');
    }
    const index = after ? childrenIds.indexOf(after) : -1;
    childrenIds.splice(index + 1, 0, node.id);
    const parentNode = state.nodes[parentId].patch({ childrenIds });
    return {
        state: {
            ...state,
            nodes: {
                ...state.nodes,
                [parentNode.id]: parentNode,
                [node.id]: new Node({ ...node, schema }),
            },
        } as State,
        reversedSteps: {
            name: 'removeFrom',
            nodeId: node.id,
            parentId,
        },
    };
};
