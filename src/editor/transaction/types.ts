import { Node } from '../model/types';

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
    node: Node;
    after?: string;
    parent: string;
}

interface FocusStep {
    name: 'focus';
    blockIds: Record<string, any>;
}

export type Step = RemoveFromStep | InsertAfterStep | PatchStep | FocusStep;

export interface Transaction {
    steps: Step[];
    keepHistory: boolean;
}

export interface AppliedTransaction {
    steps: Step[];
    inversedSteps: Step[];
}
