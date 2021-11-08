import { State, Node } from './types';

export class NodesExplorer {
    state: State;
    resolvedState: ResolvedState;
    currentId?: string;

    node() {
        return this.currentId ? this.state.nodes[this.currentId] : undefined;
    }

    parent() {
        if (!this.currentId) {
            throw new Error('No current Node');
        }
        this.currentId = this.currentNode()?.parentId;
        return this;
    }

    nextSibling() {
        this.sibling(1);
    }

    previousSibing() {
        this.sibling(-1);
    }

    private sibling(distance: number) {
        const currentNode = this.currentNode();
        if (!currentNode) {
            throw new Error('No current Node');
        }

        if (!currentNode.parentId || !currentNode.index) {
            throw new Error('Not reachable');
        }

        const parentNode = this.resolvedState.nodes[currentNode.parentId];
        this.currentId =
            parentNode?.childrenIds?.[currentNode.index + distance];
        return this;
    }

    private currentNode() {
        return this.currentId
            ? this.resolvedState.nodes[this.currentId]
            : undefined;
    }

    constructor(resolvedState: ResolvedState, state: State, nodeId: string) {
        this.resolvedState = resolvedState;
        this.state = state;
        this.currentId = nodeId;
    }
}

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

export function resolveState(state: State): ResolvedState {
    const draft = JSON.parse(JSON.stringify(state)) as State;
    const nodes = draft.nodes;
    Object.values(nodes).forEach((node) => {
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
    const flatTree: string[] = [];
    dive(draft.nodes[draft.rootId], 0, draft.nodes, (nodeId) =>
        flatTree.push(nodeId)
    );

    return {
        ...draft,
        flatTree,
    };
}
