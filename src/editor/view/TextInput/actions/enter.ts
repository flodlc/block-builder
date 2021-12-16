import { spliceText } from '../../../transaction/MarkedText/spliceText';
import { ActionHandler } from './types';

export const enterActions: ActionHandler = {
    keydown: ({ range, value, e, editor }) => {
        e.preventDefault();
        return {
            textState: {
                ...spliceText({
                    text: value,
                    editor,
                    textInput: '\n',
                    range,
                }),
            },
        };
    },
    beforeinput: () => ({ textState: undefined }),
    input: () => ({ textState: undefined }),
};
