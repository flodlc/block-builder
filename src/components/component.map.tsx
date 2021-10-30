import React from 'react';
import { CustomSelection, Node } from '../editor/model/types';
import { Button } from './Button';
import { Callout } from './Callout';
import { Text } from './Text';
import { Toggle } from './Toggle';

export const componentMap: Record<
    string,
    React.FunctionComponent<{
        node: Node;
        parentId: string;
        selection?: CustomSelection;
    }>
> = {
    text: Text,
    callout: Callout,
    button: Button,
    titledList: Toggle,
};
