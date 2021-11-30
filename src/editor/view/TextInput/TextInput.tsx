import React, {
    ReactElement,
    useContext,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import { EditorContext } from '../contexts/EditorContext';
import { TextRenderer } from './TextRenderer';
import { MarkedText } from '../../model/types';
import { getElementSelection } from './utils/getElementSelection';
import { restoreSelection } from './utils/restoreSelection';
import { keyBinder } from './keyActions';
import { Range, TextSelection } from '../../model/Selection';
import { ViewContext } from '../contexts/ViewContext';
import { Editor } from '../../model/Editor';
import { Decoration } from '../types';
import { PlaceholderWrapper } from './Placeholder';

const useDecorations = ({
    editor,
    nodeId,
}: {
    editor: Editor;
    nodeId: string;
}) => {
    const view = useContext(ViewContext);
    const [decorations, setDecorations] = useState<Decoration[]>();

    useEffect(() => {
        const handler = () => setDecorations(view.decorations[nodeId]);
        editor.on('decorationsChanged', handler);
        return () => editor.off('decorationsChanged', handler);
    }, []);
    return decorations;
};

export const TextInput = ({
    onChange = () => false,
    onKeyDown = () => undefined,
    value = [],
    range,
    style = {},
    nodeId,
    placeholder,
    keepPlaceholder = false,
    contentEditable = true,
}: {
    onChange?: (value: MarkedText, range?: Range) => boolean;
    onKeyDown?: (e: React.KeyboardEvent) => boolean | undefined;
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
    const [composing] = useState({ state: false });
    const decorations = useDecorations({ editor, nodeId });

    useLayoutEffect(() => {
        if (!ref.current) return;
        restoreSelection(ref.current, range);
    }, [range, decorations]);

    const onInput = (newValue: MarkedText, newRange?: Range) => {
        if (onChange(newValue, newRange)) return;
        const selection = editor.state.selection as TextSelection;
        editor
            .createTransaction()
            .patch({
                nodeId,
                patch: { text: newValue },
            })
            .focus(newRange && selection?.setRange(newRange))
            .dispatch();
    };

    const handleCompositionEnd = (e: React.FormEvent) => {
        composing.state = false;
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
        composing.state = true;
    };

    const handleBeforeInput = () => {
        range = getElementSelection(ref.current);
    };

    const handleInput = (e: React.FormEvent) => {
        e.stopPropagation();
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

    const handleMarkChange = (markedText: MarkedText) => {
        onInput(markedText, undefined);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!editor.state.selection?.isText()) {
            e.preventDefault();
            return;
        }
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
        const range = getElementSelection(ref.current as HTMLDivElement);
        if (!range || composing.state) return;
        const newTextSelection = new TextSelection(nodeId, range);
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
    }, []);

    const stringText = value && value.reduce((prev, curr) => prev + curr.s, '');

    const key = JSON.stringify([value, decorations]);
    return (
        <div style={{ position: 'relative', ...style, padding: undefined }}>
            <div
                key={key}
                contentEditable={contentEditable}
                suppressContentEditableWarning={true}
                onKeyDown={handleKeyDown}
                onInputCapture={handleInput}
                onBeforeInput={handleBeforeInput}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
                ref={ref}
                style={{ outline: 'none', padding: style.padding }}
            >
                <TextRenderer
                    stringText={stringText}
                    onChange={handleMarkChange}
                    hashedKey={key}
                    text={value}
                    decorations={decorations}
                />
            </div>
            {!stringText && (range || keepPlaceholder) && (
                <PlaceholderWrapper>{placeholder}</PlaceholderWrapper>
            )}
        </div>
    );
};
