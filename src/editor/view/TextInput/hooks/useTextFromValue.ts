import { useMemo } from 'react';
import { MarkedText } from '../../../model';

export const useTextFromValue = (value: MarkedText) => {
    return useMemo(() => {
        return value ? value.reduce((prev, curr) => prev + curr.text, '') : '';
    }, [value]);
};
