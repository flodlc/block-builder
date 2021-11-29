import { ResolvedState } from '../StateResolver';
import { Node } from '../types';
import { Editor } from '../Editor';

export const previousEditable =
    (currentId: string) =>
    (resolvedState: ResolvedState, editor: Editor): Node | undefined => {
        const index = resolvedState.flatTree.indexOf(currentId);
        let cursorIndex = index - 1;
        while (cursorIndex >= 0) {
            const cursorId = resolvedState.flatTree[cursorIndex];
            const cursor = resolvedState.nodes[cursorId];
            const nodeSchema = editor.schema[cursor.type];
            if (nodeSchema.allowText) return editor.state.nodes[cursorId];
            cursorIndex--;
        }
    };
