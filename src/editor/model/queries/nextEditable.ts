import { ResolvedState } from '../StateResolver';
import { Editor } from '../Editor';
import { Node } from '../types';

export const nextEditable =
    (currentId: string) =>
    (resolvedState: ResolvedState, editor: Editor): Node | undefined => {
        const index = resolvedState.flatTree.indexOf(currentId);
        let cursorIndex = index + 1;
        while (cursorIndex < resolvedState.flatTree.length) {
            const cursorId = resolvedState.flatTree[cursorIndex];
            const cursor = resolvedState.nodes[cursorId];
            const nodeSchema = editor.schema[cursor.type];
            if (nodeSchema.allowText) return editor.state.nodes[cursorId];
            cursorIndex++;
        }
    };
