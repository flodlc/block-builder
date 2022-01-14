import { getPosition } from './getPosition';
import { Range } from '../../../model';

export const getElementSelection = (
    container: HTMLElement | null
): Range | undefined => {
    const selection = document.getSelection();
    const focusNode = selection?.focusNode;
    if (
        !container ||
        !focusNode ||
        !container.parentElement?.contains(focusNode)
    )
        return;

    const focusPosition = getPosition({
        node: focusNode,
        offset: selection.focusOffset,
        container,
    });

    let anchorPosition = focusPosition;

    if (!selection.isCollapsed && selection.anchorNode) {
        anchorPosition = getPosition({
            node: selection.anchorNode,
            offset: selection.anchorOffset,
            container,
        });
    }

    return [
        Math.min(anchorPosition ?? 0, focusPosition),
        Math.max(anchorPosition ?? 0, focusPosition),
    ];
};
