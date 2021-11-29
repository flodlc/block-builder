import { Editor } from '../../editor/model/Editor';
import { cutMarkedText } from '../../editor/transaction/MarkedText/cutMarkedText';
import { TextSelection } from '../../editor/model/Selection';
import { splitMarkedText } from '../../editor/transaction/MarkedText/splitMarkedText';
import { minifyMarkedText } from '../../editor/transaction/MarkedText/minifyMarkedText';
import { getMarkedTextLength } from '../../editor/transaction/MarkedText/getMarkedTextLength';
import { MarkedNode } from '../../editor/model/types';

export const onEnter = ({
    e,
    editor,
}: {
    e: KeyboardEvent;
    editor: Editor;
}) => {
    if (softBreak({ e, editor })) return;
    const selection = editor.state.selection as TextSelection;
    const node = editor.state.nodes[selection.nodeId];
    const newNode = editor.schema.text.create();
    newNode.text = cutMarkedText(node.text, [selection?.range[1]]);

    const tr = editor.createTransaction();

    if (!node.childrenIds?.length) {
        const parentId = editor.runQuery(
            (resolvedState) => resolvedState.nodes[node.id].parentId
        );
        if (!parentId) return;

        tr.insertAfter({
            node: newNode,
            parent: parentId,
            after: node.id,
        });
    } else {
        tr.insertAfter({
            node: newNode,
            parent: node.id,
        });
    }

    tr.patch({
        nodeId: node.id,
        patch: {
            text: cutMarkedText(node.text, [undefined, selection?.range?.[0]]),
        },
    })
        .focus(new TextSelection(newNode.id, [0, 0]))
        .dispatch();

    e.preventDefault();
    e.stopPropagation();
};

const softBreak = ({ e, editor }: { e: KeyboardEvent; editor: Editor }) => {
    if (e.shiftKey) {
        const selection = editor.state.selection as TextSelection;
        const { range } = selection;
        const node = editor.state.nodes[selection.nodeId];
        const text = node.text;
        const textLength = getMarkedTextLength(text ?? []);
        const isCaretAtTheEnd = textLength === range[1];
        
        const softBreak: MarkedNode = {
            s: '\n ',
        };
        
        /** Avoid css glitch that doesn't goes inline before there is a letter */
        if (isCaretAtTheEnd) softBreak.s = `${softBreak.s} `;
        
        const splittedText = splitMarkedText(text ?? []);
        const removeIndex = range[1] - range[0];
        splittedText.splice(range[0] ?? 0, removeIndex, softBreak);

        const newText = minifyMarkedText(splittedText);
        const newTextLength = range[0] + 1;

        editor
            .createTransaction()
            .patch({
                patch: {
                    text: newText,
                },
                nodeId: selection.nodeId,
            })
            .focus(selection.setRange([newTextLength, newTextLength]))
            .dispatch();
        e.preventDefault();
        e.stopPropagation();

        return true;
    }
    return false;
};
