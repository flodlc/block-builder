import React from 'react';
import { Children } from '../../editor/view/Children';
import { BlockComponentAttrs } from '../../editor/view/types';
import { SelectionHalo } from '../../editor/view/SelectionHalo';

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
                display: 'flex',
                borderLeft: '3px solid white',
            }}
            data-uid={node.id}
            className="quote"
        >
            <div style={{ flex: 1 }}>
                <Children parentId={node.id} childrenIds={node.childrenIds} />
            </div>
            <SelectionHalo blockSelected={blockSelected} />
        </div>
    );
};
