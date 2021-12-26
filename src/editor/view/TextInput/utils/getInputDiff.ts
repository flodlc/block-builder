import { Range } from '../../../model/Selection';
import { diffText } from './diffText';
import { getTextNodes } from './getTextNodes';

export const getInputDiff = (modelText: string, container: HTMLElement) => {
    const domText = getStringText(container);
    const diff = diffText(modelText, domText);
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
