import { RefObject, useLayoutEffect } from 'react';
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
    const saveDomSelection = () => {
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

    useLayoutEffect(() => {
        if (!ref.current || composing || !range) return;
        const currentRange = getElementSelection(ref.current as HTMLElement);
        TextSelection.areSameRange(currentRange, range);
        if (TextSelection.areSameRange(currentRange, range)) return;
        restoreSelection(ref.current as HTMLDivElement, range);
    }, [key, range]);
};
