import React from 'react';
import { BlockComponentAttrs, useEditor } from '../../indexed';
import { SelectionHalo } from '../../Playground/SelectionHalo';
import { BlockSelection } from '../../indexed';

export const Divider: React.FC<BlockComponentAttrs> = ({
    node,
    blockSelected,
}) => {
    const editor = useEditor();

    const select = () => {
        editor
            .createTransaction()
            .focus(new BlockSelection([node.id]))
            .dispatch(false);
    };

    return (
        <div
            contentEditable={false}
            onClick={select}
            style={{
                position: 'relative',
                margin: '4px 0',
                padding: '6px 0',
                display: 'flex',
            }}
            data-uid={node.id}
            className="quote"
        >
            <div
                style={{
                    width: '100%',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
                }}
            />
            <SelectionHalo blockSelected={blockSelected} />
        </div>
    );
};
