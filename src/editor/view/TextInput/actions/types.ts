import { MarkedText } from '../../../model/types';
import { Range } from '../../../model/Selection';
import { Editor } from '../../../model/Editor';

export type ActionName = 'backspace' | 'Enter' | 'delete';
export type EventName = 'keydown' | 'beforeinput' | 'input';

export type ActionStatus = {
    textState: { value: MarkedText; range?: Range } | undefined | void;
};

export type ActionHandler = Record<
    EventName,
    (props: {
        e: Event;
        editor: Editor;
        previousText: string;
        value: MarkedText;
        range: Range;
        element: HTMLElement;
    }) => ActionStatus
>;
