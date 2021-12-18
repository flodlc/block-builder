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
import {
    restoreReactScreenshot,
    useReactScreenshot,
} from './hooks/useReactScreenshot';

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
    const composingRef = useRef<boolean>(false);
    const decorations = useNodeDecorations({ nodeId });
    const currentSavedText = useLastValue(value);
    const [render, setRender] = useState(0);

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
    const handleNativeKeyDown = (e: KeyboardEvent) => {
        if (!range) return;
        const handledStatus = handler({
            e,
            editor,
            element: ref.current as HTMLElement,
            value,
            range,
            previousText: currentSavedText,
        });
        if (!handledStatus?.value) return;
        onInput(handledStatus.value, handledStatus.range);
    };

    const handleKeyDown = (e: React.KeyboardEvent) =>
        handleNativeKeyDown(e.nativeEvent);

    const handleInput = async (e: InputEvent | Event) => {
        if (!range) return;
        const handledStatus = handler({
            e,
            editor,
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
        ref.current?.addEventListener('input', handleInput);
        return () => ref.current?.removeEventListener('input', handleInput);
    }, [ref.current, handleInput]);

    const handleMarkChange = (markedText: MarkedText) =>
        onInput(markedText, undefined);

    useTrailingElements(ref);

    const trackedDomNodes = useTrackDomNodes(ref);

    const { key, willUpdate } = useRenderingKey({
        ref,
        value,
        decorations,
        composing: composingRef.current,
        domChanged: !!trackedDomNodes.current?.size,
    });

    const reactScreenShot = useReactScreenshot(ref, willUpdate);

    if (willUpdate) {
        clearTrackedDomNodes(trackedDomNodes.current);
        restoreReactScreenshot(
            ref.current as HTMLElement,
            reactScreenShot.current as Node[]
        );
    }

    useRestoreSelection({
        ref,
        range,
        key,
        composing: composingRef.current,
        updateRange: (newRange: Range) => {
            const newTextSelection = new TextSelection(nodeId, newRange);
            if (newTextSelection.isSame(editor.state.selection)) return;
            editor.createTransaction().focus(newTextSelection).dispatch(false);
        },
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
                onCompositionStart={() => (composingRef.current = true)}
                onCompositionEnd={() => {
                    composingRef.current = false;
                    setRender(render + 1);
                }}
                style={{
                    outline: 'none',
                    padding: style.padding,
                }}
            >
                <TextRenderer
                    // key={key}
                    hashedKey={key}
                    stringText={currentSavedText}
                    onChange={handleMarkChange}
                    value={value}
                    decorations={decorations}
                    schema={editor.schema}
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
