import React from 'react';
import { Mark } from '../../editor/model/types';

export const Bold = ({ children, mark }: { children: any; mark: Mark }) => {
    return (
        <b data-type="b" style={{ background: mark?.d?.bg }}>
            {children}
        </b>
    );
};
