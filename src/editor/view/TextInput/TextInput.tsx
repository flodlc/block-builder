import React, { useContext, useLayoutEffect, useRef, useState } from 'react';
import { EditorContext } from '../contexts/EditorContext';
import { TextRenderer } from './TextRenderer';
import { MarkedText } from '../../model/types';
import { getElementSelection } from './utils/getElementSelection';
import { restoreSelection } from './utils/restoreSelection';
import { keyBinder } from './keyActions';
import { Range, TextSelection } from '../../model/Selection';

export const TextInput = ({
    onChange = () => undefined,
    onKeyDown = () => undefined,
    value = [],
    range,
    field,
    style = {},
    id = undefined,
    nodeId,
}: {
    onChange: (value: MarkedText, range?: Range) => void;
    onKeyDown: (e: React.KeyboardEvent) => boolean | undefined;
    value?: MarkedText;
    range?: Range;
    field: string;
    style?: any;
    id?: string;
    nodeId: string;
}) => {
    const editor = useContext(EditorContext);
    const ref = useRef<HTMLDivElement>(null);
    const [composing, setComposing] = useState(false);

    useLayoutEffect(() => {
        if (!ref.current || !range) return;
        restoreSelection(ref.current, range);
    }, [range]);

    const onInput = (newValue: MarkedText, newRange?: Range) => {
        onChange(newValue, newRange);
    };

    const handleCompositionEnd = (e: React.FormEvent) => {
        setComposing(false);
        if (range) {
            const newTextState = keyBinder({
                value,
                e: e.nativeEvent,
                range,
            });
            if (newTextState) {
                onInput(newTextState.value, newTextState.range);
            }
        }
    };

    const handleCompositionStart = () => {
        setComposing(true);
    };

    const handleInput = (e: React.FormEvent) => {
        if (range) {
            const newTextState = keyBinder({
                value,
                e: e.nativeEvent,
                range,
            });

            if (newTextState) {
                onInput(newTextState.value, newTextState.range);
                editor.trigger('input');
            }
        }
    };

    const handleMarkChange = (markedText: MarkedText) => {
        onInput(markedText, undefined);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!editor.state.selection?.isText()) return;
        if (!onKeyDown(e) && range) {
            const newTextState = keyBinder({
                value,
                e: e.nativeEvent,
                range,
            });
            if (newTextState) {
                onInput(newTextState.value, newTextState.range);
            }
        } else {
            e.preventDefault();
        }
    };

    const saveDomSelection = () => {
        if (composing) return;
        const range = getElementSelection(ref.current as HTMLDivElement);
        if (!range) return;
        const newTextSelection = new TextSelection(nodeId, field, range);
        if (newTextSelection.isSame(editor.state.selection)) return;
        editor.createTransaction().focus(newTextSelection).dispatch(false);
    };

    const key = JSON.stringify(value);
    return (
        <div
            onCompositionEnd={handleCompositionEnd}
            onCompositionStart={handleCompositionStart}
            key={key}
            contentEditable={true}
            suppressContentEditableWarning={true}
            onSelect={saveDomSelection}
            onKeyDown={handleKeyDown}
            onKeyUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
            ref={ref}
            onInput={handleInput}
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
