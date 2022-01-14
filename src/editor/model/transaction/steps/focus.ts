import { State } from '../../types';
import { AbstractSelection } from '../../Selection';

export const focus = ({
    state,
    selection,
}: {
    state: State;
    selection: AbstractSelection;
}) => {
    return {
        state: { ...state, selection: selection && selection.clone() },
        reversedSteps: {
            name: 'focus',
            ...state.selection,
        },
    };
};
