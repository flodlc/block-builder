import { spliceText } from '../../../transaction/MarkedText/spliceText';
import { ActionHandler } from './types';

export const enterActions: ActionHandler = {
    keydown: ({ range, value, e }) => {
        e.preventDefault();
        return {
            textState: {
                ...spliceText(value, {
                    textInput: '\n',
                    range,
                }),
            },
        };
    },
    beforeinput: () => ({ textState: undefined }),
    input: () => ({ textState: undefined }),
};
