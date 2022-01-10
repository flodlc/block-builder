import { RefObject, useLayoutEffect, useRef } from 'react';
import { EventManager } from './View';
import _ from 'lodash';

export const getNodeIdFromSelection = () => {
    const node = getSelection()?.focusNode;
    const element = (
        node?.nodeType === 1 ? node : node?.parentElement
    ) as HTMLElement | null;
    return (
        element?.closest('[data-uid]')?.getAttribute('data-uid') || undefined
    );
};

export const useBindDom = (
    viewDom: RefObject<HTMLElement>,
    eventManager: EventManager
) => {
    useLayoutEffect(() => {
        if (!viewDom.current) return;
        const dom = viewDom.current;

        const keydownHandler = (e: KeyboardEvent) => {
            const nodeId = getNodeIdFromSelection();
            if (!nodeId) return;
            eventManager.record({ type: 'keydown', nodeId }, e);
        };
        dom.addEventListener('keydown', keydownHandler);

        const selectionHandler = (e: Event) => {
            const nodeId = getNodeIdFromSelection();
            if (!nodeId) return;
            eventManager.record({ type: 'selectionchange', nodeId }, e);
        };
        document.addEventListener('selectionchange', selectionHandler);

        const beforeHandler = (e: Event) => {
            const nodeId = getNodeIdFromSelection();
            if (!nodeId) return;
            eventManager.record({ type: 'beforeinput', nodeId }, e);
        };
        dom.addEventListener('beforeinput', beforeHandler);

        const inputHandler = (e: Event) => {
            const nodeId = getNodeIdFromSelection();
            if (!nodeId) return;
            eventManager.record({ type: 'input', nodeId }, e);
        };
        dom.addEventListener('input', inputHandler);

        const compositionStartHandler = (e: Event) => {
            const nodeId = getNodeIdFromSelection();
            if (!nodeId) return;
            eventManager.record({ type: 'compositionstart', nodeId }, e);
        };
        dom.addEventListener('compositionstart', compositionStartHandler);

        const compositionEndHandler = (e: Event) => {
            const nodeId = getNodeIdFromSelection();
            if (!nodeId) return;
            eventManager.record({ type: 'compositionend', nodeId }, e);
        };
        dom.addEventListener('compositionend', compositionEndHandler);
        return () => {
            dom.removeEventListener('keydown', keydownHandler);
            document.removeEventListener('selectionchange', selectionHandler);
            dom.removeEventListener('beforeinput', beforeHandler);
            dom.removeEventListener('input', inputHandler);
            dom.removeEventListener(
                'compositionstart',
                compositionStartHandler
            );
            dom.removeEventListener('compositionend', compositionEndHandler);
        };
    });
};

export const useEventManager = () => {
    const observable = useRef<EventManager>({
        observers: {
            Enter: [],
            SoftBreak: [],
            Backspace: [],
            Delete: [],
            input: [],
            Tab: [],
            BackTab: [],
            CompositionStart: [],
            CompositionEnd: [],
            SelectionChange: [],
            SelectionChangePrevented: [],
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
            if (type === 'selectionchange') {
                const handled = triggerSelectionChange(nodeId, e);
                if (e !== handled?.e) {
                    trigger('SelectionChangePrevented', nodeId);
                }
                if (handled?.handled) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            } else if (type === 'compositionstart') {
                const handled = trigger('CompositionStart', nodeId);
                if (handled) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            } else if (type === 'compositionend') {
                const handled = trigger('CompositionEnd', nodeId);
                if (handled) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            } else if (type === 'keydown') {
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
                    e.preventDefault();
                    e.stopPropagation();
                }
            } else if (type === 'input') {
                const event = e as InputEvent;
                if (['deleteCompositionText'].includes(event.inputType)) {
                    return;
                }
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
        (nodeId: string | undefined) => {
            return trigger('Enter', nodeId);
        },
        40,
        { leading: true, trailing: false }
    );

    const triggerSelectionChange = (nodeId: string | undefined, e: Event) => {
        return { handled: trigger('SelectionChange', nodeId), e };
    };

    const trigger = (type: string, nodeId: string | undefined) => {
        return observable.current.observers?.[type]?.some((observer) => {
            if (!observer.nodeId || observer.nodeId === nodeId) {
                return observer.callback();
            }
            return false;
        });
    };

    return observable.current;
};
