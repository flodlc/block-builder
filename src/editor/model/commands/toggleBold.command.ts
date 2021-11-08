import { Editor } from '../Editor';
import {
    hasMark,
    markText,
    unmarkText,
} from '../../transaction/MarkedText/markText';
import { cutMarkedText } from '../../transaction/MarkedText/cutMarkedText';
import { MarkedText, Selection } from '../types';
import { TextSelection } from '../../view/types';

const getBoldStatus = (text: MarkedText, textSelection: TextSelection) => {
    const textFragment = cutMarkedText(text, textSelection);
    return hasMark(textFragment, { t: 'b' });
};

export const toggleBold =
    (status?: boolean, selection?: Selection) => (editor: Editor) => {
        selection = selection ?? editor.state.selection;
        const nodeId = Object.keys(selection.blockIds)[0];
        const textSelection = selection.blockIds[nodeId];
        const node = editor.state.nodes[nodeId];
        if (!node.text) return;
        const boldStatus = getBoldStatus(node.text, textSelection);

        const newMarkedText = boldStatus
            ? unmarkText(node.text, {
                  mark: { t: 'b' },
                  ...textSelection,
              })
            : markText(node.text, {
                  mark: { t: 'b' },
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
