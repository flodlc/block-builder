import { State } from '../model/types';
import { AppliedTransaction, Step, Transaction } from './types';
import { insertAfter } from './steps/insertAfter';
import { removeFrom } from './steps/removeFrom';
import { focus } from './steps/focus';
import { patch } from './steps/patch';

export const applyTransaction = ({
    state,
    transaction,
}: {
    state: State;
    transaction: Transaction;
}): { state: State; appliedTransaction: AppliedTransaction } => {
    let draft = state;
    const reversedSteps = transaction.steps.map((step) => {
        // @ts-ignore
        const { state: newState, reversedSteps } = applyStep[step.name]({
            state: draft,
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
