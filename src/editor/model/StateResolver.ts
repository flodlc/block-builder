import { State } from './types';

export interface ResolvedNode {
    id: string;
    type: string;
    parentId?: string;
    index?: number;
    previousId?: string;
    nextId?: string;
    childrenIds?: string[];
}

export type ResolvedNodes = Record<string, ResolvedNode>;

export interface ResolvedState {
    nodes: Record<string, ResolvedNode>;
    flatTree: string[];
}

export function resolveState(state: State): ResolvedState {
    const flatTree: string[] = [state.rootId];
    dive(state.nodes[state.rootId], 0, state.nodes, (nodeId) =>
        flatTree.push(nodeId)
    );

    const nodes = { ...state.nodes } as ResolvedNodes;
    flatTree.forEach((nodeId) => {
        const node = state.nodes[nodeId];
        if (node.childrenIds) {
            node.childrenIds.forEach((childId, index) => {
                nodes[childId] = {
                    ...state.nodes[childId],
                    parentId: node.id,
                    index: index,
                    previousId: node.childrenIds?.[index - 1],
                    nextId: node.childrenIds?.[index + 1],
                };
            });
        }
    });

    return {
        nodes,
        flatTree,
    };
}

const dive = (
    parent: ResolvedNode,
    index: number,
    resolvedNodes: ResolvedNodes,
    callback: (nodeId: string) => void
) => {
    if (parent?.childrenIds) {
        for (let i = 0; i < parent?.childrenIds.length; i++) {
            const childId = parent?.childrenIds?.[i];
            if (childId) {
                callback(childId);
                dive(resolvedNodes[childId], i, resolvedNodes, callback);
            }
        }
    }
};
