import { Editor } from '../../editor/model/Editor';
import { BlockSelection } from '../../editor/model/Selection';

export const onBackspace = ({ editor }: { editor: Editor }) => {
    const selection = editor.state.selection as BlockSelection;
    const transaction = editor.createTransaction();

    selection.nodeIds.forEach((nodeId) => {
        const parentId = editor.runQuery(
            (resolvedState) => resolvedState.nodes[nodeId].parentId
        );
        if (!parentId) return;
        transaction.removeFrom({ nodeId, parentId });
    });

    transaction.focus().dispatch();
};
