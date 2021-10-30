import { CustomSelection, State } from '../../model/types';
import produce from 'immer';

export const focus = ({
    state,
    blockIds,
}: {
    state: State;
    blockIds: Record<string, CustomSelection>;
}) => {
    return {
        state: produce(state, (state) => {
            state.selection = {
                blockIds,
            };
        }),
        inversedStep: {
            name: 'focus',
            ...state.selection,
        },
    };
};
