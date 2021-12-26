import { useRef } from 'react';
import { EventManager } from './View';
import _ from 'lodash';

export const useEventManager = () => {
    const observable = useRef<EventManager>({
        inputFrame: undefined,
        observers: {
            Enter: [],
            SoftBreak: [],
            Backspace: [],
            Delete: [],
            input: [],
            Tab: [],
            BackTab: [],
        },
        on: ({ type, nodeId }, callback) => {
            observable.current.observers[type] = observable.current.observers[
                type
            ].concat([
                {
                    nodeId,
                    callback,
                },
            ]);
        },
        off: ({ type, nodeId }, callback) => {
            const observers = observable.current.observers[type].slice();
            const index = observers.findIndex(
                (item) => item.nodeId === nodeId && item.callback === callback
            );
            if (index > -1) {
                observers.splice(index, 1);
                observable.current.observers[type] = observers;
            }
        },
        record: ({ type, nodeId }, e) => {
            if (type === 'keydown') {
                const event = e as KeyboardEvent;
                let handled = false;
                if (event.key === 'Backspace') {
                    handled = trigger('Backspace', nodeId);
                } else if (event.key === 'Enter' && !event.shiftKey) {
                    handled = triggerEnter(nodeId) ?? false;
                } else if (event.key === 'Enter' && event.shiftKey) {
                    handled = trigger('SoftBreak', nodeId);
                } else if (event.key === 'Delete') {
                    handled = trigger('Delete', nodeId);
                } else if (event.key === 'Tab' && event.shiftKey) {
                    handled = trigger('BackTab', nodeId);
                } else if (event.key === 'Tab') {
                    handled = trigger('Tab', nodeId);
                }
                if (handled) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            } else if (type === 'beforeinput') {
                const event = e as InputEvent;
                observable.current.inputFrame = {
                    type: event.inputType,
                };
                let handled = false;
                if (
                    event.inputType === 'insertParagraph' ||
                    /\n/.test(event.data ?? '')
                ) {
                    handled = triggerEnter(nodeId) ?? false;
                } else if (event.inputType === 'deleteContentBackward') {
                    handled = trigger('Backspace', nodeId);
                } else if (event.inputType === 'deleteContentForward') {
                    handled = trigger('Delete', nodeId);
                }
                if (handled) {
                    observable.current.inputFrame = undefined;
                    e.preventDefault();
                    e.stopPropagation();
                }
            } else if (type === 'input') {
                observable.current.inputFrame = undefined;
                const handled = trigger('input', nodeId);
                if (handled) {
                    // e.stopPropagation();
                    return;
                }
            }
        },
    } as EventManager);

    // needs a throttle to prevent twice firing n chrome when composing
    const triggerEnter = _.throttle(
        (nodeId?: string) => {
            return trigger('Enter', nodeId);
        },
        40,
        { leading: true, trailing: false }
    );

    const trigger = (type: string, nodeId?: string) => {
        return observable.current.observers?.[type]?.some((observer) => {
            if (!observer.nodeId || observer.nodeId === nodeId) {
                return observer.callback();
            }
            return false;
        });
    };

    return observable.current;
};
