import { CompiledSchema } from '../schema';
import { CompiledNodeSchema, Node, State } from '../types';
import { TransactionBuilder } from '../../transaction/TransactionBuilder';
import { AppliedTransaction, Transaction } from '../../transaction/types';

export enum STATE_ERRORS {
    INVALID_CHILD = 'INVALID_CHILD',
}

export const normalizeState = (
    schema: CompiledSchema,
    state: State,
    applyNormalizing: (args: {
        transaction: Transaction;
        state: State;
        error?: string;
    }) => {
        state: State;
        appliedTransaction: AppliedTransaction;
    }
) => {
    let normalizedState = state;
    let normalizeResult = findErrorAndTransaction(
        schema,
        normalizedState.nodes[normalizedState.rootId],
        normalizedState
    );

    while (normalizeResult.transaction) {
        normalizedState = applyNormalizing({
            state: normalizedState,
            transaction: normalizeResult.transaction,
            error: normalizeResult.error,
        }).state;
        normalizeResult = findErrorAndTransaction(
            schema,
            normalizedState.nodes[normalizedState.rootId],
            normalizedState
        );
    }

    if (normalizeResult.error) {
        throw new Error(`Invalid state: ${normalizeResult.error}`);
    }
    return normalizedState;
};

export const findErrorAndTransaction = (
    schema: CompiledSchema,
    node: Node,
    state: State
): { error?: string; transaction?: Transaction } => {
    for (const childId of node?.childrenIds?.slice().reverse() ?? []) {
        const childNode = state.nodes[childId];
        const childErrorData = findErrorAndTransaction(
            schema,
            childNode,
            state
        );
        if (childErrorData.error) return childErrorData;
    }

    const { error, childNode } = findError(schema, node, state);
    return normalizeNode({ schema, node, childNode, state, error });
};

const findError = (schema: CompiledSchema, node: Node, state: State) => {
    const nodeSchema = schema[node.type] as CompiledNodeSchema;
    for (const childId of node?.childrenIds?.slice().reverse() ?? []) {
        const childNode = state.nodes[childId];
        const childNodeSchema = schema[childNode.type] as CompiledNodeSchema;
        if (!isValidChild(schema, nodeSchema.type, childNodeSchema.type)) {
            return { error: STATE_ERRORS.INVALID_CHILD, childNode };
        }
    }
    return { error: undefined };
};

const normalizeNode = ({
    schema,
    node,
    childNode,
    state,
    error,
}: {
    schema: CompiledSchema;
    node: Node;
    childNode?: Node;
    state: State;
    error?: string;
}) => {
    const nodeSchema = schema[node.type] as CompiledNodeSchema;
    let transaction: Transaction | undefined = undefined;
    const transactionBuilder = new TransactionBuilder((steps) => {
        transaction = { steps, keepHistory: false };
    });
    const receivedError = nodeSchema.normalize?.({
        state,
        child: childNode,
        node,
        error,
        schema,
        transaction: transactionBuilder,
    });
    return {
        error: error ?? receivedError ?? undefined,
        transaction: transaction as Transaction | undefined,
    };
};

const isValidChild = (
    schema: CompiledSchema,
    parentType: string,
    childType: string
) => {
    const parentSchema = schema[parentType];
    return (
        parentSchema.allowChildren === true ||
        (Array.isArray(parentSchema.allowChildren) &&
            parentSchema.allowChildren.includes(childType))
    );
};
