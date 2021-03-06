import React from 'react';
import { Children, useEditor } from '../../indexed';
import { SelectionHalo } from '../../Playground/SelectionHalo';
import { BlockComponentAttrs } from '../../indexed';

const EMOJIS = [
    'π',
    'π',
    'π₯',
    'π΅β',
    'π«',
    'βοΈ',
    'πΊ',
    'π ',
    'π½',
    'π',
    'π',
    'π',
    'π»',
    'πΈ',
    'π΄',
    'π΄',
    'π€',
    'π­',
    'π',
    'β€οΈ',
    'π',
    'π',
    'βΊοΈ',
    'π',
    'π',
    'π©',
    'π',
    'π',
    'π',
    'π',
    'π',
    'π',
    'π',
    'π',
    'π',
    'π€£',
    'π₯²',
    'βΊοΈ',
    'π',
    'π',
    'π',
    'π€ͺ',
];

export const Callout: React.FC<BlockComponentAttrs> = ({
    node,
    blockSelected,
}) => {
    const editor = useEditor();
    const onClick = () => {
        const emoji = EMOJIS.sort(() => 0.5 - Math.random())[0];
        editor
            .createTransaction()
            .patch({
                nodeId: node.id,
                patch: { attrs: { ...node.attrs, emoji } },
            })
            .dispatch();
    };

    return (
        <div
            style={{
                position: 'relative',
                background: 'rgb(57 67 122)',
                borderRadius: '3px',
                padding: '13px 20px',
                margin: '4px 0',
                display: 'flex',
            }}
            data-uid={node.id}
            className="callout"
        >
            <div
                contentEditable={false}
                onClick={onClick}
                style={{
                    marginRight: '15px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    paddingTop: '5px',
                    alignSelf: 'flex-start',
                }}
            >
                {node.attrs?.emoji}
            </div>
            <div style={{ flex: 1, width: '100%' }}>
                <Children parentId={node.id} childrenIds={node.childrenIds} />
            </div>
            <SelectionHalo blockSelected={blockSelected} />
        </div>
    );
};
