import React from 'react';
import { TextSelection } from '../../editor/model/Selection';
import { TextInput } from '../../editor/view/TextInput/TextInput';
import { Children } from '../../editor/view/Children';
import { BlockComponentAttrs } from '../../editor/view/types';
import { SelectionHalo } from '../../editor/view/SelectionHalo';

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
                    whiteSpace: 'pre-wrap',
                    '-webkit-user-modify': 'read-write',
                }}
                value={node.text}
                range={textSelection?.range}
                nodeId={node.id}
            />
            {(node.childrenIds?.length ?? 0) > 0 && (
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
