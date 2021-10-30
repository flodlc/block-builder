import React, { KeyboardEvent, useContext, useState } from 'react';
import { CustomSelection, Node } from '../editor/model/types';
import { EditorContext } from '../editor/view/EditorContext';
import { TextInput } from '../editor/view/TextInput';
import { SCHEMA } from './schema';
import { Children } from '../editor/view/Children';
import { findDeepTarget } from './utils/findDeepTarget';

export const Toggle = React.memo(
    ({
        node,
        parentId,
        selection,
    }: {
        node: Node;
        parentId: string;
        selection?: CustomSelection;
    }) => {
        const [visible, setVisible] = useState(true);

        const editor = useContext(EditorContext);
        const onTitleInput = (value: string, focusOffset?: number) => {
            editor
                .createTransaction()
                .patch({
                    nodeId: node.id,
                    patch: { text: value },
                })
                .focus({ [node.id]: { focusOffset } })
                .dispatch();
            return undefined;
        };

        const onKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Enter':
                    e.preventDefault();
                    const startText = node.text?.slice(
                        0,
                        selection?.focusOffset
                    );
                    const endText = node.text?.slice(selection?.focusOffset);

                    const newNode: Node = SCHEMA['text'].create();
                    newNode.text = endText;

                    const target = findDeepTarget(node.id, 1);
                    if (!target) return;

                    editor
                        .createTransaction()
                        .insertAfter({
                            node: newNode,
                            parent: visible ? node.id : parentId,
                            after: visible ? undefined : node.id,
                        })
                        .patch({
                            nodeId: node.id,
                            patch: { text: startText },
                        })
                        .focus({ [newNode.id]: { focusOffset: 0 } })
                        .dispatch();
                    break;
                case 'Backspace':
                    if (selection?.focusOffset === 0) {
                        e.preventDefault();
                        e.stopPropagation();

                        const target = findDeepTarget(node.id, -1);
                        if (!target) return;

                        editor
                            .createTransaction()
                            .removeFrom({
                                parentId,
                                nodeId: node.id,
                            })
                            .focus({
                                [target.id]: {
                                    focusOffset:
                                        target.element.innerText?.length,
                                },
                            })
                            .dispatch();
                    }
                    break;
            }
            return undefined;
        };

        const toggle = () => setVisible(!visible);

        return (
            <div
                data-uid={node.id}
                style={{
                    margin: '20px 0',
                    display: 'flex',
                    alignItems: 'flex-start',
                }}
            >
                <div
                    style={{
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'transform 300ms',
                        transform: visible ? 'rotate(90deg)' : '',
                    }}
                    onClick={toggle}
                >
                    {'>'}
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        marginLeft: '10px',
                    }}
                >
                    <TextInput
                        style={{
                            fontSize: '16px',
                            flex: 1,
                        }}
                        onKeyDown={onKeyDown}
                        onInput={onTitleInput}
                        value={node.text}
                        focusOffset={selection?.focusOffset}
                        nodeId={node.id}
                    />
                    {visible && (
                        <div style={{ marginTop: '10px' }}>
                            <Children
                                parentId={node.id}
                                childrenIds={node.childrenIds}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    }
);
