import { RefObject, useLayoutEffect } from 'react';
import { View } from '../../View';
import { MarkedText } from '../../../model';
import { Range } from '../../../model';
import { spliceText } from '../../../model';
import { getInputDiff } from '../utils/getInputDiff';

export const useInputHandler = ({
    ref,
    view,
    nodeId,
    value,
    currentSavedText,
    onInput,
}: {
    ref: RefObject<HTMLDivElement>;
    view: View;
    nodeId: string;
    value: MarkedText;
    currentSavedText: string;
    onInput: (value: MarkedText, range?: Range) => void;
}) => {
    const textHandler = () => {
        const textState = handleTextChange({
            element: ref.current as HTMLElement,
            currentValue: value,
            previousText: currentSavedText,
        });
        if (!textState) return false;
        onInput(textState.value, textState.range);
        return true;
    };
    useLayoutEffect(() => {
        view.eventManager.on({ type: 'input', nodeId }, textHandler);
        return () =>
            view.eventManager.off({ type: 'input', nodeId }, textHandler);
    }, [textHandler]);
};

const handleTextChange = ({
    element,
    currentValue,
    previousText,
}: {
    element: HTMLElement;
    currentValue: MarkedText;
    previousText: string;
}) => {
    const inputDiff = getInputDiff(previousText, element);
    if (!inputDiff) return undefined;
    const newTextState = spliceText({
        text: currentValue,
        textInput: inputDiff.textInput,
        range: inputDiff.inputRange,
    });
    return {
        ...newTextState,
        range: undefined,
    };
};
