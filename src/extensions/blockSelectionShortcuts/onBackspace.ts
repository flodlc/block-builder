import { Editor } from '../../editor/model/Editor';
import { BBlockSelection } from '../../editor/model/Selection';

export const onBackspace = ({ editor }: { editor: Editor }) => {
    const selection = editor.state.selection as BBlockSelection;
    const transaction = editor.createTransaction();

    Object.keys(selection.nodeIds).forEach((nodeId) => {
        const parentId = editor.runQuery(
            (resolvedState) => resolvedState.nodes[nodeId].parentId
        );
        if (!parentId) return;
        transaction.removeFrom({ nodeId, parentId });
    });

    transaction.focus().dispatch();
};
