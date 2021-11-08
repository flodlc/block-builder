import { State } from '../../model/types';
import produce from 'immer';

export const focus = ({
    state,
    blockIds,
}: {
    state: State;
    blockIds: Record<string, any>;
}) => {
    return {
        state: produce(state, (draftState) => {
            draftState.selection.blockIds = JSON.parse(
                JSON.stringify(blockIds)
            );
        }),
        inversedStep: {
            name: 'focus',
            ...state.selection,
        },
    };
};
