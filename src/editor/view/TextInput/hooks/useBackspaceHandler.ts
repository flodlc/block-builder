import { getElementSelection } from '../utils/getElementSelection';
import { isPreviousNodeView } from '../utils/isPreviousNodeView';
import { spliceText } from '../../../model';
import { RefObject, useLayoutEffect } from 'react';
import { View } from '../../View';
import { Range } from '../../../model';
import { MarkedText } from '../../../model';
import { restoreSelection } from '../utils/restoreSelection';

export const useBackspaceHandler = ({
    ref,
    view,
    nodeId,
    value,
    range,
    onInput,
}: {
    ref: RefObject<HTMLDivElement>;
    view: View;
    nodeId: string;
    value: MarkedText;
    range?: Range;
    onInput: (value: MarkedText, range?: Range) => void;
}) => {
    const backspaceHandler = () => {
        const currentRange = getElementSelection(ref.current) ?? range;
        if (!currentRange) return false;
        if (currentRange[0] === 0 && currentRange[1] === 0) return false;
        const previousIsNodeView = isPreviousNodeView(value, currentRange[0]);

        if (!previousIsNodeView) return false;
        const newTextState = spliceText({
            text: value,
            editor: view.editor,
            textInput: '',
            range: [
                currentRange[0] < currentRange[1]
                    ? currentRange[0]
                    : currentRange[0] - 1,
                currentRange[1],
            ],
        });
        // restoreSelection(ref.current as HTMLElement, newTextState.range);
        setTimeout(() => {
            restoreSelection(ref.current as HTMLElement, newTextState.range);
            onInput(newTextState.value, newTextState.range);
        }, 0);
        // onInput(newTextState.value, newTextState.range);
        return true;
    };
    useLayoutEffect(() => {
        view.eventManager.on({ type: 'Backspace', nodeId }, backspaceHandler);
        return () =>
            view.eventManager.off(
                { type: 'Backspace', nodeId },
                backspaceHandler
            );
    }, [backspaceHandler]);
};
