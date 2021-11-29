import { Editor } from '../../editor/model/Editor';

export const unwrap =
    ({ nodeId }: { nodeId: string }) =>
    (editor: Editor) => {
        const parentId = editor.runQuery(
            (resolvedState) => resolvedState.nodes[nodeId].parentId
        ) as string;
        if (!parentId) return false;

        const granParenId = editor.runQuery(
            (resolvedState) => resolvedState.nodes[parentId].parentId
        ) as string;
        if (!granParenId) return false;

        const parent = editor.state.nodes[parentId];
        const node = editor.state.nodes[nodeId];

        const tr = editor
            .createTransaction()
            .insertAfter({
                parent: granParenId,
                after: parentId,
                node,
            })
            .removeFrom({
                parentId,
                nodeId,
            });

        const indexInParent = parent.childrenIds?.indexOf(nodeId) ?? 0;
        const childrenLength = parent.childrenIds?.length ?? 0;

        if (indexInParent < childrenLength - 1) {
            for (let i = indexInParent + 1; i < childrenLength; i++) {
                const nextSiblingId = parent.childrenIds?.[i];
                if (!nextSiblingId) continue;
                tr.removeFrom({
                    nodeId: nextSiblingId,
                    parentId,
                });
                tr.insertAfter({
                    parent: nodeId,
                    after: parent.childrenIds?.[i - 1],
                    node: editor.state.nodes[nextSiblingId],
                });
            }
        }

        if (!editor.schema[parent.type].allowText && indexInParent === 0) {
            tr.removeFrom({
                nodeId: parentId,
                parentId: granParenId,
            });
        }

        tr.dispatch();
    };
