import { Schema, State } from '../../types';
import { Node } from '../../Node/Node';

export const removeFrom = ({
    state,
    nodeId,
    parentId,
    schema,
}: {
    state: State;
    nodeId: string;
    parentId: string;
    schema: Schema;
}) => {
    const data = {} as { removedNode: Node; beforeId: string | undefined };
    const childrenIds = [...(state.nodes[parentId].childrenIds ?? [])];
    if (!schema[state.nodes[parentId].type].allowChildren) {
        throw new Error('Parent type cannot have children');
    }

    data.removedNode = state.nodes[nodeId];
    const index = childrenIds.indexOf(nodeId);
    data.beforeId = state.nodes[parentId].childrenIds?.[index - 1];
    childrenIds.splice(index, 1);
    const parentNode = state.nodes[parentId].patch({ childrenIds });
    return {
        state: {
            ...state,
            nodes: {
                ...state.nodes,
                [parentNode.id]: parentNode,
            },
        } as State,
        reversedSteps: {
            name: 'insertAfter',
            parentId,
            after: data.beforeId,
            node: data.removedNode,
        },
    };
};
