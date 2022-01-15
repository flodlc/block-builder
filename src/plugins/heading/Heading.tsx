import React from 'react';
import { TextInput, TextSelection } from '../../indexed';
import { Children } from '../../indexed';
import { BlockComponentAttrs } from '../../indexed';
import { SelectionHalo } from '../../Playground/SelectionHalo';

export const Heading: React.FC<BlockComponentAttrs> = ({
    node,
    selection,
    blockSelected,
}) => {
    const textSelection = selection as TextSelection;

    return (
        <div
            className={`heading_${node.attrs?.level}`}
            data-uid={node.id}
            style={{ padding: '2px', position: 'relative' }}
        >
            <TextInput
                placeholder={<>Heading</>}
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
