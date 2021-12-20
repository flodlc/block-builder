import { MarkedText } from '../../../model/types';
import { Range } from '../../../model/Selection';
import { spliceText } from '../../../transaction/MarkedText/spliceText';
import { diffText } from '../utils/diffText';
import { getTextNodes } from '../utils/getTextNodes';
import { Editor } from '../../../model/Editor';

export const handleTextChange = ({
    element,
    editor,
    currentValue,
    previousText,
}: {
    element: HTMLElement;
    editor: Editor;
    currentValue: MarkedText;
    previousText: string;
}) => {
    const inputDiff = getInputDiff(previousText, getStringText(element));
    if (!inputDiff) return undefined;
    const spp = spliceText({
        text: currentValue,
        editor,
        textInput: inputDiff.textInput,
        range: inputDiff.inputRange,
    });
    return {
        ...spp,
        range: undefined,
    };
};

export const getInputDiff = (prevText: string, newtText: string) => {
    const diff = diffText(prevText, newtText);
    if (!diff) return;
    return {
        inputRange: [diff.start, diff.end] as Range,
        textInput: diff.insertText ?? '',
    };
};

const getStringText = (el: HTMLElement | null): string => {
    if (!el) return '';
    return getTextNodes({ node: el, withIgnored: false }, true)
        .reduce(
            (c, p) => c + (p.nodeType === 3 ? p.textContent ?? '' : '•'),
            ''
        )
        .replace(/\uFEFF/g, '');
};