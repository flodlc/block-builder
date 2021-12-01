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
            e.type === 'input' && (e as InputEvent).inputType === 'insertTexta',
        callback: ({ value, range, e }) => {
            return spliceText(value, {
                textInput: (e as InputEvent).data ?? '',
                range,
            });
        },
    },
    {
        match: (e) =>
            e.type === 'input' &&
            ['insertLineBreak', 'insertParagraph'].includes(
                (e as InputEvent).inputType
            ),
        callback: ({ value, range }) => {
            return spliceText(value, {
                textInput: '\n',
                range,
            });
        },
    },
    {
        match: (e) => e.type === 'compositionenda',
        callback: ({ value, range, e }) => {
            return spliceText(value, {
                textInput: (e as CompositionEvent).data ?? '',
                range,
            });
        },
    },
];
