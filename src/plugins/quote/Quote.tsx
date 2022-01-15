import React from 'react';
import { Children } from '../../indexed';
import { BlockComponentAttrs } from '../../indexed';
import { SelectionHalo } from '../../Playground/SelectionHalo';

export const Quote: React.FC<BlockComponentAttrs> = ({
    node,
    blockSelected,
}) => {
    return (
        <div
            style={{
                position: 'relative',
                padding: '0px 16px',
                margin: '4px 0',
                borderLeft: '3px solid white',
            }}
            data-uid={node.id}
            className="quote"
        >
            <div>
                <Children parentId={node.id} childrenIds={node.childrenIds} />
            </div>
            <SelectionHalo blockSelected={blockSelected} />
        </div>
    );
};
