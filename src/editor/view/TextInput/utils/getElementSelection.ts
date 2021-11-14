import { getPosition } from './getPosition';
import { Range } from '../../../model/Selection';

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

    const anchorPosition = selection.anchorNode
        ? getPosition({
              node: selection.anchorNode,
              offset: selection.anchorOffset,
              container,
          })
        : undefined;

    return [
        Math.min(anchorPosition ?? 0, focusPosition),
        Math.max(anchorPosition ?? 0, focusPosition),
    ];
};
