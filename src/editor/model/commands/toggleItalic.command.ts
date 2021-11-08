import { Editor } from '../Editor';
import {
    hasMark,
    markText,
    unmarkText,
} from '../../transaction/MarkedText/markText';
import { cutMarkedText } from '../../transaction/MarkedText/cutMarkedText';
import { MarkedText, Selection } from '../types';
import { TextSelection } from '../../view/types';

const getItalicStatus = (text: MarkedText, textSelection: TextSelection) => {
    const textFragment = cutMarkedText(text, textSelection);
    return hasMark(textFragment, { t: 'i' });
};

export const toggleItalic =
    (status?: boolean, selection?: Selection) => (editor: Editor) => {
        selection = selection ?? editor.state.selection;
        const nodeId = Object.keys(selection.blockIds)[0];
        const textSelection = selection.blockIds[nodeId];
        const node = editor.state.nodes[nodeId];
        if (!node.text) return;
        const boldStatus = getItalicStatus(node.text, textSelection);

        const newMarkedText = boldStatus
            ? unmarkText(node.text, {
                  mark: { t: 'i' },
                  ...textSelection,
              })
            : markText(node.text, {
                  mark: { t: 'i' },
                  ...textSelection,
              });

        editor
            .createTransaction()
            .patch({
                nodeId: node.id,
                patch: {
                    text: newMarkedText,
                },
            })
            .focus(editor.state.selection.blockIds)
            .dispatch();
    };
