import { RefObject, useLayoutEffect, useRef } from 'react';
import { restoreSelection } from '../utils/restoreSelection';
import { Range, TextSelection } from '../../../model/Selection';
import { getElementSelection } from '../utils/getElementSelection';
import _ from 'lodash';
import { Editor } from '../../../model/Editor';

export const useRestoreSelection = ({
    editor,
    ref,
    range,
    key,
    composing,
    updateRange,
}: {
    editor: Editor;
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

    useLayoutEffect(() => {
        if (!ref.current || composing || !range) return;
        restoreSelectionIfNeeded(
            ref.current as HTMLDivElement,
            (editor.state.selection as TextSelection)?.range
        );
        if (timeout.current) clearTimeout(timeout.current);
        if (range[0] !== range[1]) return;
        // debounced timeout is needed because on android Gboard and swiftkey change the selection after deleting an element.
        // Looks like a hack but be careful with this code.
        timeout.current = setTimeout(() => {
            debouncedRestoreSelectionIfNeeded(
                ref.current as HTMLDivElement,
                editor
            );
            timeout.current = undefined;
        }, 0);
    }, [key, range]);
};

const restoreSelectionIfNeeded = (container: HTMLDivElement, range?: Range) => {
    if (!container) return;
    const currentRange = getElementSelection(container);
    if (TextSelection.areSameRange(currentRange, range)) return;
    restoreSelection(container, range);
};

const debouncedRestoreSelectionIfNeeded = _.debounce(
    (container: HTMLDivElement, editor: Editor) =>
        restoreSelectionIfNeeded(
            container,
            (editor.state.selection as TextSelection)?.range
        ),
    20,
    { leading: false, trailing: true }
);
