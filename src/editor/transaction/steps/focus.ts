import { State } from '../../model/types';
import { AbstractSelection } from '../../model/Selection';

export const focus = ({
    state,
    selection,
}: {
    state: State;
    selection: AbstractSelection;
}) => {
    return {
        state: { ...state, selection: selection && selection.clone() },
        inversedStep: {
            name: 'focus',
            ...state.selection,
        },
    };
};
