import produce from 'immer';
import { applyStep, applyTransaction } from '../transaction/transactions';
import {
    State,
    Node,
    EventHandler,
    History,
    HistoryItem,
    TextType,
} from './types';
import { TransactionBuilder } from '../transaction/TransactionBuilder';
import { Transaction } from '../transaction/types';
import { NodesExplorer } from './NodesExplorer';

export class Editor {
    state: State;
    history: History;
    commands = {};

    getJson = () => {
        return getNodeJson(this.state, this.state.nodes[this.state.rootId]);
    };

    private observers = {
        change: [] as EventHandler[],
        tr: [] as EventHandler[],
    };

    on = (eventName: 'change' | 'tr', handler: EventHandler) => {
        this.observers[eventName].push(handler);
    };

    off = (eventName: 'change', handler: EventHandler) => {
        const index = this.observers[eventName].indexOf(handler);
        this.observers[eventName].splice(index, 1);
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

    applyTransaction(transaction: Transaction) {
        const previousState = this.state;
        this.observers.tr.forEach((handlers) => handlers());
        const { state, appliedTransaction } = applyTransaction({
            state: this.state,
            transaction,
        });
        this.state = state;
        if (transaction.keepHistory) {
            this.history = produce(this.history, (history) => {
                history.items.push({
                    transaction: appliedTransaction as any,
                    state: previousState as any,
                });
            });
        }
        this.observers.change.forEach((handlers) => handlers());
    }

    private reverseTransaction(state: State, item: HistoryItem) {
        let draft = state;
        item.transaction.inversedSteps
            .slice()
            .reverse()
            .forEach((inversedStep) => {
                if (!inversedStep) return;
                // @ts-ignore
                const { state: newState } = applyStep[inversedStep.name]({
                    state: draft,
                    ...inversedStep,
                });
                draft = newState;
            });
        this.state = { ...draft, selection: item.state.selection };
        this.observers.change.forEach((handlers) => handlers());
    }

    createTransaction() {
        return new TransactionBuilder(this);
    }

    createNodeExplorer(nodeId: string) {
        return new NodesExplorer(this.state, nodeId);
    }

    constructor({
        rootId,
        nodes,
    }: {
        rootId: string;
        nodes: Record<string, Node>;
    }) {
        this.history = {
            items: [],
        };
        this.state = nodes
            ? { selection: { blockIds: {} }, rootId, nodes }
            : {
                  rootId: 'doc',
                  selection: { blockIds: {} },
                  nodes: {
                      doc: {
                          id: 'doc',
                          type: 'doc',
                          childrenIds: [],
                      },
                  },
              };
    }
}

function getNodeJson(state: State, node: Node) {
    type JsonNode = {
        id: string;
        type: string;
        text?: TextType;
        title?: string;
        children?: JsonNode[];
    };

    const nodeJson: JsonNode = {
        id: node.id,
        type: node.type,
    };

    if (node.text) {
        nodeJson.text = node.text;
        nodeJson.title = node.title;
    }

    if (node.childrenIds) {
        nodeJson.children = node.childrenIds.map((id) =>
            getNodeJson(state, state.nodes[id])
        );
    }
    return nodeJson;
}
