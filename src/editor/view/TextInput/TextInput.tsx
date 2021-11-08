import React, { useContext, useLayoutEffect, useRef, useState } from 'react';
import { EditorContext } from '../contexts/EditorContext';
import { TextRenderer } from './TextRenderer';
import { MarkedText } from '../../model/types';
import { getElementSelection } from './utils/getElementSelection';
import { restoreSelection } from './utils/restoreSelection';
import { TextSelection } from '../types';
import { keyBinder } from './keyActions';
import { ViewContext } from '../contexts/ViewContext';

export const TextInput = ({
    onInput = () => undefined,
    onKeyDown = () => undefined,
    value = [],
    selection,
    style = {},
    id = undefined,
    nodeId,
}: {
    onInput: (value: MarkedText, selection?: TextSelection) => void;
    onKeyDown: (e: React.KeyboardEvent) => boolean | undefined;
    value?: MarkedText;
    selection?: TextSelection;
    style?: any;
    id?: string;
    nodeId: string;
}) => {
    const [composing, setComposing] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (ref.current) {
            if (selection) {
                restoreSelection(ref.current, selection);
            }
        }
    }, [selection]);

    const editor = useContext(EditorContext);
    const view = useContext(ViewContext);

    const handleCompositionEnd = (e: React.FormEvent) => {
        setComposing(false);
        if (selection) {
            const newTextState = keyBinder({
                value,
                e: e.nativeEvent,
                selection,
            });
            if (newTextState) {
                onInput(newTextState.value, newTextState.selection);
            }
        }
    };

    const handleCompositionStart = () => {
        setComposing(true);
    };

    const handleInput = (e: React.FormEvent) => {
        if (selection) {
            const newTextState = keyBinder({
                value,
                e: e.nativeEvent,
                selection,
            });
            if (newTextState) {
                onInput(newTextState.value, newTextState.selection);
            }
        }

        const text = ref.current?.textContent ?? '';
        if ((e.nativeEvent as InputEvent).inputType === 'insertText') {
            view.inputRules.some((inputRule) => {
                return inputRule.regex.some((regex) => {
                    const result = regex.exec(text);
                    if (result) {
                        inputRule.callback(editor, result);
                        return true;
                    }
                });
            });
        }
    };

    const handleMarkChange = (markedText: MarkedText) => {
        onInput(markedText, undefined);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!onKeyDown(e) && selection) {
            const newTextState = keyBinder({
                value,
                e: e.nativeEvent,
                selection,
            });
            if (newTextState) {
                onInput(newTextState.value, newTextState.selection);
            }
        } else {
            e.preventDefault();
        }
    };

    const saveDomSelection = () => {
        if (composing) return;
        editor
            .createTransaction()
            .focus({
                [nodeId]: getElementSelection(ref.current as HTMLDivElement),
            })
            .dispatch(false);
    };

    const onPaste = (e: React.ClipboardEvent) => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = e.clipboardData.getData('text/html');
        wrapper.querySelector('meta')?.remove();
        console.log(wrapper);
        e.preventDefault();
    };

    /** The key is used to force react to
     *  rerender and prevent duplicate characters
     *  (from keyboard and rendered by react */
    const key = JSON.stringify(value);
    return (
        <div
            onPaste={onPaste}
            onCompositionEnd={handleCompositionEnd}
            onCompositionStart={handleCompositionStart}
            key={key}
            suppressContentEditableWarning={true}
            onSelect={saveDomSelection}
            onKeyDownCapture={handleKeyDown}
            onKeyUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
            ref={ref}
            onInput={handleInput}
            contentEditable={true}
            style={{ ...style, outline: 'none' }}
            id={id}
        >
            <TextRenderer
                onChange={handleMarkChange}
                hashedKey={key}
                text={value}
            />
        </div>
    );
};
