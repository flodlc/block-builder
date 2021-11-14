import {
    hasMark,
    markText,
    unmarkText,
} from '../../editor/transaction/MarkedText/markText';
import { cutMarkedText } from '../../editor/transaction/MarkedText/cutMarkedText';
import { MarkedText } from '../../editor/model/types';
import { TextSelection, Range } from '../../editor/model/Selection';
import { Editor } from '../../editor/model/Editor';

const getBoldStatus = (text: MarkedText, range: Range) => {
    const textFragment = cutMarkedText(text, range);
    return hasMark(textFragment, { t: 'b' });
};

export const toggleBold =
    (status?: boolean, selection?: TextSelection) => (editor: Editor) => {
        if (!selection) {
            if (editor.state?.selection?.isText()) {
                selection = editor.state.selection as TextSelection;
            } else {
                return;
            }
        }

        const node = editor.state.nodes[selection.nodeId];
        if (!node.text) return;

        const boldStatus = getBoldStatus(node.text, selection.range);

        const newMarkedText = boldStatus
            ? unmarkText(node.text, {
                  mark: { t: 'b' },
                  range: selection.range,
              })
            : markText(node.text, {
                  mark: { t: 'b' },
                  range: selection.range,
              });

        editor
            .createTransaction()
            .patch({
                nodeId: node.id,
                patch: {
                    text: newMarkedText,
                },
            })
            .focus(selection.clone())
            .dispatch();
    };
