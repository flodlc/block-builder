import React, {
    ReactElement,
    useContext,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import { EditorContext } from '../contexts/EditorContext';
import { TextRenderer } from './TextRenderer';
import { MarkedText } from '../../model/types';
import { getElementSelection } from './utils/getElementSelection';
import { Range, TextSelection } from '../../model/Selection';
import { PlaceholderWrapper } from './Placeholder';
import { useNodeDecorations } from './hooks/useNodeDecorations';
import { useLastValue } from './hooks/useLastValue';
import { useTrailingElements } from './hooks/useTrailingElements';
import { useHandler } from './actions/useHander';
import {
    clearTrackedDomNodes,
    useTrackDomNodes,
} from './hooks/useTrackDomNodes';
import { useRestoreSelection } from './hooks/useRestoreSelection';
import { useRenderingKey } from './hooks/useRenderingKey';

export const TextInput = ({
    onChange = () => false,
    value = [],
    range,
    style = {},
    nodeId,
    placeholder,
    keepPlaceholder = false,
    contentEditable = true,
}: {
    onChange?: (value: MarkedText, range?: Range) => boolean;
    value?: MarkedText;
    range?: Range;
    style?: any;
    nodeId: string;
    placeholder?: ReactElement;
    keepPlaceholder?: boolean;
    contentEditable?: boolean;
}) => {
    const editor = useContext(EditorContext);
    const ref = useRef<HTMLDivElement>(null);
    const decorations = useNodeDecorations({ editor, nodeId });
    const currentSavedText = useLastValue(value);
    const [render, setRender] = useState(0);
    const [handlingState] = useState({ composing: false });

    const onInput = (newValue: MarkedText, newRange?: Range) => {
        if (onChange(newValue, newRange)) return;
        const selection = editor.state.selection as TextSelection;
        const tr = editor.createTransaction();
        tr.patch({
            nodeId,
            patch: { text: newValue },
        });
        newRange = newRange ?? getElementSelection(ref.current);
        if (newRange) {
            tr.focus(selection?.setRange(newRange as Range));
        }
        tr.dispatch();
    };

    const handler = useHandler();
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!range) return;
        const handledStatus = handler({
            e: e.nativeEvent,
            element: ref.current as HTMLElement,
            value,
            range,
            previousText: currentSavedText,
        });
        if (!handledStatus?.value) return;
        onInput(handledStatus.value, handledStatus.range);
    };

    const handleInput = async (e: InputEvent | Event) => {
        if (!range) return;
        const handledStatus = handler({
            e,
            element: ref.current as HTMLElement,
            value,
            range,
            previousText: currentSavedText,
        });
        if (!handledStatus?.value) {
            if (e.type === 'input') setRender(render + 1);
            return;
        }
        onInput(handledStatus.value, handledStatus.range);
    };

    useLayoutEffect(() => {
        ref.current?.addEventListener('beforeinput', handleInput);
        return () =>
            ref.current?.removeEventListener('beforeinput', handleInput);
    }, [ref.current, handleInput]);

    useLayoutEffect(() => {
        ref.current?.addEventListener('input', handleInput, {
            capture: true,
        });
        return () =>
            ref.current?.removeEventListener('input', handleInput, {
                capture: true,
            });
    }, [ref.current, handleInput]);

    const handleMarkChange = (markedText: MarkedText) =>
        onInput(markedText, undefined);

    const saveDomSelection = () => {
        const currentRange = getElementSelection(ref.current as HTMLElement);
        if (!currentRange) return;
        const newTextSelection = new TextSelection(nodeId, currentRange);
        if (newTextSelection.isSame(editor.state.selection)) return;
        editor.createTransaction().focus(newTextSelection).dispatch(false);
    };

    useLayoutEffect(() => {
        const selectHandler = () => saveDomSelection();
        document.addEventListener('selectionchange', selectHandler, {
            capture: true,
        });
        return () =>
            document.removeEventListener('selectionchange', selectHandler, {
                capture: true,
            });
    }, [saveDomSelection]);

    useTrailingElements(ref, value);
    const trackedDomNodes = useTrackDomNodes(ref);

    const { key, willUpdate } = useRenderingKey({
        ref,
        value,
        decorations,
        composing: handlingState.composing,
    });

    if (willUpdate) {
        clearTrackedDomNodes(trackedDomNodes.trackedNodes, ref.current);
    }

    useRestoreSelection({
        ref,
        range,
        composing: handlingState.composing,
    });

    return (
        <div style={{ position: 'relative', ...style, padding: undefined }}>
            <div
                ref={ref}
                className="editable_content"
                onKeyDown={handleKeyDown}
                onKeyDownCapture={(e: React.KeyboardEvent) => {
                    if (e.nativeEvent.isComposing) {
                        // bug in chrome when composing: keydown is fired twice on enter.
                        e.stopPropagation();
                    }
                }}
                contentEditable={contentEditable}
                suppressContentEditableWarning={true}
                onCompositionStart={() => (handlingState.composing = true)}
                onCompositionEnd={() => (handlingState.composing = false)}
                style={{
                    outline: 'none',
                    padding: style.padding,
                    WebkitUserSelect: 'text',
                    WebkitUserModify: 'read-write-plaintext-only',
                }}
            >
                <TextRenderer
                    key={key}
                    hashedKey={key}
                    stringText={currentSavedText}
                    onChange={handleMarkChange}
                    value={value}
                    decorations={decorations}
                />
            </div>
            {!currentSavedText && (range || keepPlaceholder) && (
                <PlaceholderWrapper
                    style={{ outline: 'none', padding: style.padding }}
                >
                    {placeholder}
                </PlaceholderWrapper>
            )}
        </div>
    );
};
