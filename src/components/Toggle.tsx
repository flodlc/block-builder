import React, { KeyboardEvent, useContext, useState } from 'react';
import { MarkedText, Node } from '../editor/model/types';
import { EditorContext } from '../editor/view/contexts/EditorContext';
import { TextInput } from '../editor/view/TextInput/TextInput';
import { SCHEMA } from './schema';
import { Children } from '../editor/view/Children';
import { TextSelection } from '../editor/view/types';
import { joinMarkedTexts } from '../editor/transaction/MarkedText/joinMarkedTexts';
import { getMarkedTextLength } from '../editor/transaction/MarkedText/getMarkedTextLength';
import { cutMarkedText } from '../editor/transaction/MarkedText/cutMarkedText';
import { previousEditable } from '../editor/model/queries/previousEditable';

export const Toggle = React.memo(
    ({
        node,
        parentId,
        selection,
    }: {
        node: Node;
        parentId: string;
        selection?: TextSelection;
    }) => {
        const [visible, setVisible] = useState(true);

        const editor = useContext(EditorContext);
        const onTitleInput = (
            value: MarkedText,
            currentSelection?: TextSelection
        ) => {
            editor
                .createTransaction()
                .patch({
                    nodeId: node.id,
                    patch: { text: value },
                })
                .focus({ [node.id]: currentSelection })
                .dispatch();
        };

        const onKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Enter':
                    const newNode: Node = SCHEMA['text'].create();
                    newNode.text = cutMarkedText(node.text, {
                        from: selection?.to,
                    });

                    editor
                        .createTransaction()
                        .insertAfter({
                            node: newNode,
                            parent: visible ? node.id : parentId,
                            after: visible ? undefined : node.id,
                        })
                        .patch({
                            nodeId: node.id,
                            patch: {
                                text: cutMarkedText(node.text, {
                                    to: selection?.to,
                                }),
                            },
                        })
                        .focus({ [newNode.id]: { to: 0 } })
                        .dispatch();
                    return true;
                case 'Backspace':
                    if (selection?.to === 0) {
                        const target = editor.runQuery(
                            previousEditable(node.id)
                        );
                        if (!target) return true;

                        editor
                            .createTransaction()
                            .removeFrom({
                                parentId,
                                nodeId: node.id,
                            })
                            .patch({
                                nodeId: target.id,
                                patch: {
                                    text: joinMarkedTexts(
                                        target.text,
                                        node.text
                                    ),
                                },
                            })
                            .focus({
                                [target.id]: {
                                    to: getMarkedTextLength(target.text),
                                },
                            })
                            .dispatch();
                    }
                    return true;
            }
            return undefined;
        };

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
                    onClick={() => setVisible(!visible)}
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
                            whiteSpace: 'break-spaces',
                            flex: 1,
                        }}
                        onKeyDown={onKeyDown}
                        onInput={onTitleInput}
                        value={node.text}
                        selection={selection}
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
