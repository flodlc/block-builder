import { Schema, State } from '../types';
import { AppliedTransaction, Step, Transaction } from './types';
import { insertAfter } from './steps/insertAfter';
import { removeFrom } from './steps/removeFrom';
import { focus } from './steps/focus';
import { patch } from './steps/patch';

export const applyTransaction = ({
    state,
    transaction,
    schema,
}: {
    state: State;
    transaction: Transaction;
    schema: Schema;
}): { state: State; appliedTransaction: AppliedTransaction } => {
    let draft = state;
    const reversedSteps = transaction.steps.map((step) => {
        // @ts-ignore
        const { state: newState, reversedSteps } = applyStep[step.name]({
            state: draft,
            schema,
            ...step,
        });
        draft = newState;
        return reversedSteps as Step;
    });
    return {
        state: draft,
        appliedTransaction: {
            ...transaction,
            reversedSteps,
        },
    };
};

export const applyStep = {
    focus,
    removeFrom,
    patch,
    insertAfter,
};
