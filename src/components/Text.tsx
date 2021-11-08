import React, { KeyboardEvent, useContext } from 'react';
import { EditorContext } from '../editor/view/contexts/EditorContext';
import { TextInput } from '../editor/view/TextInput/TextInput';
import { SCHEMA } from './schema';
import { MarkedText, Node } from '../editor/model/types';
import { TextSelection } from '../editor/view/types';
import { cutMarkedText } from '../editor/transaction/MarkedText/cutMarkedText';
import { joinMarkedTexts } from '../editor/transaction/MarkedText/joinMarkedTexts';
import { getMarkedTextLength } from '../editor/transaction/MarkedText/getMarkedTextLength';
import { previousEditable } from '../editor/model/queries/previousEditable';

export const Text = React.memo(
    ({
        node,
        parentId,
        selection,
    }: {
        node: Node;
        parentId: string;
        selection?: TextSelection;
    }) => {
        const editor = useContext(EditorContext);
        const oninput = (
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
                            parent: parentId,
                            after: node.id,
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
                        return true;
                    }
                    break;
            }
            return undefined;
        };

        return (
            <div data-uid={node.id}>
                <TextInput
                    onKeyDown={onKeyDown}
                    onInput={oninput}
                    style={{ padding: '4px 0', whiteSpace: 'break-spaces' }}
                    value={node.text}
                    selection={selection}
                    nodeId={node.id}
                />
            </div>
        );
    }
);
