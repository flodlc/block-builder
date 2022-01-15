import React, { useLayoutEffect, useState } from 'react';
import { BlockComponentAttrs, useEditor } from '../../indexed';
import { Children } from '../../indexed';
import { SelectionHalo } from '../../Playground/SelectionHalo';
import { TextInput } from '../../indexed';
import { TextSelection } from '../../indexed';

export const ToggleList = ({
    node,
    blockSelected,
    selection,
}: BlockComponentAttrs) => {
    const textSelection = selection as TextSelection;
    const [expanded, setExpanded] = useState(false);
    const editor = useEditor();
    useLayoutEffect(() => {
        if (!expanded && node.childrenIds?.length) {
            setExpanded(true);
        }
    }, [node.childrenIds]);

    const insertFirstChild = () => {
        const newNode = editor.createNode('text');
        editor
            .createTransaction()
            .insertAfter({
                parentId: node.id,
                node: newNode,
            })
            .focus(new TextSelection(newNode.id, [0, 0]))
            .dispatch();
    };

    return (
        <div
            data-uid={node.id}
            style={{ position: 'relative', display: 'flex' }}
        >
            <div
                style={{ width: '22px' }}
                onClick={() => setExpanded(!expanded)}
            >
                <div style={{ padding: '4px', cursor: 'pointer' }}>
                    <svg
                        viewBox="0 0 100 100"
                        style={{
                            fill: 'white',
                            height: '10px',
                            transition: 'transform 300ms',
                            transform: `Rotate(${expanded ? 180 : 90}deg)`,
                        }}
                    >
                        <polygon points="5.9,88.2 50,11.8 94.1,88.2 " />
                    </svg>
                </div>
            </div>
            <div style={{ flex: 1 }}>
                <TextInput
                    style={{ padding: '4px 0' }}
                    nodeId={node.id}
                    range={textSelection?.range}
                    value={node.text}
                    placeholder={<>Toggle List</>}
                    keepPlaceholder={true}
                />
                {expanded && (
                    <div style={{ width: '100%' }}>
                        <Children
                            parentId={node.id}
                            childrenIds={node.childrenIds}
                        />
                    </div>
                )}
                {expanded && !node.childrenIds?.length && (
                    <div
                        onClick={insertFirstChild}
                        style={{
                            padding: '4px',
                            background: '#ffffff1c',
                            cursor: 'pointer',
                            borderRadius: '8px',
                        }}
                    >
                        Empty List
                    </div>
                )}
            </div>
            <SelectionHalo blockSelected={blockSelected} />
        </div>
    );
};
