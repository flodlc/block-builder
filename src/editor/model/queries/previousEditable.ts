import { ResolvedState } from '../NodesExplorer';
import { Node, State } from '../types';

export const previousEditable =
    (currentId: string) =>
    (resolvedState: ResolvedState, state: State): Node | undefined => {
        const index = resolvedState.flatTree.indexOf(currentId);
        let cursorIndex = index - 1;
        while (cursorIndex >= 0) {
            const cursorId = resolvedState.flatTree[cursorIndex];
            const cursor = resolvedState.nodes[cursorId];
            if (cursor.type === 'text' || cursor.type === 'toggle')
                return state.nodes[cursorId];
            cursorIndex--;
        }
    };
