import { AppliedTransaction } from '../transaction/types';

export interface Node {
    id: string;
    type: string;
    childrenIds?: string[];
    text?: string;
    title?: string;
}

export interface State {
    nodes: Record<string, Node>;
    rootId: string;
    selection: Selection;
}

export type CustomSelection = { focusOffset?: number };

export interface Selection {
    blockIds: Record<string, CustomSelection>;
}

export interface HistoryItem {
    transaction: AppliedTransaction;
    state: State;
}

export interface History {
    items: HistoryItem[];
}

export type EventHandler = () => void;
