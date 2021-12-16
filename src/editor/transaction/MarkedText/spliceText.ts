import { MarkedNode, MarkedText } from '../../model/types';
import { splitMarkedText } from './splitMarkedText';
import { minifyMarkedText } from './minifyMarkedText';
import { Range } from '../../model/Selection';
import { Editor } from '../../model/Editor';

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
    const previousMarks = previousCharNode?.m?.filter(
        (mark) => editor.schema[mark.t].allowText
    );
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
