import React from 'react';

export const Bold = ({ children }: { children: any }) => {
    return <b>{children}</b>;
};

export const Italic = ({ children }: { children: any }) => {
    return <i>{children}</i>;
};

export const Underline = ({ children }: { children: any }) => {
    return <u>{children}</u>;
};
