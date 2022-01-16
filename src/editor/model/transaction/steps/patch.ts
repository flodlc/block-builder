import { State } from '../../types';
import { Node } from '../../Node/Node';

export const patch = ({
    state,
    nodeId,
    patch,
}: {
    state: State;
    nodeId: string;
    patch: Partial<Pick<Node, 'type' | 'text' | 'attrs'>>;
}) => {
    const strictPatch = {} as Partial<Pick<Node, 'type' | 'text' | 'attrs'>>;
    const stateNode = state.nodes[nodeId];
    ['type', 'text', 'attrs'].forEach((key) => {
        const k = key as 'type' | 'text' | 'attrs';
        if (patch[k] !== undefined && patch[k] !== stateNode[k]) {
            // @ts-ignore
            strictPatch[k] = patch[k];
        }
    });
    let reversePatch: Record<string, any> = {};
    const node = state.nodes[nodeId];

    const keys = Object.keys(strictPatch) as ('type' | 'text' | 'attrs')[];
    reversePatch = keys.reduce(
        (prev, key) => ({
            ...prev,
            [key]: node[key],
        }),
        {}
    );

    return {
        state: {
            ...state,
            nodes: {
                ...state.nodes,
                [nodeId]: node.patch(strictPatch),
            },
        },
        reversedSteps: { name: 'patch', nodeId, patch: reversePatch },
    };
};
