import { RefObject, useLayoutEffect } from 'react';
import { restoreSelection } from '../utils/restoreSelection';
import { Range } from '../../../model/Selection';

export const useRestoreSelection = ({
    ref,
    range,
    composing,
}: {
    ref: RefObject<HTMLDivElement>;
    range?: Range;
    composing: boolean;
}) => {
    useLayoutEffect(() => {
        if (!ref.current || composing || !range) return;
        restoreSelection(ref.current as HTMLDivElement, range);
    });
};
