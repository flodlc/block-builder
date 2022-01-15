import produce from 'immer';
import { applyStep, applyTransaction } from './transaction/transactions';
import {
    EventHandler,
    History,
    HistoryItem,
    MarkedText,
    Node,
    Schema,
    State,
} from './types';
import { TransactionBuilder } from './transaction/TransactionBuilder';
import { AppliedTransaction, Transaction } from './transaction/types';
import { ResolvedState, resolveState } from './StateResolver';
import { normalizeState } from './serializers/modelNormalizer';
import { parseHtml } from './serializers/htmlParser';
import { serializeNode } from './serializers/htmlSerializer';
import { AbstractSelection, Range } from './Selection';
import { Editor as EditorInterface, EditorEvent } from './Editor.interface';
import { createNode } from './Node/createNode';

export class Editor implements EditorInterface {
    private resolvedState?: ResolvedState;
    private history: History;
    private observers: Record<string, EventHandler[]> = {
        change: [],
        tr: [],
        input: [],
    };

    constructor({
        rootId,
        nodes,
        schema,
    }: {
        rootId: string;
        nodes: Record<string, Node>;
        schema: Schema;
    }) {
        this.schema = schema;
        this.history = { items: [] };
        this.state = nodes ? { rootId, nodes } : { rootId: 'doc', nodes: {} };
    }

    state: State;
    selection?: AbstractSelection;
    schema: Schema;

    createNode = (type: string, node?: Partial<Node>): Node =>
        createNode({ schema: this.schema, node, type });

    parseHtml = (html: string) => parseHtml({ html, schema: this.schema });

    serializeNode = (node: Node, deep: boolean, range?: Range) =>
        serializeNode(this.schema, node, this.state.nodes, deep, range);

    getJson = () =>
        getNodeJson(this.state, this.state.nodes[this.state.rootId]);

    runQuery = <T>(
        query: (resolvedState: ResolvedState, editor: EditorInterface) => T
    ): T => {
        this.resolvedState = this.resolvedState ?? resolveState(this.state);
        return query(this.resolvedState, this);
    };

    runCommand = (
        command: (editor: EditorInterface) => void | boolean
    ): void | boolean => command(this);

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

    createTransaction = () =>
        new TransactionBuilder((steps, keepHistory) => {
            this.applyTransaction({ steps, keepHistory });
        });

    private normalizeAfterTransaction = ({
        state,
        appliedTransaction,
    }: {
        state: State;
        appliedTransaction: AppliedTransaction;
    }) => {
        let hasNormalized = false;
        const { normalizedState, normalizeTransactions } = normalizeState(
            this.schema,
            state,
            ({ transaction: normalizeTransaction, state, error }) => {
                if (error) console.error(`Invalid state fixed: ${error}`);
                hasNormalized = true;
                return applyTransaction({
                    state,
                    transaction: normalizeTransaction,
                    schema: this.schema,
                });
            }
        );
        return {
            normalizedState,
            hasNormalized,
            normalizedAppliedTransaction: {
                steps: appliedTransaction.steps.concat(
                    normalizeTransactions.flatMap((item) => item.steps)
                ),
                reversedSteps: appliedTransaction.reversedSteps.concat(
                    normalizeTransactions.flatMap((item) => item.reversedSteps)
                ),
            },
        };
    };

    private applyTransaction(transaction: Transaction) {
        const previousState = this.state;
        const { state, appliedTransaction } = applyTransaction({
            state: this.state,
            transaction,
            schema: this.schema,
        });

        const { normalizedAppliedTransaction, normalizedState, hasNormalized } =
            this.normalizeAfterTransaction({ state, appliedTransaction });

        this.state = normalizedState;
        this.selection = normalizedState.selection;
        delete this.resolvedState;

        this.trigger('tr');

        if (transaction.keepHistory || hasNormalized) {
            this.history = produce(this.history, (history) => {
                history.items.push({
                    transaction: normalizedAppliedTransaction,
                    state: previousState,
                });
            });
            this.trigger('change');
        }
        return { state, normalizedAppliedTransaction };
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
                    schema: this.schema,
                    ...reversedSteps,
                });
                draft = newState;
            });
        this.state = { ...draft, selection: item.state.selection };
        this.selection = item.state.selection;
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
