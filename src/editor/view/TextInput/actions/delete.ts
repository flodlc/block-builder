import { handleTextChange } from '../onInput';
import { ActionHandler } from './types';

export const deleteActions: ActionHandler = {
    keydown: () => {
        return { textState: undefined };
    },
    beforeinput: () => {
        return { textState: undefined };
    },
    input: (props) => {
        return {
            textState: handleTextChange({
                ...props,
                currentValue: props.value,
            }),
        };
    },
};
