import produce from 'immer';
import { applyStep, applyTransaction } from './transaction/transactions';
import {
    EventHandler,
    History,
    HistoryItem,
    MarkedText,
    Schema,
    State,
} from './types';
import { Node, JsonNode } from './Node/Node';

import { TransactionBuilder } from './transaction/TransactionBuilder';
import { AppliedTransaction, Transaction } from './transaction/types';
import { ResolvedState, resolveState } from './StateResolver';
import { normalizeState } from './serializers/modelNormalizer';
import { parseHtml } from './serializers/htmlParser';
import { serializeNode } from './serializers/htmlSerializer';
import { Range } from './Selection';
import { Editor as EditorInterface, EditorEvent } from './Editor.interface';
import { createNode } from './Node/createNode';
import _ from 'lodash';

export class Editor implements EditorInterface {
    private resolvedState?: ResolvedState;
    private history: History;
    private observers: Record<string, EventHandler[]> = {
        change: [],
        tr: [],
        input: [],
    };
    private schema: Schema;
    private state: State;

    constructor({
        rootId,
        nodes,
        schema,
    }: {
        rootId: string;
        nodes: Record<string, JsonNode>;
        schema: Schema;
    }) {
        this.schema = schema;
        this.history = { items: [] };
        const mountedNodes = _.mapValues(
            nodes,
            (item) => new Node({ ...item, schema })
        );
        this.state = nodes
            ? { rootId, nodes: mountedNodes }
            : { rootId: 'doc', nodes: {} };
    }

    get nodes() {
        return this.state.nodes;
    }
    get selection() {
        return this.state.selection;
    }
    get rootId() {
        return this.state.rootId;
    }

    createNode = (type: string, node?: Partial<JsonNode>): Node =>
        createNode({ schema: this.schema, node, type });

    getParentId = (nodeId: string) => {
        return this.runQuery(({ nodes }) => nodes[nodeId].parentId);
    };

    getNode = (nodeId: string) => this.state.nodes[nodeId];

    isLastChild = (nodeId: string) => {
        const parentId = this.getParentId(nodeId);
        if (!parentId) return false;
        const parent = this.state.nodes[parentId];
        const currentIndex = parent.childrenIds?.indexOf(nodeId) ?? -1;
        return currentIndex === (parent.childrenIds?.length ?? 0) - 1;
    };

    isFirstChild = (nodeId: string) => {
        const parentId = this.getParentId(nodeId);
        if (!parentId) return false;
        const parent = this.getNode(parentId);
        const currentIndex = parent.childrenIds?.indexOf(nodeId) ?? -1;
        return currentIndex === 0;
    };

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
        this.trigger('tr_applied');
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
        delete this.resolvedState;
        this.trigger('tr');
        this.trigger('change');
    }
}

function getNodeJson(state: State, node: Node) {
    type JsonNodeWithChildren = {
        id: string;
        type: string;
        text?: MarkedText;
        children?: JsonNodeWithChildren[];
        attrs?: any;
    };

    const nodeJson: JsonNodeWithChildren = {
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
