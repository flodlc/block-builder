import React from 'react';
import { TextSelection } from '../../editor/model/Selection';
import { TextInput } from '../../editor/view/TextInput/TextInput';
import { Children } from '../../editor/view/Children';
import { BlockComponentAttrs } from '../../editor/view/types';

export const Card: React.FC<BlockComponentAttrs> = ({ node, selection }) => {
    const textSelection = selection as TextSelection;

    return (
        <div style={{ padding: '2px' }} data-uid={node.id}>
            <TextInput
                style={{
                    fontWeight: 700,
                    padding: '4px 0',
                    fontSize: '38px',
                    whiteSpace: 'break-spaces',
                    marginBottom: '20px',
                    letterSpacing: '0.006em',
                }}
                placeholder={<>Untitled</>}
                keepPlaceholder={true}
                value={node.text}
                range={textSelection?.range}
                nodeId={node.id}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Children parentId={node.id} childrenIds={node.childrenIds} />
            </div>
        </div>
    );
};
