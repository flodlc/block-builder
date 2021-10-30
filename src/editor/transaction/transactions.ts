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
    const inversedSteps = transaction.steps.map((step) => {
        // @ts-ignore
        const { state: newState, inversedStep } = applyStep[step.name]({
            state: draft,
            ...step,
        });
        draft = newState;
        return inversedStep as Step;
    });
    return {
        state: draft,
        appliedTransaction: {
            ...transaction,
            inversedSteps,
        },
    };
};

export const applyStep = {
    focus,
    removeFrom,
    patch,
    insertAfter,
};
