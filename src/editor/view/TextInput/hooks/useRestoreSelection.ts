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
    const firstRender = useRef(true);
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
        if (!ref.current || !range) return;
        restoreSelectionIfNeeded(
            ref.current as HTMLDivElement,
            (editor.state.selection as TextSelection)?.range,
            composing
        );
        if (timeout.current) clearTimeout(timeout.current);
        if (range[0] !== range[1]) return;
        // debounced timeout is needed because on android Gboard and swiftkey change the selection after deleting an element.
        // Looks like a hack but be careful with this code.
        timeout.current = setTimeout(() => {
            debouncedRestoreSelectionIfNeeded(
                ref.current as HTMLDivElement,
                editor,
                composing
            );
            timeout.current = undefined;
        }, 0);
    }, [key, range]);

    useLayoutEffect(() => {
        firstRender.current = false;
    });
};

const restoreSelectionIfNeeded = (
    container: HTMLDivElement,
    range: Range,
    composing: boolean
) => {
    if (!container) return;
    if (!range) return;
    const currentRange = getElementSelection(container);
    const force = range && !currentRange;
    if (composing && !force) return;

    if (TextSelection.areSameRange(currentRange, range)) return;
    restoreSelection(container, range);
};

const debouncedRestoreSelectionIfNeeded = _.debounce(
    (container: HTMLDivElement, editor: Editor, composing: boolean) =>
        restoreSelectionIfNeeded(
            container,
            (editor.state.selection as TextSelection)?.range,
            composing
        ),
    20,
    { leading: false, trailing: true }
);
