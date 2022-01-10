import React from 'react';
import { MarkComponentAttrs } from '../../editor/view/types';

export const Underline = ({ children }: MarkComponentAttrs) => {
    return <u>{children}</u>;
};
