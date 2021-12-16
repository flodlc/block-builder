import { handleTextChange } from './handleTextChange';
import { ActionHandler } from './types';
import { spliceText } from '../../../transaction/MarkedText/spliceText';

export const deleteActions: ActionHandler = {
    keydown: ({ e, editor, range, value }) => {
        e.preventDefault();
        const newTextState = spliceText({
            text: value,
            editor,
            textInput: '',
            range: [range[1], range[1] > range[0] ? range[1] : range[0] + 1],
        });

        return { textState: newTextState };
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
