import { RefObject, useLayoutEffect, useRef } from 'react';
import { restoreSelection } from '../utils/restoreSelection';
import { Range, TextSelection } from '../../../model/Selection';
import { getElementSelection } from '../utils/getElementSelection';

export const useRestoreSelection = ({
    ref,
    range,
    key,
    composing,
    updateRange,
}: {
    ref: RefObject<HTMLDivElement>;
    range?: Range;
    key: number;
    composing: boolean;
    updateRange: (range: Range) => void;
}) => {
    const timeout = useRef<NodeJS.Timeout>();
    const saveDomSelection = () => {
        if (timeout.current) return;
        const currentRange = getElementSelection(ref.current as HTMLElement);
        if (!currentRange) return;
        updateRange(currentRange);
        return;
    };

    useLayoutEffect(() => {
        const selectHandler = () => saveDomSelection();
        document.addEventListener('selectionchange', selectHandler);
        return () =>
            document.removeEventListener('selectionchange', selectHandler);
    }, [saveDomSelection]);

    const restoreSelectionIfNeeded = () => {
        if (!ref.current) return;
        const currentRange = getElementSelection(ref.current as HTMLElement);
        if (TextSelection.areSameRange(currentRange, range)) return;
        restoreSelection(ref.current as HTMLDivElement, range);
    };

    useLayoutEffect(() => {
        if (!ref.current || composing || !range) return;
        restoreSelectionIfNeeded();
        if (timeout.current) clearTimeout(timeout.current);
        if (range[0] !== range[1]) return;
        // timeout is needed because on android Gboard and swiftkey change the selection after deleting an element.
        timeout.current = setTimeout(() => {
            restoreSelectionIfNeeded();
            timeout.current = undefined;
        }, 0);
    }, [key, range]);
};
