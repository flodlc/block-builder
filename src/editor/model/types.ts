import { AppliedTransaction } from '../transaction/types';
import { AbstractSelection } from './Selection';

export type MarkedText = MarkedNode[];

/**
 * We keep a compact format to make the doc light.
 * MarkedNode = { string: string; marks: {type: string, data: any}[] }
 */
export type MarkedNode = { s: string; m?: Mark[] };
export type Mark<T = any> = { t: string; d?: T };

export interface Node {
    id: string;
    type: string;
    text?: MarkedText;
    attrs?: Record<string, any>;
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

export type NodeSchema = {
    allowText: boolean;
    allowChildren: boolean;
    attrs: Record<
        string,
        {
            default?: any;
            required?: boolean;
        }
    >;
};

export type Schema = Record<string, NodeSchema>;
