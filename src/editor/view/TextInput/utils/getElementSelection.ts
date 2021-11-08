import { getPosition } from './getPosition';
import { TextSelection } from '../../types';

export const getElementSelection = (
    container: HTMLElement | null
): TextSelection | undefined => {
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

    return {
        from: Math.min(anchorPosition ?? 0, focusPosition),
        to: Math.max(anchorPosition ?? 0, focusPosition),
    };
};
