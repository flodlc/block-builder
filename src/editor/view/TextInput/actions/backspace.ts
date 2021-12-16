import { getElementSelection } from '../utils/getElementSelection';
import { spliceText } from '../../../transaction/MarkedText/spliceText';
import { handleTextChange } from '../onInput';
import { isPreviousNodeView } from './utils/isPreviousNodeView';
import { ActionHandler } from './types';

export const backspaceActions: ActionHandler = {
    keydown: ({ e, element, range, value, editor }) => {
        range = getElementSelection(element) ?? range;
        if (range[0] === 0 && range[1] === 0) return { textState: undefined };

        const nativeBackspace = !isPreviousNodeView(
            editor.schema,
            value,
            range[0]
        );

        if (nativeBackspace) return { textState: undefined };
        e.preventDefault();
        const newTextState = spliceText({
            text: value,
            editor,
            textInput: '',
            range: [range[0] < range[1] ? range[0] : range[0] - 1, range[1]],
        });

        return {
            textState: newTextState,
        };
    },
    beforeinput: ({ range, value, editor }) => {
        if (!range || (range[0] === 0 && range[1] === 0))
            return { textState: undefined };

        const nativeBackspace = !isPreviousNodeView(
            editor.schema,
            value,
            range[0]
        );
        if (nativeBackspace) return { textState: undefined };

        const newTextState = spliceText({
            text: value,
            editor,
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
