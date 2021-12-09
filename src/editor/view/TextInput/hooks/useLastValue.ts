import { useMemo } from 'react';
import { MarkedText } from '../../../model/types';

export const useLastValue = (value: MarkedText) => {
    return useMemo(() => {
        return value ? value.reduce((prev, curr) => prev + curr.s, '') : '';
    }, [value]);
};
