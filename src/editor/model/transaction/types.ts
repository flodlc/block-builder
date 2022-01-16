import { AbstractSelection } from '../Selection';
import { Node, JsonNode } from '../Node/Node';

interface PatchStep {
    name: 'patch';
    nodeId: string;
    patch: any;
}

interface RemoveFromStep {
    name: 'removeFrom';
    nodeId: string;
    parentId: string;
}

interface InsertAfterStep {
    name: 'insertAfter';
    node: JsonNode | Node;
    after?: string;
    parentId: string;
}

interface FocusStep {
    name: 'focus';
    selection?: AbstractSelection;
}

export type Step = RemoveFromStep | InsertAfterStep | PatchStep | FocusStep;

export interface Transaction {
    steps: Step[];
    keepHistory: boolean;
}

export interface AppliedTransaction {
    steps: Step[];
    reversedSteps: Step[];
}
