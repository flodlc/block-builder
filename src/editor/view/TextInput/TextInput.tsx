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
import { Range, TextSelection } from '../../model/Selection';
import { ViewContext } from '../contexts/ViewContext';
import { Editor } from '../../model/Editor';
import { Decoration } from '../types';
import { PlaceholderWrapper } from './Placeholder';
import { getTextNodes } from './utils/getTextNodes';
import { spliceText } from '../../transaction/MarkedText/spliceText';
import { keyBinder } from './keyActions';

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

const getStringText = (el: HTMLElement): string => {
    return getTextNodes({ node: el }, true).reduce(
        (c, p) => c + (p.nodeType === 3 ? p.textContent ?? '' : '•'),
        ''
    );
};

const getInputDiff = (
    prevText: string,
    newtText: string,
    prevRange: Range,
    newRange: Range
): { textInput: string; inputRange: Range } => {
    const delta = newtText.length - prevText.length;
    if (delta < 0 && TextSelection.areSameRange(prevRange, newRange)) {
        return {
            inputRange: [prevRange[0], prevRange[1] - delta],
            textInput: '',
        };
    }

    const splittedA = prevText.slice(0, prevRange[0]).split('');
    const splittedB = newtText.slice(0, newRange[0]).split('');

    const splittedABeforeCursor = splittedA.slice(0, prevRange[0]);
    let firstDifPos: number | undefined;
    splittedB.forEach((charB, i) => {
        const charA = splittedABeforeCursor[i];
        if (charA !== charB) {
            firstDifPos = firstDifPos ?? i;
        }
    });

    return {
        inputRange: [firstDifPos ?? newRange[0], prevRange[1]],
        textInput: newtText.slice(firstDifPos ?? newRange[0], newRange[1]),
    };
};

const handleTextChange = ({
    element,
    currentValue,
    range,
    previousText,
}: {
    element: HTMLElement;
    currentValue: MarkedText;
    range: Range;
    previousText: string;
}) => {
    const inputDiff = getInputDiff(
        previousText,
        getStringText(element),
        range,
        getElementSelection(element) as Range
    );
    if (!inputDiff) return undefined;
    return spliceText(currentValue, {
        textInput: inputDiff.textInput,
        range: inputDiff.inputRange,
    });
};

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
    const [text] = useState({ text: '' });
    const decorations = useDecorations({ editor, nodeId });

    const [handlingState] = useState({
        key: Math.random() + '',
        render: true,
        forceRender: false,
    });

    useEffect(() => {
        text.text = ref.current ? getStringText(ref.current) : '';
    }, [value]);

    useEffect(() => {
        handlingState.render = true;
        handlingState.forceRender = true;
    }, [decorations]);

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

    const handleCompositionStart = () => {
        handlingState.render = false;
    };

    const handleInput = (e: React.FormEvent) => {
        if (!range) return;
        const nativeEvent = e.nativeEvent as InputEvent;
        if (nativeEvent.data) handlingState.render = false;
        if (/composition/i.test(nativeEvent.inputType)) return;

        let newTextState: { value: MarkedText; range: Range } | undefined;

        if (
            ['insertLineBreak', 'insertParagraph'].includes(
                nativeEvent.inputType
            )
        ) {
            newTextState = spliceText(value, {
                textInput: '\n',
                range,
            });
        }

        if (!newTextState) {
            newTextState = handleTextChange({
                element: ref.current as HTMLElement,
                currentValue: value,
                range,
                previousText: text.text,
            });
        }
        if (!newTextState) return;
        onInput(newTextState.value, newTextState.range);
    };

    const handleCompositionEnd = () => {
        handlingState.render = false;
        const newTextState = handleTextChange({
            element: ref.current as HTMLElement,
            currentValue: value,
            range: range as Range,
            previousText: text.text,
        });
        if (!newTextState) return;
        onInput(newTextState.value, newTextState.range);
    };

    const handleMarkChange = (markedText: MarkedText) => {
        onInput(markedText, undefined);
    };

    const saveDomSelection = () => {
        const range = getElementSelection(ref.current as HTMLDivElement);
        if (!range || !handlingState.render) return;
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

    if (handlingState.render || handlingState.forceRender) {
        handlingState.key = Math.random() + '';
    }
    handlingState.render = true;
    handlingState.forceRender = false;

    const stringText = value && value.reduce((prev, curr) => prev + curr.s, '');
    return (
        <div style={{ position: 'relative', ...style, padding: undefined }}>
            <div
                key={handlingState.key}
                contentEditable={contentEditable}
                suppressContentEditableWarning={true}
                onInput={handleInput}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
                ref={ref}
                style={{ outline: 'none', padding: style.padding }}
            >
                <TextRenderer
                    hashedKey={handlingState.key}
                    stringText={stringText}
                    onChange={handleMarkChange}
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
