import { Node } from '../model/types';
import { Step } from './types';
import { AbstractSelection } from '../model/Selection';

export class TransactionBuilder {
    patch = ({
        nodeId,
        patch,
    }: {
        nodeId: string;
        patch: unknown;
    }): TransactionBuilder => {
        this.steps.push({ name: 'patch', nodeId, patch });
        return this;
    };

    removeFrom = ({
        nodeId,
        parentId,
    }: {
        nodeId: string;
        parentId: string;
    }): TransactionBuilder => {
        this.steps.push({ name: 'removeFrom', nodeId, parentId });
        return this;
    };

    insertAfter = ({
        node,
        after,
        parent,
    }: {
        node: Node;
        after?: string;
        parent: string;
    }): TransactionBuilder => {
        this.steps.push({ name: 'insertAfter', node, after, parent });
        return this;
    };
    focus = (selection?: AbstractSelection): TransactionBuilder => {
        this.steps.push({ name: 'focus', selection });
        return this;
    };

    dispatch = (keepHistory = true) => {
        this.dispatchCallback(this.steps, keepHistory);
    };

    steps: Step[] = [];

    private readonly dispatchCallback: (
        steps: Step[],
        keepHistory: boolean
    ) => void;

    constructor(dispatch: (steps: Step[], keepHistory: boolean) => void) {
        this.dispatchCallback = dispatch;
    }
}
