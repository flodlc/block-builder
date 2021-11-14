import React, { KeyboardEvent, useContext } from 'react';
import { TextSelection, Range } from '../../editor/model/Selection';
import { MarkedText, Node } from '../../editor/model/types';
import { EditorContext } from '../../editor/view/contexts/EditorContext';
import { SCHEMA } from '../../Playground/schema';
import { cutMarkedText } from '../../editor/transaction/MarkedText/cutMarkedText';
import { previousEditable } from '../../editor/model/queries/previousEditable';
import { joinMarkedTexts } from '../../editor/transaction/MarkedText/joinMarkedTexts';
import { getMarkedTextLength } from '../../editor/transaction/MarkedText/getMarkedTextLength';
import { TextInput } from '../../editor/view/TextInput/TextInput';

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
        const oninput = (value: MarkedText, currentRange?: Range) => {
            editor
                .createTransaction()
                .patch({
                    nodeId: node.id,
                    patch: { text: value },
                })
                .focus(currentRange && selection?.setRange(currentRange))
                .dispatch();
        };

        const onKeyDown = (e: KeyboardEvent) => {
            selection = selection as TextSelection;
            switch (e.key) {
                case 'Enter':
                    const newNode: Node = SCHEMA['text'].create();
                    newNode.text = cutMarkedText(node.text, [
                        selection?.range[0],
                    ]);

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
                                text: cutMarkedText(node.text, [
                                    undefined,
                                    selection?.range?.[0],
                                ]),
                            },
                        })
                        .focus(new TextSelection(newNode.id, 'text', [0, 0]))
                        .dispatch();
                    return true;
                case 'Backspace':
                    if (selection?.range?.[0] === 0) {
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
                            .focus(
                                new TextSelection(target.id, 'text', [
                                    target.text
                                        ? getMarkedTextLength(target.text)
                                        : 0,
                                    target.text
                                        ? getMarkedTextLength(target.text)
                                        : 0,
                                ])
                            )
                            .dispatch();
                        return true;
                    }
                    break;
            }
            return undefined;
        };

        return (
            <div data-uid={node.id} style={{ padding: '3px' }}>
                <TextInput
                    onKeyDown={onKeyDown}
                    onChange={oninput}
                    style={{ padding: '4px 0', whiteSpace: 'break-spaces' }}
                    value={node.text}
                    range={
                        selection?.field === 'text'
                            ? selection?.range
                            : undefined
                    }
                    field={'text'}
                    nodeId={node.id}
                />
            </div>
        );
    }
);
