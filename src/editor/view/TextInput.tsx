import React, { useContext, useLayoutEffect, useRef } from 'react';
import REACT_MARKS from '../../params/REACT_MARKS';
import { TextType } from '../model/types';
import { EditorContext } from './EditorContext';

export const TextInput = ({
    onInput = () => undefined,
    onKeyDown = () => undefined,
    value = '',
    focusOffset,
    style = {},
    id = '',
    nodeId,
}: {
    onInput: (value: string, focusOffset?: number) => void;
    onKeyDown: (e: React.KeyboardEvent) => undefined;
    value?: TextType;
    focusOffset?: number;
    style?: any;
    id?: string;
    nodeId: string;
}) => {
    const ref = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (ref.current) {
            if (focusOffset !== undefined) {
                restoreSelection(ref.current, focusOffset);
            }
        }
    }, [focusOffset]);

    const editor = useContext(EditorContext);

    const handleInput = (e: React.FormEvent) => {
        const newValue = (e.target as HTMLElement).innerText;
        onInput(newValue, getFocusOffset(ref.current));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        onKeyDown(e);
    };
    
    // DOESN'T WORK WITH MARKS YET
    const saveDomSelection = () => {
        if (ref.current) {
            const focusOffset = getFocusOffset(ref.current);
            editor
                .createTransaction()
                .focus({ [nodeId]: { focusOffset } })
                .dispatch(false);
        }
    };

    const finalValue = React.useMemo(() => {
        if (typeof value === 'string') {
            return <>{value}</>;
        }
        return (
            <>
                {value.map((val, i) => {
                    if (val.text)
                        return (
                            <span
                                key={i}
                                dangerouslySetInnerHTML={{ __html: val.text }}
                            />
                        );
                    if (val.component) {
                        const Comp = REACT_MARKS[val.component];
                        if (Comp) return <Comp key={i} />;
                    }
                    return <React.Fragment key={i} />;
                }, '')}
            </>
        );
    }, []);

    return (
        <div
            // onSelect={saveDomSelection} // DOESN'T WORK WITH MARKS
            onKeyDownCapture={handleKeyDown}
            onKeyUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
            ref={ref}
            onInput={handleInput}
            contentEditable={true}
            style={{ ...style, outline: 'none' }}
            id={id || undefined}
        >
            {finalValue}
        </div>
    );
};

const restoreSelection = (div: HTMLDivElement, focusOffset: number) => {
    if (focusOffset === 0) {
        div.focus();
        return;
    }
    const docSelection = window.getSelection();
    if (div.childNodes[0] && docSelection) {
        const range = document.createRange();
        range.setStart(div.childNodes[0], focusOffset);
        range.setEnd(div.childNodes[0], focusOffset);
        docSelection.removeAllRanges();
        docSelection.addRange(range);
    }
};

const getFocusOffset = (textElement: HTMLElement | null) => {
    const selection = document.getSelection();
    const focusNode = selection?.focusNode;
    if (
        !textElement ||
        !focusNode ||
        !textElement.parentElement?.contains(focusNode)
    ) {
        return;
    }
    return selection.focusOffset;
};
