import { MarkedNode, MarkedText } from '../../model/types';
import { splitMarkedText } from './splitMarkedText';
import { minifyMarkedText } from './minifyMarkedText';
import { Range } from '../../model/Selection';

export const spliceText = (
    text: MarkedText,
    { textInput, range }: { textInput: string; range: Range }
) => {
    const splittedNodes = splitMarkedText(text);
    const updatedText: MarkedText = splittedNodes.slice();

    const previousCharNode = updatedText[range[0] - 1];
    // Todo: change the way we identify a previous dynamic node
    const previousMarks = previousCharNode?.m?.filter((mark) => {
        return mark.t !== 'mention';
    });
    const newSection: MarkedNode = {
        s: textInput,
        m: previousMarks,
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
