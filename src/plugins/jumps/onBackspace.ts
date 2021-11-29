import { unwrap } from '../commands/unwrap';
import { Editor } from '../../editor/model/Editor';
import { TextSelection } from '../../editor/model/Selection';
import { previousEditable } from '../../editor/model/queries/previousEditable';
import { joinMarkedTexts } from '../../editor/transaction/MarkedText/joinMarkedTexts';
import { getMarkedTextLength } from '../../editor/transaction/MarkedText/getMarkedTextLength';

export const onBackspace = ({
    editor,
    e,
}: {
    editor: Editor;
    e: KeyboardEvent;
}) => {
    if (tryUnwrap({ e, editor })) {
        return;
    } else if (tryDelete({ e, editor })) {
        return;
    }
};

const tryUnwrap = ({ editor, e }: { editor: Editor; e: KeyboardEvent }) => {
    const selection = editor.state.selection as TextSelection;
    if (selection?.range?.[0] !== 0 || selection?.range?.[1] !== 0)
        return false;

    const parentId = editor.runQuery(
        (resolvedState) => resolvedState.nodes[selection.nodeId].parentId
    );

    if (!parentId) return false;
    const parent = editor.state.nodes[parentId];

    const currentIndex = parent.childrenIds?.indexOf(selection.nodeId) ?? -1;
    if (currentIndex < (parent.childrenIds?.length ?? 0) - 1) return false;

    const unwraped = editor.runCommand(unwrap({ nodeId: selection.nodeId }));
    if (unwraped === false) return false;

    e.preventDefault();
    e.stopPropagation();
    return true;
};

const tryDelete = ({ editor, e }: { editor: Editor; e: KeyboardEvent }) => {
    const selection = editor.state.selection as TextSelection;
    if (selection?.range?.[0] !== 0 || selection?.range?.[1] !== 0)
        return false;

    const node = editor.state.nodes[selection.nodeId];
    const target = editor.runQuery(previousEditable(node.id));
    if (!target) return false;

    const parentId = editor.runQuery(
        (resolvedState) => resolvedState.nodes[node.id].parentId
    );
    if (!parentId) return false;

    editor
        .createTransaction()
        .removeFrom({
            parentId,
            nodeId: node.id,
        })
        .patch({
            nodeId: target.id,
            patch: {
                text: joinMarkedTexts(target.text, node.text),
            },
        })
        .focus(
            new TextSelection(target.id, [
                target.text ? getMarkedTextLength(target.text) : 0,
                target.text ? getMarkedTextLength(target.text) : 0,
            ])
        )
        .dispatch();

    e.preventDefault();
    e.stopPropagation();
    return true;
};
