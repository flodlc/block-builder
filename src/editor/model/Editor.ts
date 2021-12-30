import produce from 'immer';
import { applyStep, applyTransaction } from '../transaction/transactions';
import {
    State,
    Node,
    EventHandler,
    History,
    HistoryItem,
    MarkedText,
} from './types';
import { TransactionBuilder } from '../transaction/TransactionBuilder';
import { Transaction } from '../transaction/types';
import { ResolvedState, resolveState } from './StateResolver';
import { CompiledSchema } from './schema';

export type EditorEvent = 'change' | 'tr' | 'input' | string;

export class Editor {
    state: State;
    resolvedState?: ResolvedState;
    history: History;
    schema: CompiledSchema;

    constructor({
        rootId,
        nodes,
    }: {
        rootId: string;
        nodes: Record<string, Node>;
    }) {
        this.schema = {};
        this.history = { items: [] };
        this.state = nodes ? { rootId, nodes } : { rootId: 'doc', nodes: {} };
    }

    getJson = () =>
        getNodeJson(this.state, this.state.nodes[this.state.rootId]);

    private observers: Record<string, EventHandler[]> = {
        change: [],
        tr: [],
        input: [],
    };

    runQuery = <T>(
        query: (resolvedState: ResolvedState, editor: Editor) => T
    ): T => {
        this.resolvedState = this.resolvedState ?? resolveState(this.state);
        return query(this.resolvedState, this);
    };

    runCommand = (command: (editor: Editor) => void | boolean) => command(this);

    on = <T>(eventName: EditorEvent, handler: EventHandler<T>) => {
        this.observers[eventName] = this.observers[eventName] ?? [];
        this.observers[eventName] = [...this.observers[eventName], handler];
    };

    off = (eventName: EditorEvent, handler: EventHandler) => {
        const index = this.observers[eventName].indexOf(handler);
        const clone = this.observers[eventName].slice();
        clone.splice(index, 1);
        this.observers[eventName] = clone;
    };

    trigger = <T = any>(eventName: EditorEvent, data?: T) => {
        this.observers?.[eventName]?.forEach((handlers) => handlers(data));
        return data as T;
    };

    back = () => {
        const previousItem = this.history.items[this.history.items.length - 1];
        if (previousItem) {
            this.history = produce(this.history, (history) => {
                history.items.splice(history.items.length - 1, 1);
            });
            this.reverseTransaction(this.state, previousItem);
        }
    };

    createTransaction = () => new TransactionBuilder(this);

    applyTransaction(transaction: Transaction) {
        const previousState = this.state;
        const { state, appliedTransaction } = applyTransaction({
            state: this.state,
            transaction,
        });
        this.state = state;
        delete this.resolvedState;

        this.trigger('tr');

        if (transaction.keepHistory) {
            this.history = produce(this.history, (history) => {
                history.items.push({
                    transaction: appliedTransaction,
                    state: previousState,
                });
            });
            this.trigger('change');
        }
    }

    private reverseTransaction(state: State, item: HistoryItem) {
        let draft = state;
        item.transaction.reversedSteps
            .slice()
            .reverse()
            .forEach((reversedSteps) => {
                if (!reversedSteps) return;
                // @ts-ignore
                const { state: newState } = applyStep[reversedSteps.name]({
                    state: draft,
                    ...reversedSteps,
                });
                draft = newState;
            });
        this.state = { ...draft, selection: item.state.selection };
        delete this.resolvedState;
        this.trigger('tr');
        this.trigger('change');
    }
}

function getNodeJson(state: State, node: Node) {
    type JsonNode = {
        id: string;
        type: string;
        text?: MarkedText;
        children?: JsonNode[];
        attrs?: any;
    };

    const nodeJson: JsonNode = {
        id: node.id,
        type: node.type,
    };

    if (node.text) {
        nodeJson.text = node.text;
    }

    if (node.attrs) {
        nodeJson.attrs = node.attrs;
    }

    if (node.childrenIds) {
        nodeJson.children = node.childrenIds.map((id) =>
            getNodeJson(state, state.nodes[id])
        );
    }
    return nodeJson;
}
