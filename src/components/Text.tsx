import React, { KeyboardEvent, useContext } from 'react';
import { EditorContext } from '../editor/view/EditorContext';
import { TextInput } from '../editor/view/TextInput';
import { SCHEMA } from './schema';
import { CustomSelection, Node } from '../editor/model/types';
import { findDeepTarget } from './utils/findDeepTarget';

export const Text = React.memo(
    ({
        node,
        parentId,
        selection,
    }: {
        node: Node;
        parentId: string;
        selection?: CustomSelection;
    }) => {
        const editor = useContext(EditorContext);
        const oninput = (value: string, focusOffset?: number) => {
            editor
                .createTransaction()
                .patch({
                    nodeId: node.id,
                    patch: { text: value },
                })
                .focus({ [node.id]: { focusOffset } })
                .dispatch();
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
                    newNode.text = endText || '';

                    editor
                        .createTransaction()
                        .insertAfter({
                            node: newNode,
                            parent: parentId,
                            after: node.id,
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
                            .patch({
                                nodeId: target.id,
                                patch: {
                                    text: target.element.innerText + node.text,
                                },
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

        return (
            <div data-uid={node.id}>
                <TextInput
                    onKeyDown={onKeyDown}
                    onInput={oninput}
                    style={{ padding: '5px 0' }}
                    value={node.text}
                    focusOffset={selection?.focusOffset}
                    nodeId={node.id}
                />
            </div>
        );
    }
);
