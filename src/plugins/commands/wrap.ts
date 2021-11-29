import { Node } from '../../editor/model/types';
import { Editor } from '../../editor/model/Editor';

export const wrap =
    ({ wrappingNode, nodeId }: { wrappingNode: Node; nodeId: string }) =>
    (editor: Editor) => {
        const parentId = editor.runQuery(
            (resolvedState) => resolvedState.nodes[nodeId].parentId
        ) as string;
        if (!parentId) return false;

        const node = editor.state.nodes[nodeId];
        editor
            .createTransaction()
            .insertAfter({
                after: nodeId,
                node: wrappingNode,
                parent: parentId as string,
            })
            .removeFrom({
                nodeId,
                parentId,
            })
            .insertAfter({
                parent: wrappingNode.id,
                node,
            })
            .dispatch();
    };
