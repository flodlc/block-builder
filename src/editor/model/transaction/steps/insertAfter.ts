import { Node, Schema, State } from '../../types';
import produce from 'immer';

export const insertAfter = ({
    state,
    node,
    after,
    parentId,
    schema,
}: {
    state: State;
    node: Node;
    after?: string;
    parentId: string;
    schema: Schema;
}) => {
    return {
        state: produce(state, (draftState) => {
            draftState.nodes[node.id] = node;
            const parentNode = draftState.nodes[parentId];
            if (!schema[parentNode.type].allowChildren) {
                throw new Error('Parent type cannot have children');
            }
            parentNode.childrenIds = parentNode?.childrenIds ?? [];

            if (parentNode?.childrenIds) {
                const index = after
                    ? parentNode.childrenIds.indexOf(after)
                    : -1;
                parentNode.childrenIds.splice(index + 1, 0, node.id);
            }
        }),
        reversedSteps: {
            name: 'removeFrom',
            nodeId: node.id,
            parentId,
        },
    };
};
