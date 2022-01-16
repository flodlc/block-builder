import React from 'react';
import { TextSelection } from '../../indexed';
import { TextInput } from '../../indexed';
import { Children } from '../../indexed';
import { BlockComponentAttrs } from '../../indexed';
import { SelectionHalo } from '../../Playground/SelectionHalo';

export const Text: React.FC<BlockComponentAttrs> = ({
    node,
    selection,
    blockSelected,
}) => {
    const textSelection = selection as TextSelection;
    return (
        <div
            className={'paragraph'}
            data-uid={node.id}
            style={{ padding: '2px', position: 'relative' }}
        >
            <TextInput
                style={{
                    padding: '4px 0',
                    whiteSpace: 'break-spaces',
                }}
                value={node.text}
                range={textSelection?.range}
                nodeId={node.id}
            />
            {!!node.childrenIds?.length && (
                <div
                    style={{
                        paddingLeft: '24px',
                        marginTop: '2px',
                        marginBottom: '-2px',
                    }}
                >
                    <Children
                        parentId={node.id}
                        childrenIds={node.childrenIds}
                    />
                </div>
            )}
            <SelectionHalo blockSelected={blockSelected} />
        </div>
    );
};
