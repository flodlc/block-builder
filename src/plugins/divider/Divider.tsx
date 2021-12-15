import React, { useContext } from 'react';
import { BlockComponentAttrs } from '../../editor/view/types';
import { SelectionHalo } from '../../editor/view/SelectionHalo';
import { EditorContext } from '../../editor/view/contexts/EditorContext';
import { BlockSelection } from '../../editor/model/Selection';

export const Divider: React.FC<BlockComponentAttrs> = ({
    node,
    blockSelected,
}) => {
    const editor = useContext(EditorContext);

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
