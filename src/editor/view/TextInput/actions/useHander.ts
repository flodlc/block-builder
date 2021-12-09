import { MarkedText } from '../../../model/types';
import { Range } from '../../../model/Selection';
import { getElementSelection } from '../utils/getElementSelection';
import { ActionHandler, ActionName, ActionStatus } from './types';
import { handleTextChange } from '../onInput';
import { backspaceActions } from './backspace';
import { enterActions } from './enter';
import { deleteActions } from './delete';

export const useHandler = () => {
    return (props: {
        e: Event;
        element: HTMLElement;
        value: MarkedText;
        range: Range;
        previousText: string;
    }) => {
        props.range = props.range ?? getElementSelection(props.element);
        let action: ActionStatus = { textState: undefined };
        if (props.e.type === 'keydown') {
            action = onKeydown(props);
        } else if (props.e.type === 'beforeinput') {
            action = onBeforeInput(props);
        } else if (props.e.type === 'input') {
            action = onInput(props);
        }
        // console.log('ACTIONS :' + props.e.type + ' ', action, props.e);
        return action?.textState;
    };
};

const ACTIONS: Record<ActionName, ActionHandler> = {
    backspace: backspaceActions,
    Enter: enterActions,
    delete: deleteActions,
};

export const onKeydown = (props: {
    e: Event;
    element: HTMLElement;
    value: MarkedText;
    range: Range;
    previousText: string;
}) => {
    const event = props.e as KeyboardEvent;
    props.range = getElementSelection(props.element) ?? props.range;
    if (event.key === 'Backspace') {
        return ACTIONS.backspace.keydown(props);
    } else if (event.key === 'Enter') {
        return ACTIONS.Enter.keydown(props);
    } else {
        return {
            textState: undefined,
        };
    }
};

const onBeforeInput = (props: {
    e: Event;
    element: HTMLElement;
    value: MarkedText;
    range: Range;
    previousText: string;
}) => {
    const event = props.e as InputEvent;
    if (
        ['deleteContentBackward', 'deleteWordBackward'].includes(
            event.inputType
        )
    ) {
        return ACTIONS.backspace.beforeinput(props);
    } else if (
        ['insertLineBreak', 'insertParagraph'].includes(event.inputType)
    ) {
        return ACTIONS.Enter.beforeinput(props);
    } else {
        return {
            textState: undefined,
        };
    }
};

const onInput = (props: {
    e: Event;
    element: HTMLElement;
    value: MarkedText;
    range: Range;
    previousText: string;
}) => {
    const event = props.e as InputEvent;
    if (
        ['deleteContentBackward', 'deleteWordBackward'].includes(
            event.inputType
        )
    ) {
        return ACTIONS.backspace.input(props);
    } else if (
        ['deleteContentForward', 'deleteWordForward'].includes(event.inputType)
    ) {
        return ACTIONS.delete.input(props);
    } else if (
        ['insertLineBreak', 'insertParagraph'].includes(event.inputType)
    ) {
        return ACTIONS.Enter.input(props);
    } else if (/insert/i.test(event.inputType)) {
        return {
            textState: handleTextChange({
                ...props,
                currentValue: props.value,
            }),
        };
    } else {
        return { textState: undefined };
    }
};
