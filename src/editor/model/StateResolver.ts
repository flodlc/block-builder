import { State, Node } from './types';

export interface ResolvedNode extends Node {
    parentId?: string;
    index?: number;
    previousId?: string;
    nextId?: string;
}

export type ResolvedNodes = Record<string, ResolvedNode>;

export interface ResolvedState extends State {
    nodes: ResolvedNodes;
    flatTree: string[];
}

export function resolveState(state: State): ResolvedState {
    const draft = JSON.parse(JSON.stringify(state)) as State;
    const nodes = draft.nodes;
    const flatTree: string[] = [draft.rootId];
    dive(draft.nodes[draft.rootId], 0, draft.nodes, (nodeId) =>
        flatTree.push(nodeId)
    );

    flatTree.forEach((nodeId) => {
        const node = nodes[nodeId];
        if (node.childrenIds) {
            node.childrenIds.forEach((childId, index) => {
                const childNode: ResolvedNode = nodes[childId];
                childNode.parentId = node.id;
                childNode.index = index;
                childNode.previousId = node.childrenIds?.[index - 1];
                childNode.nextId = node.childrenIds?.[index + 1];
            });
        }
    });

    return {
        ...draft,
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
