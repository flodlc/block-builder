import { getTextNodes } from './getTextNodes';

export const getPosition = ({
    container,
    node,
    offset,
}: {
    container: Element;
    node: Node;
    offset: number;
}) => {
    const range = new Range();
    range.setStart(container, 0);
    range.setEnd(node, offset);
    const fragment = range.cloneContents();

    const nodes = getTextNodes({ node: fragment });
    let position = 0;
    for (const child of nodes) {
        if (child.nodeType === 3) {
            if (child.isSameNode(node)) {
                return offset + position;
            } else {
                position += child?.textContent?.length ?? 0;
            }
        } else {
            if ((child as HTMLElement).matches('[contenteditable="false"]')) {
                position += 1;
            }
        }
    }
    return position;
};
