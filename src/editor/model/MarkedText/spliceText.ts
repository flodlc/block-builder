import { MarkedNode, MarkedText } from '../types';
import { splitMarkedText } from './splitMarkedText';
import { minifyMarkedText } from './minifyMarkedText';
import { Range } from '../Selection';

export const spliceText = ({
    text,
    textInput,
    range,
}: {
    text: MarkedText;
    textInput: string;
    range: Range;
}) => {
    const splitNodes = splitMarkedText(text);
    const updatedText: MarkedText = splitNodes.slice();

    const previousCharNode = updatedText[range[0] - 1];
    const newSection: MarkedNode = {
        text: textInput,
        marks: previousCharNode?.marks,
    };
    range = [Math.max(range[0], 0), range[1]];
    updatedText.splice(range[0], range[1] - range[0], newSection);
    return {
        value: minifyMarkedText(updatedText),
        range: [
            range[0] + textInput.length,
            range[1] + textInput.length - (range[1] - range[0]),
        ] as Range,
    };
};
