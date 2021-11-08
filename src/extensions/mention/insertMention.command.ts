import { Editor } from '../../editor/model/Editor';
import { insertMark } from '../../editor/transaction/MarkedText/markText';
import { Selection } from '../../editor/model/types';

export const insertMention = (selection?: Selection) => (editor: Editor) => {
    selection = selection ?? editor.state.selection;
    const nodeId = Object.keys(selection.blockIds)[0];
    const nodeSelection = selection.blockIds[nodeId];
    const node = editor.state.nodes[nodeId];
    if (!node.text) return;

    const text = insertMark(node.text, {
        mark: { t: 'mention' },
        ...nodeSelection,
    });

    editor
        .createTransaction()
        .patch({
            nodeId: node.id,
            patch: {
                text,
            },
        })
        .focus({
            [nodeId]: {
                to: nodeSelection.from + 1,
            },
        })
        .dispatch();
};
