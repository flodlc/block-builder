import { Node } from '../model/types';
import React from 'react';
import { Children } from './Children';

export const Root = ({ node }: { node: Node; parentId: string }) => {
    return <Children parentId={node.id} childrenIds={node.childrenIds} />;
};
