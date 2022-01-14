import { MarkedNode, MarkedText } from '../../types';
import { splitMarkedText } from './splitMarkedText';
import { minifyMarkedText } from './minifyMarkedText';
import { Range } from '../../Selection';
import { Editor } from '../../Editor';

export const spliceText = ({
    text,
    textInput,
    range,
    editor,
}: {
    text: MarkedText;
    textInput: string;
    range: Range;
    editor: Editor;
}) => {
    const splitNodes = splitMarkedText(text);
    const updatedText: MarkedText = splitNodes.slice();

    const previousCharNode = updatedText[range[0] - 1];
    const previousMarks = previousCharNode?.marks?.filter(
        (mark) => editor.schema[mark.type].allowText
    );
    const newSection: MarkedNode = {
        text: textInput,
        marks: previousMarks,
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
