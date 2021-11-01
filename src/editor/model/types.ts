import REACT_MARKS from '../../params/REACT_MARKS';
import { AppliedTransaction } from '../transaction/types';

export type TextType =
    | string
    | { text?: string; component?: keyof typeof REACT_MARKS }[];

export interface Node {
    id: string;
    type: string;
    childrenIds?: string[];
    text?: TextType;
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
