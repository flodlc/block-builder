import { Node, State } from '../../model/types';
import produce from 'immer';

export const removeFrom = ({
    state,
    nodeId,
    parentId,
}: {
    state: State;
    nodeId: string;
    parentId: string;
}) => {
    const data = {} as { removedNode: Node; beforeId: string };
    const newState = produce(state, (draftState) => {
        const parentNode = draftState.nodes[parentId];

        if (parentNode?.childrenIds) {
            const index = parentNode.childrenIds.indexOf(nodeId);
            data.beforeId = parentNode.childrenIds[index - 1];
            parentNode.childrenIds.splice(index, 1);
        }

        data.removedNode = state.nodes[nodeId];
        // delete draftState.nodes[nodeId];
    });
    return {
        state: newState,
        inversedStep: {
            name: 'insertAfter',
            parent: parentId,
            after: data.beforeId,
            node: data.removedNode,
        },
    };
};
