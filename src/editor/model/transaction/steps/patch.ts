import { Node, Schema, State } from '../../types';
import { patchNode } from '../../Node/patchNode';

export const patch = ({
    state,
    nodeId,
    patch,
    schema,
}: {
    state: State;
    nodeId: string;
    patch: Partial<Pick<Node, 'type' | 'text' | 'attrs'>>;
    schema: Schema;
}) => {
    let reversePatch: Record<string, any> = {};
    const node = state.nodes[nodeId];

    const keys = Object.keys(patch) as ('type' | 'text' | 'attrs')[];
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
                [nodeId]: patchNode({
                    node: state.nodes[nodeId],
                    patch,
                    schema,
                }),
            },
        },
        reversedSteps: { name: 'patch', nodeId, patch: reversePatch },
    };
};
