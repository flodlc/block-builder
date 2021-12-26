import { RefObject, useLayoutEffect } from 'react';
import { View } from '../../View';

export const useEventHandlers = ({
    view,
    nodeId,
    ref,
}: {
    view: View;
    nodeId: string;
    ref: RefObject<HTMLDivElement>;
}) => {
    useLayoutEffect(() => {
        const handler = (e: KeyboardEvent) => {
            view.eventManager.record({ type: 'keydown', nodeId }, e);
        };
        ref.current?.addEventListener('keydown', handler);
        return () => ref.current?.removeEventListener('keydown', handler);
    }, [ref.current]);

    useLayoutEffect(() => {
        const handler = (e: Event) =>
            view.eventManager.record({ type: 'beforeinput', nodeId }, e);
        ref.current?.addEventListener('beforeinput', handler);
        return () => ref.current?.removeEventListener('beforeinput', handler);
    }, [ref.current]);

    useLayoutEffect(() => {
        const handler = (e: Event) =>
            view.eventManager.record({ type: 'input', nodeId }, e);
        ref.current?.addEventListener('input', handler);
        return () => ref.current?.removeEventListener('input', handler);
    }, [ref.current]);
};
