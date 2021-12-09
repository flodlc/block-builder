import { RefObject, useState } from 'react';
import { isDomUpToDate, parseDom } from '../utils/parseDom';
import { Decoration } from '../../types';
import { MarkedText } from '../../../model/types';

export const useRenderingKey = ({
    ref,
    value,
    decorations,
    composing,
}: {
    ref: RefObject<HTMLDivElement>;
    value: MarkedText;
    decorations: Decoration[] | undefined;
    composing: boolean;
}) => {
    const [state] = useState({ key: Math.random() });

    const changedProps = useChangedProps({
        value,
        decorationsLength: decorations?.length,
    });

    if (ref.current) {
        const parsed = parseDom({ element: ref.current });
        if (
            !composing &&
            (!isDomUpToDate(value, parsed) || changedProps.decorationsLength)
        ) {
            state.key = Math.random();
            return { key: state.key, willUpdate: true };
        }
    }
    return { key: state.key, willUpdate: false };
};

function useChangedProps<T extends Record<string, any> = any>(props: T) {
    const [state] = useState<{ lastProps: T }>({ lastProps: {} as T });
    const changedProps = Object.entries(props)
        .filter((entry) => entry[1] !== state.lastProps[entry[0]])
        .reduce(
            (prev, entry) => ({
                ...prev,
                [entry[0]]: {
                    prev: state.lastProps[entry[0]],
                    current: entry[1],
                },
            }),
            {} as any
        );
    state.lastProps = { ...props };
    return changedProps;
}
