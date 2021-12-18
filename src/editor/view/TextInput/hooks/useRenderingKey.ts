import { RefObject, useRef, useState } from 'react';
import { Decoration } from '../../types';
import { MarkedText } from '../../../model/types';

export const useRenderingKey = ({
    ref,
    value,
    decorations,
    composing,
    domChanged,
}: {
    ref: RefObject<HTMLDivElement>;
    value: MarkedText;
    decorations: Decoration[] | undefined;
    composing: boolean;
    domChanged: boolean;
}) => {
    const key = useRef(Math.random());

    const changedProps = useChangedProps({
        value,
        decorations: decorations,
    });
    if (ref.current) {
        if (
            !composing &&
            (domChanged || changedProps.value || changedProps.decorations)
        ) {
            key.current = Math.random();
            return { key: key.current, willUpdate: true };
        }
    }
    return { key: key.current, willUpdate: false };
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
