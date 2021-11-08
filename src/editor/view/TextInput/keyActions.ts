import { TextSelection } from '../types';
import { insertText } from '../../transaction/MarkedText/insertText';
import { MarkedText } from '../../model/types';

export const keyBinder = ({
    selection,
    e,
    value,
}: {
    selection: TextSelection;
    e: Event;
    value: MarkedText;
}): { value: MarkedText; selection?: TextSelection } | undefined => {
    let newLocalState:
        | { value: MarkedText; selection?: TextSelection }
        | undefined = undefined;

    config.some((eventConfig) => {
        if (eventConfig.match(e)) {
            newLocalState = eventConfig.callback({
                selection,
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
        selection,
        e,
        value,
    }: {
        selection: TextSelection;
        e: Event;
        value: MarkedText;
    }) => { value: MarkedText; selection: TextSelection };
}[] = [
    {
        match: (e) =>
            e.type === 'keydown' && (e as KeyboardEvent).key === 'Backspace',
        callback: ({ value, selection, e }) => {
            e.preventDefault();
            return insertText(value, {
                textInput: '',
                to: selection.to,
                from:
                    selection.from < selection.to
                        ? selection.from
                        : selection.from - 1,
            });
        },
    },
    {
        match: (e) =>
            e.type === 'keydown' && (e as KeyboardEvent).key === 'Delete',
        callback: ({ value, selection, e }) => {
            e.preventDefault();
            return insertText(value, {
                textInput: '',
                to:
                    selection.from < selection.to
                        ? selection.to
                        : selection.to + 1,
                from: selection.from,
            });
        },
    },
    {
        match: (e) =>
            e.type === 'input' &&
            ['insertText'].includes((e as InputEvent).inputType),
        callback: ({ value, selection, e }) => {
            return insertText(value, {
                textInput: (e as InputEvent).data ?? '',
                ...selection,
            });
        },
    },
    {
        match: (e) => e.type === 'compositionend',
        callback: ({ value, selection, e }) => {
            return insertText(value, {
                textInput: (e as CompositionEvent).data ?? '',
                ...selection,
            });
        },
    },
];
