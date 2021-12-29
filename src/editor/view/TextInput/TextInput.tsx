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
import { useTextFromValue } from './hooks/useTextFromValue';
import { useTrailingElements } from './hooks/useTrailingElements';
import { useTrackDomChanges } from './hooks/useTrackDomNodes';
import { useRestoreSelection } from './hooks/useRestoreSelection';
import { useRenderingKey } from './hooks/useRenderingKey';
import { ViewContext } from '../contexts/ViewContext';
import { useBackspaceHandler } from './hooks/useBackspaceHandler';
import { useInputHander } from './hooks/useInputHander';
import { useEventHandlers } from './hooks/useEventHandlers';
import { useDeleteHandler } from './hooks/useDeleteHandler';
import { useSoftBreakHandler } from './hooks/useSoftBreakHandler';

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
    const view = useContext(ViewContext);
    const ref = useRef<HTMLDivElement>(null);
    const firstLoadTime = useRef(Date.now());
    const composingRef = useRef<boolean>(false);
    const decorations = useNodeDecorations({ nodeId, editor });
    const currentSavedText = useTextFromValue(value);
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

    const handleMarkChange = (markedText: MarkedText) =>
        onInput(markedText, undefined);

    const changesTracker = useTrackDomChanges(ref, (domChanges) => {
        const cancel =
            Date.now() - firstLoadTime.current < 50 ||
            // we wait 50ms before allowing dom mutations to prevent weird behaviors on android enter
            domChanges.some((domchange) => domchange.type === 'added_element');
        if (cancel) {
            setRender(Math.random());
            return false;
        }
        return true;
    });

    useLayoutEffect(() => {
        if (nodeId === 'bd80a80b-177c-4df4-a34d-55ed10d3cc5d') {
            // @ts-ignore
            window.aa = changesTracker;
        }
    }, []);

    useEventHandlers({ view, nodeId, ref });

    useSoftBreakHandler({
        ref,
        value,
        view,
        range,
        onInput,
        nodeId,
    });

    useBackspaceHandler({
        ref,
        value,
        view,
        range,
        onInput,
        nodeId,
    });

    useDeleteHandler({
        ref,
        value,
        view,
        range,
        onInput,
        nodeId,
    });

    useInputHander({
        ref,
        value,
        currentSavedText,
        view,
        onInput,
        nodeId,
    });

    useTrailingElements(ref);
    useLayoutEffect(() => {
        changesTracker.current.listen();
    });

    const { key } = useRenderingKey({
        ref,
        value,
        decorations,
        composing: composingRef.current,
        currentSavedText,
        domChanged: !!changesTracker.current.domChanges.length,
    });

    useRestoreSelection({
        editor,
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
                contentEditable={contentEditable}
                suppressContentEditableWarning={true}
                onCompositionStart={() => (composingRef.current = true)}
                onCompositionEnd={() => {
                    composingRef.current = false;
                    setTimeout(() => setRender(render + 1));
                }}
                style={{ outline: 'none', padding: style.padding }}
            >
                <TextRenderer
                    willRender={() => {
                        changesTracker.current.pause();
                        changesTracker.current.restoreChildren();
                        changesTracker.current.restoreDom();
                    }}
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
