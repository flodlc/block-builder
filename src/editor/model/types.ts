import { AppliedTransaction } from './transaction/types';
import { AbstractSelection } from './Selection';
import { TransactionBuilder } from './transaction/TransactionBuilder';

export type MarkedText = MarkedNode[];

/**
 * We keep a compact format to make the doc light.
 * MarkedNode = { string: string; marks: {type: string, data: any}[] }
 */
export type MarkedNode<T = any> = {
    text: string;
    marks?: Mark[];
    type?: string;
    attrs?: T;
};
export type Mark<T = any> = { type: string; attrs?: T };

export interface Node<T extends Record<string, any> = any> {
    id: string;
    type: string;
    text?: MarkedText;
    attrs?: T;
    childrenIds?: string[];
}

export interface State {
    nodes: Record<string, Node>;
    rootId: string;
    selection?: AbstractSelection;
}

export interface HistoryItem {
    transaction: AppliedTransaction;
    state: State;
}

export interface History {
    items: HistoryItem[];
}

export type EventHandler<T = any> = (data: T) => void;

export type MarkSchema = {
    allowText: boolean;
    allowChildren: boolean | string[];
    attrs: Record<
        string,
        {
            default?: any;
            required?: boolean;
        }
    >;
    parse?: (domNode: HTMLElement) => Partial<Mark> | false;
    serialize?: (params: { serializedContent: string; mark: Mark }) => string;
    inline: true;
};

export const isMarkSchema = (value: SchemaItem): value is MarkSchema => {
    return !!value.inline;
};

export type NodeSchema = {
    allowText: boolean;
    allowChildren: boolean | string[];
    attrs: Record<
        string,
        {
            default?: any;
            required?: boolean;
        }
    >;
    parse?: (domNode: HTMLElement) => Partial<Node> | false;
    serialize?: (params: {
        serializedText: string;
        serializedChildren: string;
        node: Node;
        prevNode?: Node;
        nextNode?: Node;
    }) => string;
    normalize?: (params: {
        schema: Schema;
        state: State;
        child?: Node;
        node: Node;
        error?: string;
        transaction: TransactionBuilder;
    }) => void | string;
    inline?: false;
};

type SchemaItem = NodeSchema | MarkSchema;

export const isNodeSchema = (value: SchemaItem): value is NodeSchema => {
    return !value.inline;
};

export type Schema = Record<string, NodeSchema | MarkSchema>;
