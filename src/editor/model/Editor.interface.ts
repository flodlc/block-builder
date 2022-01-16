import { MarkedText } from './types';
import { AbstractSelection, Range } from './Selection';
import { Editor as InternalEditor } from './Editor';
import { ResolvedState } from './StateResolver';
import { Node } from './Node/Node';

export type EventHandler<T = any> = (data: T) => void;
export type EditorEvent = 'change' | 'tr' | 'input' | string;

type JsonNode = {
    id: string;
    type: string;
    text?: MarkedText;
    children?: JsonNode[];
    attrs?: any;
};

export interface Editor {
    getJson: () => JsonNode;
    state: InternalEditor['state'];
    // schema: Schema;
    createNode: (type: string, node?: Partial<JsonNode>) => Node;
    getParentId: (nodeId: string) => string | undefined;
    isLastChild: (nodeId: string) => boolean;
    isFirstChild: (nodeId: string) => boolean;
    getNode: (nodeId: string) => Node | undefined;
    parseHtml: (html: string) => {
        blockIds: string[];
        nodes: Record<string, Node>;
    };
    serializeNode: (node: Node, deep: boolean, range?: Range) => string;
    runQuery: <T>(
        query: (resolvedState: ResolvedState, editor: Editor) => T
    ) => T;
    runCommand: (command: (editor: Editor) => void | boolean) => boolean | void;
    on: <T>(eventName: EditorEvent, handler: EventHandler<T>) => void;
    off: (eventName: EditorEvent, handler: EventHandler) => void;
    trigger: <T = any>(eventName: EditorEvent, data?: T) => T;
    back: () => void;
    createTransaction: () => TransactionBuilder;
}

export type TransactionBuilder = {
    patch: ({
        nodeId,
        patch,
    }: {
        nodeId: string;
        patch: Partial<Pick<Node, 'type' | 'text' | 'attrs'>>;
    }) => TransactionBuilder;

    removeFrom: ({
        nodeId,
        parentId,
    }: {
        nodeId: string;
        parentId: string;
    }) => TransactionBuilder;

    insertAfter: ({
        node,
        after,
        parentId,
    }: {
        node: Node;
        after?: string;
        parentId: string;
    }) => TransactionBuilder;

    focus: (selection?: AbstractSelection) => TransactionBuilder;
    dispatch: (keepHistory?: boolean) => void;
};
