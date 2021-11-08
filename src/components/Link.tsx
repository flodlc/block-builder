import React from 'react';
import { Mark } from '../editor/model/types';

export const Link = ({
    mark,
    children,
    updateMark,
}: {
    mark: Mark;
    children: any;
    updateMark: (mark: Mark) => void;
}) => {
    const click = () => {
        updateMark({ ...mark, d: { url: 'www.google.com' } });
    };

    return (
        <a onClick={click} target="_blank" href={mark?.d?.url} rel="noreferrer">
            {children}
        </a>
    );
};
