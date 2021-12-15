import { getElementSelection } from '../utils/getElementSelection';
import { spliceText } from '../../../transaction/MarkedText/spliceText';
import { handleTextChange } from '../onInput';
import { isPreviousEditable } from './utils/isPreviousEditable';
import { ActionHandler } from './types';

export const backspaceActions: ActionHandler = {
    keydown: ({ e, element, range, value }) => {
        range = getElementSelection(element) ?? range;
        if (range[0] === 0 && range[1] === 0) return { textState: undefined };

        const nativeBackspace = !isPreviousEditable(value, range[0]);
        if (nativeBackspace) return { textState: undefined };
        e.preventDefault();
        const newTextState = spliceText(value, {
            textInput: '',
            range: [range[0] < range[1] ? range[0] : range[0] - 1, range[1]],
        });

        return {
            textState: newTextState,
        };
    },
    beforeinput: ({ range, value }) => {
        if (!range || (range[0] === 0 && range[1] === 0))
            return { textState: undefined };

        const nativeBackspace = !isPreviousEditable(value, range[0]);
        if (nativeBackspace) return { textState: undefined };

        const newTextState = spliceText(value, {
            textInput: '',
            range: [range[0] < range[1] ? range[0] : range[0] - 1, range[1]],
        });

        return { textState: newTextState };
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
