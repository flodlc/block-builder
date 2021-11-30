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
    if (patch.childrenIds && Object.keys(patch).length === 1) {
        throw 'Cannot patch field childrenIds only. Use insert / delete steps instead.';
    }
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
            draftState.nodes[nodeId] = {
                ...draftState.nodes[nodeId],
                ...patch,
            };
        }),
        reversedSteps: { name: 'patch', nodeId, patch: reversePatch },
    };
};
