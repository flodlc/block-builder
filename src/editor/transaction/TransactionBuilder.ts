import { Editor } from '../model/Editor';
import { Node, Selection } from '../model/types';
import { Step } from './types';

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
    focus = (blockIds: Selection['blockIds']): TransactionBuilder => {
        this.steps.push({ name: 'focus', blockIds });
        return this;
    };

    dispatch = (keepHistory = true) => {
        this.editor.applyTransaction({ steps: this.steps, keepHistory });
    };

    steps: Step[] = [];
    editor: Editor;

    constructor(editor: Editor) {
        this.editor = editor;
    }
}
