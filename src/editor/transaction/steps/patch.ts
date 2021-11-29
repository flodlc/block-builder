import { State } from '../../model/types';
import produce from 'immer';

export const patch = ({
    state,
    nodeId,
    patch,
}: {
    state: State;
    nodeId: string;
    patch: any;
}) => {
    let reversePatch = {} as any;
    const node = state.nodes[nodeId];
    return {
        state: produce(state, (draftState) => {
            reversePatch = Object.keys(patch).reduce((prev, key) => {
                return {
                    ...prev,
                    // @ts-ignore
                    [key]: node[key],
                };
            }, {});
            const draftNode = { ...draftState.nodes[nodeId], ...patch };
            draftState.nodes[nodeId] = draftNode;
        }),
        inversedStep: { name: 'patch', nodeId, patch: reversePatch },
    };
};
