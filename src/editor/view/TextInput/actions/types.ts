import { MarkedText } from '../../../model/types';
import { Range } from '../../../model/Selection';

export type ActionName = 'backspace' | 'Enter' | 'delete';
export type EventName = 'keydown' | 'beforeinput' | 'input';

export type ActionStatus = {
    textState: { value: MarkedText; range?: Range } | undefined | void;
    waitInput?: boolean;
};

export type ActionHandler = Record<
    EventName,
    (props: {
        e: Event;
        previousText: string;
        value: MarkedText;
        range: Range;
        element: HTMLElement;
    }) => ActionStatus
>;
