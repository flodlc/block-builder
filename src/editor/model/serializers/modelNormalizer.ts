import { CompiledSchema } from '../schema';
import { CompiledNodeSchema, Node, State } from '../types';
import { TransactionBuilder } from '../transaction/TransactionBuilder';
import { AppliedTransaction, Transaction } from '../transaction/types';

export enum STATE_ERRORS {
    INVALID_CHILD = 'INVALID_CHILD',
    MISSING_ATTR = 'MISSING_ATTR',
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
    let stateOnProgress = state;
    const normalizeTransactions = [];
    let normalizeStatus = findErrorAndTransaction(
        schema,
        stateOnProgress.nodes[stateOnProgress.rootId],
        stateOnProgress
    );

    while (normalizeStatus.transaction) {
        const { state: normalizedState, appliedTransaction } = applyNormalizing(
            {
                state: stateOnProgress,
                transaction: normalizeStatus.transaction,
                error: normalizeStatus.error,
            }
        );
        normalizeTransactions.push(appliedTransaction);
        stateOnProgress = normalizedState;
        normalizeStatus = findErrorAndTransaction(
            schema,
            normalizedState.nodes[normalizedState.rootId],
            normalizedState
        );
    }

    if (normalizeStatus.error) {
        throw new Error(`Invalid state: ${normalizeStatus.error}`);
    }
    return { normalizedState: stateOnProgress, normalizeTransactions };
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
        if (childErrorData.error || childErrorData.transaction)
            return childErrorData;
    }

    const defaultAttrsTransaction = setDefaultAttrs(schema, node);
    if (defaultAttrsTransaction) {
        return {
            error: undefined,
            transaction: defaultAttrsTransaction,
        };
    }
    const { error, childNode } = findError(schema, node, state);
    return normalizeNode({ schema, node, childNode, state, error });
};

const setDefaultAttrs = (schema: CompiledSchema, node: Node) => {
    const nodeSchema = schema[node.type] as CompiledNodeSchema;

    const attrsPatch = {} as any;
    for (const attr of Object.keys(nodeSchema.attrs)) {
        const attrSchema = nodeSchema.attrs[attr];
        if (
            attrSchema.required &&
            attrSchema.default !== undefined &&
            node.attrs?.[attr] === undefined
        ) {
            attrsPatch[attr] = attrSchema.default;
        }
    }
    if (!Object.keys(attrsPatch).length) return;

    return new TransactionBuilder()
        .patch({
            nodeId: node.id,
            patch: { attrs: { ...node.attrs, ...attrsPatch } },
        })
        .getTransaction();
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

    for (const attr of Object.keys(nodeSchema.attrs)) {
        const attrSchema = nodeSchema.attrs[attr];
        if (attrSchema.required && node.attrs?.[attr] === undefined) {
            return { error: STATE_ERRORS.MISSING_ATTR, attr };
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
