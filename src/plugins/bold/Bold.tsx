import React from 'react';
import { MarkComponentAttrs } from '../../editor/view/types';

export const Bold = ({ children }: MarkComponentAttrs) => {
    return <b>{children}</b>;
};
