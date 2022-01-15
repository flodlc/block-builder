import React from 'react';
import { MarkComponentAttrs } from '../../indexed';

export const Link = ({
    children,
    mark,
}: MarkComponentAttrs<{ href: string }>) => {
    return <a href={mark.attrs?.href}>{children}</a>;
};
