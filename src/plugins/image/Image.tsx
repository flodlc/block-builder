import React, { useContext, useEffect, useState } from 'react';

import { BlockComponentAttrs } from '../../editor/view/types';
import { SelectionHalo } from '../../editor/view/SelectionHalo';
import { TextInput } from '../../editor/view/TextInput/TextInput';
import { BlockSelection, TextSelection } from '../../editor/model/Selection';
import { EditorContext } from '../../editor/view/contexts/EditorContext';

export const Image = ({
    node,
    blockSelected,
    selection,
}: BlockComponentAttrs) => {
    const textSelection = selection as TextSelection;
    const [displayCaption, setDisplayCaption] = useState(false);
    const editor = useContext(EditorContext);

    useEffect(() => {
        if (!textSelection) setDisplayCaption(false);
    }, [textSelection, textSelection]);

    const select = () => {
        editor
            .createTransaction()
            .focus(new BlockSelection([node.id]))
            .dispatch(false);
    };

    return (
        <div
            data-uid={node.id}
            style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                margin: '20px 0',
            }}
        >
            {node.attrs?.src && (
                <>
                    <img
                        onClick={select}
                        src={node.attrs?.src}
                        style={{ width: '100%' }}
                    />
                    {!!(
                        displayCaption ||
                        node?.text?.length ||
                        textSelection
                    ) && (
                        <div
                            style={{
                                margin: '4px 0',
                                fontSize: '14px',
                                opacity: '0.6',
                            }}
                        >
                            <TextInput
                                nodeId={node.id}
                                placeholder={<>Write a caption...</>}
                                keepPlaceholder={true}
                                value={node.text}
                                range={textSelection?.range}
                            />
                        </div>
                    )}
                    {!node.text?.length && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'black',
                                borderRadius: '2px',
                                padding: '4px 8px',
                                cursor: 'pointer',
                                opacity: '0.75',
                            }}
                            onClick={() => {
                                setDisplayCaption(true);
                            }}
                        >
                            Add caption
                        </div>
                    )}
                </>
            )}
            {!node.attrs?.src && <>No image</>}
            <SelectionHalo blockSelected={blockSelected} />
        </div>
    );
};