import React from 'react';
import { BlockComponentAttrs } from '../../indexed';
import { TextSelection } from '../../indexed';
import { TextInput } from '../../indexed';
import { Children } from '../../indexed';
import { SelectionHalo } from '../../Playground/SelectionHalo';

export const Uli: React.FC<BlockComponentAttrs> = ({
    node,
    blockSelected,
    selection,
}) => {
    const textSelection = selection as TextSelection;
    return (
        <div
            style={{
                padding: '2px',
                position: 'relative',
                paddingLeft: '20pxa',
            }}
            data-uid={node.id}
            className="uli"
        >
            <TextInput
                style={{ padding: '4px 0 4px 20px' }}
                nodeId={node.id}
                value={node.text}
                range={textSelection?.range}
                placeholder={<>Bullet List</>}
                keepPlaceholder={true}
            />
            <div
                style={{
                    paddingLeft: '24px',
                    marginTop: '2px',
                    marginBottom: '-2px',
                }}
            >
                <Children parentId={node.id} childrenIds={node.childrenIds} />
            </div>
            <SelectionHalo blockSelected={blockSelected} />
        </div>
    );
};
