import { Node, State } from '../../model/types';
import produce from 'immer';

export const insertAfter = ({
    state,
    node,
    after,
    parentId,
}: {
    state: State;
    node: Node;
    after?: string;
    parentId: string;
}) => {
    return {
        state: produce(state, (draftState) => {
            draftState.nodes[node.id] = node;
            const parentNode = draftState.nodes[parentId];

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
