import { getElementSelection } from '../utils/getElementSelection';
import { spliceText } from '../../../model';
import { RefObject, useLayoutEffect } from 'react';
import { View } from '../../View';
import { Range } from '../../../model';
import { MarkedText } from '../../../model';

export const useDeleteHandler = ({
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
    const deleteHandler = () => {
        const currentRange = getElementSelection(ref.current) ?? range;
        if (!currentRange) return false;
        if (currentRange[0] !== currentRange[1]) return false;

        const newTextState = spliceText({
            text: value,
            editor: view.editor,
            textInput: '',
            range: [
                currentRange[1],
                currentRange[1] > currentRange[0]
                    ? currentRange[1]
                    : currentRange[0] + 1,
            ],
        });
        onInput(newTextState.value, newTextState.range);
        return true;
    };
    useLayoutEffect(() => {
        view.eventManager.on({ type: 'Delete', nodeId }, deleteHandler);
        return () =>
            view.eventManager.off({ type: 'Delete', nodeId }, deleteHandler);
    }, [deleteHandler]);
};
