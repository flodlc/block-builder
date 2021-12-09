import React, { useContext } from 'react';
import { Children } from '../../editor/view/Children';
import { EditorContext } from '../../editor/view/contexts/EditorContext';
import { SelectionHalo } from '../../editor/view/SelectionHalo';
import { BlockComponentAttrs } from '../../editor/view/types';

const EMOJIS = [
    '👌',
    '😄',
    '🐥',
    '😵‍',
    '💫',
    '☘️',
    '😺',
    '🐠',
    '👽',
    '🔎',
    '🐝',
    '🙌',
    '😻',
    '😸',
    '😴',
    '😴',
    '💤',
    '😭',
    '😂',
    '❤️',
    '😍',
    '😒',
    '☺️',
    '😊',
    '😘',
    '😩',
    '💕',
    '😔',
    '😀',
    '😃',
    '😄',
    '😁',
    '😆',
    '😅',
    '😂',
    '🤣',
    '🥲',
    '☺️',
    '😙',
    '😜',
    '😝',
    '🤪',
];

export const Callout: React.FC<BlockComponentAttrs> = ({
    node,
    blockSelected,
}) => {
    const editor = useContext(EditorContext);
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
                // background: 'rgb(43 43 50)',
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
            <div style={{ flex: 1 }}>
                <Children parentId={node.id} childrenIds={node.childrenIds} />
            </div>
            <SelectionHalo blockSelected={blockSelected} />
        </div>
    );
};
