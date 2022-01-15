import React from 'react';
import { MarkComponentAttrs } from '../../indexed';

export const Underline = ({ children }: MarkComponentAttrs) => {
    return <u>{children}</u>;
};
