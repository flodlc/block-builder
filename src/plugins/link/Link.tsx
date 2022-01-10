import React from 'react';
import { MarkComponentAttrs } from '../../editor/view/types';

export const Link = ({
    children,
    mark,
}: MarkComponentAttrs<{ href: string }>) => {
    return <a href={mark.data?.href}>{children}</a>;
};
