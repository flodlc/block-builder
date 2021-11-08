import { MarkedNode, MarkedText } from '../../model/types';
import { splitMarkedText } from './splitMarkedText';
import { minifyMarkedText } from './minifyMarkedText';

export const insertText = (
    text: MarkedText,
    { textInput, from, to }: { textInput: string; from: number; to: number }
) => {
    const splittedNodes = splitMarkedText(text);
    const updatedText: MarkedText = splittedNodes.slice();

    const previousCharNode = updatedText[from - 1];
    // Todo: change the way we identify a previous dynamic node
    const isPreviousCharText = previousCharNode && previousCharNode.s !== 'm';
    const newSection: MarkedNode = isPreviousCharText
        ? {
              ...updatedText[from - 1],
              s: textInput,
          }
        : {
              s: textInput,
              m: [],
          };
    from = Math.max(from, 0);
    updatedText.splice(from, to - from, newSection);
    return {
        value: minifyMarkedText(updatedText),
        selection: {
            to: to + textInput.length - (to - from),
            from: from + textInput.length,
        },
    };
};
