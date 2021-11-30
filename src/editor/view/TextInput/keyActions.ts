import { spliceText } from '../../transaction/MarkedText/spliceText';
import { MarkedText } from '../../model/types';
import { Range, TextSelection } from '../../model/Selection';

export const keyBinder = ({
    range,
    e,
    value,
}: {
    range: Range;
    e: Event;
    value: MarkedText;
}): { value: MarkedText; range?: Range } | undefined => {
    let newLocalState:
        | { value: MarkedText; selection?: TextSelection }
        | undefined = undefined;

    config.some((eventConfig) => {
        if (eventConfig.match(e)) {
            newLocalState = eventConfig.callback({
                range,
                e,
                value,
            });
            return true;
        }
    });
    return newLocalState;
};

const config: {
    match: (e: Event) => boolean;
    callback: ({
        range,
        e,
        value,
    }: {
        range: Range;
        e: Event;
        value: MarkedText;
    }) => { value: MarkedText; range: Range };
}[] = [
    {
        match: (e) =>
            e.type === 'keydown' && (e as KeyboardEvent).key === 'Backspace',
        callback: ({ value, range, e }) => {
            e.preventDefault();
            return spliceText(value, {
                textInput: '',
                range: [
                    range[0] < range[1] ? range[0] : range[0] - 1,
                    range[1],
                ],
            });
        },
    },
    {
        match: (e) =>
            e.type === 'keydown' && (e as KeyboardEvent).key === 'Delete',
        callback: ({ value, range, e }) => {
            e.preventDefault();
            return spliceText(value, {
                textInput: '',
                range: [
                    range[0],
                    range[0] < range[1] ? range[1] : range[1] + 1,
                ],
            });
        },
    },
    {
        match: (e) =>
            e.type === 'keydown' &&
            (e as KeyboardEvent).key === 'Enter' &&
            (e as KeyboardEvent).shiftKey,
        callback: ({ value, range, e }) => {
            /** Avoid css glitch that doesn't goes inline before there is a letter */
            const softBreak = '\n';
            e.preventDefault();
            return spliceText(value, {
                textInput: softBreak,
                range: [range[0], range[1]],
            });
        },
    },
    {
        match: (e) =>
            e.type === 'input' &&
            ['insertText'].includes((e as InputEvent).inputType),
        callback: ({ value, range, e }) => {
            return spliceText(value, {
                textInput: (e as InputEvent).data ?? '',
                range,
            });
        },
    },
    {
        match: (e) => e.type === 'compositionend',
        callback: ({ value, range, e }) => {
            return spliceText(value, {
                textInput: (e as CompositionEvent).data ?? '',
                range,
            });
        },
    },
];
