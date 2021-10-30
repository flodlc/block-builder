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

    constructor(state: State, nodeId: string) {
        this.state = state;
        this.resolvedState = resolveState(state);
        this.currentId = nodeId;
    }
}

interface ResolvedNode extends Node {
    parentId?: string;
    index?: number;
}

interface ResolvedState extends State {
    nodes: Record<string, ResolvedNode>;
}

function resolveState(state: State): ResolvedState {
    const draft = JSON.parse(JSON.stringify(state)) as State;
    const nodes = draft.nodes;
    Object.values(nodes).forEach((node) => {
        if (node.childrenIds) {
            node.childrenIds.forEach((childId, index) => {
                const childNode: ResolvedNode = nodes[childId];
                childNode.parentId = node.id;
                childNode.index = index;
            });
        }
    });
    return draft;
}
