import { AppliedTransaction } from '../transaction/types';
import { AbstractSelection } from './Selection';

export type MarkedText = MarkedNode[];

/**
 * We keep a compact format to make the doc light.
 * MarkedNode = { string: string; marks: {type: string, data: any}[] }
 */
export type MarkedNode = { s: string; m?: Mark[] };
export type Mark = { t: string; d?: any };

export interface Node {
    id: string;
    type: string;
    childrenIds?: string[];
    text?: MarkedText;
    title?: string;
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
