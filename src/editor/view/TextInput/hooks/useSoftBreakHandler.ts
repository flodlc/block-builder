import { View } from '../../View';
import { MarkedText } from '../../../model/types';
import { Range } from '../../../model/Selection';
import { spliceText } from '../../../transaction/MarkedText/spliceText';
import { getElementSelection } from '../utils/getElementSelection';
import { RefObject, useLayoutEffect } from 'react';

export const useSoftBreakHandler = ({
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
    const softBreakHandler = () => {
        const currentRange = getElementSelection(ref.current) ?? range;
        if (!currentRange) return false;

        const newTextState = spliceText({
            text: value,
            editor: view.editor,
            textInput: '\n',
            range: currentRange,
        });
        onInput(newTextState.value, newTextState.range);
        return true;
    };

    useLayoutEffect(() => {
        view.eventManager.on({ type: 'SoftBreak', nodeId }, softBreakHandler);
        return () =>
            view.eventManager.off(
                { type: 'SoftBreak', nodeId },
                softBreakHandler
            );
    }, [softBreakHandler]);
};
